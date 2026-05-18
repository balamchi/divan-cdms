// Thin file: only createServerFn declarations + their imports.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  exchangeAndStoreCode,
  getConnectionStatus,
  syncList,
  syncAllFolders,
  syncOneFolderImpl,
  getAppUserId,
  getAdminClickUpToken,
  VIVIA_RIU_DEFAULT_LIST_ID,
} from "./clickup.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public-tolerant: returns { connected: false } when the caller has no auth,
// so the client can render a "Connect" affordance without a thrown 401 Response
// blanking the screen via TanStack's RPC error path.
export const getClickUpConnection = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const { createClient } = await import("@supabase/supabase-js");
      const req = getRequest();
      const authHeader = req?.headers?.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) return { connected: false };
      const token = authHeader.slice(7);
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key || !token) return { connected: false };
      const supabase = createClient(url, key, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: claims } = await supabase.auth.getClaims(token);
      const sub = claims?.claims?.sub;
      if (!sub) return { connected: false };
      return await getConnectionStatus(sub, supabase);
    } catch (e) {
      console.error("getClickUpConnection error", e);
      return { connected: false };
    }
  });

// Public-tolerant read of cached ClickUp tasks for a single company.
// Currently whitelisted to the Vivia Riu pilot company so demo (unauthed)
// users can preview real synced data without weakening RLS for other tenants.
const VIVIA_COMPANY_UUID = "fb5bcc0c-666e-437f-abd0-8a1507b30c99";
export const getPortalTasks = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ company_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      if (data.company_id !== VIVIA_COMPANY_UUID) return { tasks: [] };
      // Lists clients are allowed to see in the portal. Anything else stays
      // internal to the team.
      const VISIBLE_TO_CLIENT_LIST_PATTERNS = [
        "📅 C-",
        "📱 S-",
        "👤 Lead Tracking",
        "📊 Reports",
        "🤝 Strategy and Meetings",
      ];
      const orClause = VISIBLE_TO_CLIENT_LIST_PATTERNS
        .map((p) => `list_name.ilike.${p}%`)
        .join(",");
      const { data: rows, error } = await supabaseAdmin
        .from("clickup_tasks_cache")
        .select(
          "task_id,name,subject,description,kind,status,publish_date,assignees,company_id,list_name",
        )
        .eq("company_id", data.company_id)
        .or(orClause);
      if (error) {
        console.error("getPortalTasks error", error);
        return { tasks: [] };
      }
      return { tasks: rows ?? [] };
    } catch (e) {
      console.error("getPortalTasks failed", e);
      return { tasks: [] };
    }
  });

// Public: returns the ClickUp authorize URL. Auth is enforced when the
// callback exchanges the code, not here, so demo role-switched users can
// initiate the flow and be prompted to sign in on return.
export const getClickUpAuthorizeUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ redirect_uri: z.string().url().max(500) }).parse(input),
  )
  .handler(async ({ data }) => {
    const clientId = process.env.CLICKUP_CLIENT_ID;
    if (!clientId) throw new Error("CLICKUP_CLIENT_ID not configured");
    const url = `https://app.clickup.com/api?client_id=${encodeURIComponent(
      clientId,
    )}&redirect_uri=${encodeURIComponent(data.redirect_uri)}`;
    return { url };
  });

export const exchangeClickUpCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().min(1).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    await exchangeAndStoreCode(context.userId, context.supabase, data.code);
    return { ok: true };
  });

export const syncClickUpList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ list_id: z.string().min(1).max(64).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const listId = data.list_id || VIVIA_RIU_DEFAULT_LIST_ID;
    return syncList(context.userId, context.supabase, listId);
  });

// Admin-gated: run the full multi-folder sync on demand.
export const syncAllClickUpFolders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: appUser } = await context.supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", context.userId)
      .maybeSingle();
    if (appUser?.role !== "admin") {
      throw new Error("Only admins can trigger full workspace sync");
    }
    return syncAllFolders(context.supabase, context.userId);
  });

