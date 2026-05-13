import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { exchangeClickUpCode } from "@/lib/clickup.functions";

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
    exchange({ data: { code } })
      .then(() => {
        toast.success("ClickUp connected");
        navigate({ to: "/workspace" });
      })
      .catch((e: any) => {
        toast.error(e?.message ?? "ClickUp connection failed");
        navigate({ to: "/workspace" });
      });
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
