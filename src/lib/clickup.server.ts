// Server-only helpers for ClickUp OAuth + sync. Never import from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { encryptToken, decryptToken } from "./clickup-crypto.server";

export const VIVIA_RIU_DEFAULT_LIST_ID = "901416054141";

export async function getAppUserId(supabase: any, authUserId: string): Promise<string> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("App user not found for current session");
  return data.id as string;
}

export async function exchangeAndStoreCode(authUserId: string, supabase: any, code: string) {
  const clientId = process.env.CLICKUP_CLIENT_ID;
  const clientSecret = process.env.CLICKUP_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("ClickUp credentials not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
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

  const userId = await getAppUserId(supabase, authUserId);
  const encrypted = encryptToken(json.access_token);
  const { error } = await supabaseAdmin.from("clickup_tokens").upsert(
    {
      user_id: userId,
      access_token: encrypted,
      connected_at: new Date().toISOString(),
      last_used_at: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

export async function getConnectionStatus(authUserId: string, supabase: any) {
  const userId = await getAppUserId(supabase, authUserId);
  const { data } = await supabaseAdmin
    .from("clickup_tokens")
    .select("user_id, connected_at, last_used_at")
    .eq("user_id", userId)
    .maybeSingle();
  return { connected: !!data, connected_at: data?.connected_at ?? null };
}

interface ClickUpCustomField {
  name: string;
  value?: any;
  type_config?: { options?: { id: string; name: string; orderindex?: number }[] };
}

function readCustomField(fields: ClickUpCustomField[] | undefined, name: string): any {
  if (!fields) return null;
  const f = fields.find((x) => x.name?.toLowerCase() === name.toLowerCase());
  if (!f) return null;
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

export async function syncList(authUserId: string, supabase: any, listId: string) {
  console.log("[syncList] start. listId=", listId, "authUserId=", authUserId);
  const userId = await getAppUserId(supabase, authUserId);
  console.log("[syncList] resolved app userId=", userId);

  const { data: tok, error: tokErr } = await supabaseAdmin
    .from("clickup_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .maybeSingle();
  if (tokErr) throw new Error(tokErr.message);
  console.log("[syncList] token present?", !!tok);
  if (!tok) throw new Error("ClickUp not connected. Click Connect ClickUp in the header.");

  const accessToken = decryptToken(tok.access_token);
  const auth = { Authorization: accessToken };

  const tasks: any[] = [];
  for (let page = 0; page < 20; page++) {
    const url = `https://api.clickup.com/api/v2/list/${encodeURIComponent(listId)}/task?include_closed=true&page=${page}`;
    const r = await fetch(url, { headers: auth });
    console.log(`[syncList] GET list/${listId}/task page=${page} status=${r.status}`);
    if (!r.ok) {
      const t = await r.text();
      console.error("[syncList] list fetch error body:", t.slice(0, 500));
      throw new Error(`ClickUp list fetch failed (${r.status}): ${t.slice(0, 200)}`);
    }
    const j = (await r.json()) as { tasks?: any[] };
    const batch = j.tasks ?? [];
    console.log(`[syncList] page=${page} returned ${batch.length} tasks`);
    tasks.push(...batch);
    if (batch.length < 100) break;
  }
  console.log("[syncList] total tasks fetched:", tasks.length);

  const folderIds = Array.from(new Set(tasks.map((t) => t?.folder?.id).filter(Boolean)));
  console.log("[syncList] unique folderIds from tasks:", folderIds);
  const companyByFolder = new Map<string, string>();
  if (folderIds.length > 0) {
    const { data: companies, error: cErr } = await supabaseAdmin
      .from("companies")
      .select("id, clickup_folder_id")
      .in("clickup_folder_id", folderIds as string[]);
    console.log("[syncList] companies matched:", companies, "err:", cErr);
    for (const c of companies ?? []) {
      if (c.clickup_folder_id) companyByFolder.set(c.clickup_folder_id, c.id);
    }
  }

  const rows: any[] = [];
  for (const t of tasks) {
    console.log("[syncList] task", t.id, t.name, "folder=", t?.folder?.id);
    const detailRes = await fetch(
      `https://api.clickup.com/api/v2/task/${encodeURIComponent(t.id)}`,
      { headers: auth },
    );
    const detail = detailRes.ok ? await detailRes.json() : t;
    const fields: ClickUpCustomField[] = detail.custom_fields ?? [];
    const row = {
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
    };
    console.log("[syncList] row to upsert:", {
      task_id: row.task_id,
      folder_id: row.folder_id,
      company_id: row.company_id,
      name: row.name,
      status: row.status,
    });
    rows.push(row);
  }

  console.log("[syncList] about to upsert rows.length=", rows.length);
  if (rows.length > 0) {
    const { error: upErr, data: upData } = await supabaseAdmin
      .from("clickup_tasks_cache")
      .upsert(rows, { onConflict: "task_id" })
      .select("task_id");
    console.log("[syncList] upsert result. err:", upErr, "rowsReturned:", upData?.length);
    if (upErr) throw new Error(upErr.message);
  }

  await supabaseAdmin
    .from("clickup_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("user_id", userId);

  console.log("[syncList] returning count=", rows.length);

  return { success: true, count: rows.length, synced: rows.length, list_id: listId };
}