// Approve / request-changes on a synced ClickUp task. Writes an approvals
// row, updates the cached task row, and best-effort pushes the new status
// (and the change-request note as a comment) back to ClickUp using the
// admin's OAuth token.
export const createApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        task_id: z.string().min(1).max(64),
        action: z.enum(["approved", "changes_requested"]),
        note: z.string().max(1000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (
      data.action === "changes_requested" &&
      (!data.note || data.note.trim().length < 10)
    ) {
      throw new Error("Note required when requesting changes (minimum 10 characters)");
    }

    const userId = await getAppUserId(context.supabase, context.userId);

    const { error: insertErr } = await supabaseAdmin
      .from("approvals")
      .insert({
        task_id: data.task_id,
        user_id: userId,
        action: data.action,
        note: data.note ?? null,
      });
    if (insertErr) throw new Error(insertErr.message);

    console.log("[createApproval] approvals row inserted for task", data.task_id);

    const adminToken = await getAdminClickUpToken();
    if (!adminToken) {
      console.error("[createApproval] NO ADMIN TOKEN — ClickUp push skipped");
      return { ok: true, statusUpdated: false, reason: "no_admin_token" as const };
    }
    console.log("[createApproval] admin token resolved, length:", adminToken.length);

    const newStatus = data.action === "approved" ? "approved" : "in progress";
    console.log("[createApproval] PUT task status:", data.task_id, "→", newStatus);

    let statusUpdated = false;
    try {
      const statusRes = await fetch(
        `https://api.clickup.com/api/v2/task/${encodeURIComponent(data.task_id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: adminToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      console.log("[createApproval] PUT status response:", statusRes.status);
      if (!statusRes.ok) {
        const text = await statusRes.text();
        console.error(
          "[createApproval] ClickUp status update FAILED:",
          statusRes.status,
          text.slice(0, 300),
        );
      } else {
        statusUpdated = true;
        console.log("[createApproval] ClickUp status updated successfully");
      }
    } catch (e: any) {
      console.error("[createApproval] PUT request threw:", e?.message ?? e);
    }

    if (data.action === "changes_requested" && data.note) {
      try {
        const commentRes = await fetch(
          `https://api.clickup.com/api/v2/task/${encodeURIComponent(data.task_id)}/comment`,
          {
            method: "POST",
            headers: {
              Authorization: adminToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              comment_text: `[Client requested changes via CDMS]\n\n${data.note}`,
            }),
          },
        );
        console.log("[createApproval] POST comment response:", commentRes.status);
      } catch (e: any) {
        console.error("[createApproval] comment request threw:", e?.message ?? e);
      }
    }

    await supabaseAdmin
      .from("clickup_tasks_cache")
      .update({ status: newStatus, last_synced_at: new Date().toISOString() })
      .eq("task_id", data.task_id);

    return { ok: true, statusUpdated, status: newStatus };
  });

// Admin-gated: sync a single folder's lists. Designed to complete in <30s
// (one folder ≈ 12 lists × 20 tasks) so the client can loop folder-by-folder
// without hitting the Cloudflare Worker request timeout.
export const syncOneFolder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ folder_id: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: appUser } = await context.supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", context.userId)
      .maybeSingle();
    if (appUser?.role !== "admin") {
      throw new Error("Only admins can sync");
    }
    return syncOneFolderImpl(context.supabase, context.userId, data.folder_id);
  });

// Admin-gated: list active companies with a ClickUp folder, used to drive
// the per-folder client loop in Console.
export const listActiveCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: appUser } = await context.supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", context.userId)
      .maybeSingle();
    if (appUser?.role !== "admin") throw new Error("Forbidden");
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, clickup_folder_id")
      .eq("active", true)
      .not("clickup_folder_id", "is", null)
      .order("name");
    if (error) throw new Error(error.message);
    return { companies: companies ?? [] };
  });

// ----- Messaging -----

export const getMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ company_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = await getAppUserId(context.supabase, context.userId);
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("role, company_id")
      .eq("id", userId)
      .maybeSingle();

    const canSee =
      user?.role === "admin" ||
      user?.role === "team" ||
      (user?.role === "client" && user.company_id === data.company_id);
    if (!canSee) throw new Error("Forbidden");

    const { data: rows, error } = await supabaseAdmin
      .from("messages")
      .select(
        "id, body, from_user_id, created_at, read_at, users:from_user_id(full_name, role)",
      )
      .eq("company_id", data.company_id)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);

    return { messages: rows ?? [], currentUserId: userId };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        company_id: z.string().uuid(),
        body: z.string().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = await getAppUserId(context.supabase, context.userId);

    // Permission check mirrors getMessages.
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("role, company_id")
      .eq("id", userId)
      .maybeSingle();
    const canPost =
      user?.role === "admin" ||
      user?.role === "team" ||
      (user?.role === "client" && user.company_id === data.company_id);
    if (!canPost) throw new Error("Forbidden");

    const { error } = await supabaseAdmin.from("messages").insert({
      company_id: data.company_id,
      from_user_id: userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// List companies that the current team/admin user has any message activity
// with. Used by the workspace inbox sidebar.
export const listMessageCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = await getAppUserId(context.supabase, context.userId);
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (user?.role !== "admin" && user?.role !== "team") {
      throw new Error("Forbidden");
    }
    const { data: companies, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, logo_url")
      .eq("active", true)
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return { companies: companies ?? [] };
  });
