// ClickUp OAuth + sync server functions.
// IMPORTANT: thin file — only createServerFn declarations + their imports,
// per the supabase-import-graph rule.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { encryptToken, decryptToken } from "./clickup-crypto.server";

export const VIVIA_RIU_DEFAULT_LIST_ID = "901416054141";

async function getAppUserId(supabase: any, authUserId: string): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("App user not found for current session");
  return data.id as string;
}

export const getClickUpConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await getAppUserId(context.supabase, context.userId);
    const { data } = await supabaseAdmin
      .from("clickup_tokens")
      .select("user_id, connected_at, last_used_at")
      .eq("user_id", userId)
      .maybeSingle();
    return { connected: !!data, connected_at: data?.connected_at ?? null };
  });

export const exchangeClickUpCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(1).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const clientId = process.env.CLICKUP_CLIENT_ID;
    const clientSecret = process.env.CLICKUP_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("ClickUp credentials not configured");

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: data.code,
    });

    const res = await fetch("https://api.clickup.com/api/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("ClickUp token exchange failed", res.status, text);
      throw new Error(`ClickUp token exchange failed (${res.status})`);
    }
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) throw new Error("No access_token in ClickUp response");

    const userId = await getAppUserId(context.supabase, context.userId);
    const encrypted = encryptToken(json.access_token);
    const { error } = await supabaseAdmin
      .from("clickup_tokens")
      .upsert(
        { user_id: userId, access_token: encrypted, connected_at: new Date().toISOString(), last_used_at: null },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

interface ClickUpCustomField {
  name: string;
  value?: any;
  type_config?: { options?: { id: string; name: string; orderindex?: number }[] };
}

function readCustomField(fields: ClickUpCustomField[] | undefined, name: string): any {
  if (!fields) return null;
  const f = fields.find((x) => x.name?.toLowerCase() === name.toLowerCase());
  if (!f) return null;
  // dropdown: value is option id (string) or orderindex (number)
  if (f.type_config?.options && (typeof f.value === "string" || typeof f.value === "number")) {
    const opt = f.type_config.options.find(
      (o) => o.id === f.value || o.orderindex === f.value,
    );
    if (opt) return opt.name;
  }
  return f.value ?? null;
}

function toIso(ts: any): string | null {
  if (!ts) return null;
  const n = typeof ts === "string" ? Number(ts) : ts;
  if (!Number.isFinite(n)) return null;
  return new Date(n).toISOString();
}

export const syncClickUpList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ list_id: z.string().min(1).max(64).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const listId = data.list_id || VIVIA_RIU_DEFAULT_LIST_ID;
    const userId = await getAppUserId(context.supabase, context.userId);

    const { data: tok, error: tokErr } = await supabaseAdmin
      .from("clickup_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .maybeSingle();
    if (tokErr) throw new Error(tokErr.message);
    if (!tok) throw new Error("ClickUp not connected. Click Connect ClickUp in the header.");

    const accessToken = decryptToken(tok.access_token);
    const auth = { Authorization: accessToken };

    // 1. List tasks (pages of 100)
    const tasks: any[] = [];
    for (let page = 0; page < 20; page++) {
      const url = `https://api.clickup.com/api/v2/list/${encodeURIComponent(listId)}/task?include_closed=true&page=${page}`;
      const r = await fetch(url, { headers: auth });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`ClickUp list fetch failed (${r.status}): ${t.slice(0, 200)}`);
      }
      const j = (await r.json()) as { tasks?: any[] };
      const batch = j.tasks ?? [];
      tasks.push(...batch);
      if (batch.length < 100) break;
    }

    // 2. Lookup company by folder
    const folderIds = Array.from(new Set(tasks.map((t) => t?.folder?.id).filter(Boolean)));
    const companyByFolder = new Map<string, string>();
    if (folderIds.length > 0) {
      const { data: companies } = await supabaseAdmin
        .from("companies")
        .select("id, clickup_folder_id")
        .in("clickup_folder_id", folderIds as string[]);
      for (const c of companies ?? []) {
        if (c.clickup_folder_id) companyByFolder.set(c.clickup_folder_id, c.id);
      }
    }

    // 3. Fetch full details for each task (custom fields)
    const rows: any[] = [];
    for (const t of tasks) {
      const detailRes = await fetch(
        `https://api.clickup.com/api/v2/task/${encodeURIComponent(t.id)}`,
        { headers: auth },
      );
      const detail = detailRes.ok ? await detailRes.json() : t;
      const fields: ClickUpCustomField[] = detail.custom_fields ?? [];
      rows.push({
        task_id: detail.id,
        list_id: detail.list?.id ?? listId,
        folder_id: detail.folder?.id ?? null,
        company_id: detail.folder?.id ? companyByFolder.get(detail.folder.id) ?? null : null,
        name: detail.name ?? null,
        subject: readCustomField(fields, "Subject") ?? detail.name ?? null,
        kind: readCustomField(fields, "Kind"),
        publish_date: toIso(readCustomField(fields, "Publish Date")),
        status: detail.status?.status ?? null,
        assignees: detail.assignees ?? [],
        due_date: toIso(detail.due_date),
        description: detail.description ?? null,
        attachments: detail.attachments ?? [],
        url: detail.url ?? null,
        last_synced_at: new Date().toISOString(),
      });
    }

    if (rows.length > 0) {
      const { error: upErr } = await supabaseAdmin
        .from("clickup_tasks_cache")
        .upsert(rows, { onConflict: "task_id" });
      if (upErr) throw new Error(upErr.message);
    }

    await supabaseAdmin
      .from("clickup_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", userId);

    return { synced: rows.length, list_id: listId };
  });
