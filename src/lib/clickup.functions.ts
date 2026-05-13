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

export const getClickUpConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getConnectionStatus(context.userId, context.supabase);
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
