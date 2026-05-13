import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { exchangeClickUpCode } from "@/lib/clickup.functions";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_THEME, setActiveRole, type Role } from "@/lib/roles";

export const Route = createFileRoute("/clickup/callback")({
  component: ClickUpCallback,
  head: () => ({
    meta: [{ title: "Connecting ClickUp · Divan CDMS" }],
  }),
});

function ClickUpCallback() {
  const navigate = useNavigate();
  const exchange = useServerFn(exchangeClickUpCode);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errParam = params.get("error");
    if (errParam) {
      toast.error(`ClickUp: ${errParam}`);
      navigate({ to: "/workspace" });
      return;
    }
    if (!code) {
      toast.error("Missing authorization code from ClickUp");
      navigate({ to: "/workspace" });
      return;
    }
    (async () => {
      try {
        await exchange({ data: { code } });
        toast.success("ClickUp connected");
        const { data: { session } } = await supabase.auth.getSession();
        let role: Role = "team";
        if (session?.user?.email) {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("email", session.user.email)
            .maybeSingle();
          if (data?.role) role = data.role as Role;
        }
        setActiveRole(role);
        navigate({ to: ROLE_THEME[role].route });
      } catch (e: any) {
        const msg = e?.message ?? "ClickUp connection failed";
        if (/unauthorized/i.test(String(msg))) {
          toast.error("Sign in first to finish connecting ClickUp");
          navigate({ to: "/login" });
        } else {
          toast.error(msg);
          navigate({ to: "/workspace" });
        }
      }
    })();
  }, [exchange, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="text-center">
        <div className="text-[14px] font-medium mb-1">Connecting to ClickUp…</div>
        <div className="text-[12px] text-text-secondary">One moment.</div>
      </div>
    </div>
  );
}
