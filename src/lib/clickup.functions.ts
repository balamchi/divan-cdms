// Thin file: only createServerFn declarations + their imports.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  exchangeAndStoreCode,
  getConnectionStatus,
  syncList,
  VIVIA_RIU_DEFAULT_LIST_ID,
} from "./clickup.server";

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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin
        .from("clickup_tasks_cache")
        .select("task_id,name,subject,description,kind,status,publish_date,assignees,company_id")
        .eq("company_id", data.company_id);
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
