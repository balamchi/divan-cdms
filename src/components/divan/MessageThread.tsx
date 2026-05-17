import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getMessages, sendMessage } from "@/lib/clickup.functions";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  body: string;
  from_user_id: string;
  created_at: string;
  read_at: string | null;
  users: { full_name: string | null; role: string } | null;
}

interface MessageThreadProps {
  companyId: string;
  currentUserRole: "client" | "team" | "admin";
  teamNameOverride?: string;
}

const initialsOf = (name: string | null | undefined, fallback = "?") => {
  if (!name) return fallback;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || fallback;
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export function MessageThread({
  companyId,
  currentUserRole,
  teamNameOverride,
}: MessageThreadProps) {
  const fetchMessages = useServerFn(getMessages);
  const postMessage = useServerFn(sendMessage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchMessages({ data: { company_id: companyId } });
        if (cancelled) return;
        setMessages(res.messages as Message[]);
        setCurrentUserId(res.currentUserId ?? null);
      } catch (e) {
        console.error("MessageThread load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `company_id=eq.${companyId}`,
        },
        async (payload) => {
          const row = payload.new as any;
          if (!row?.id) return;
          // Skip if it's our own message (already inserted optimistically)
          if (currentUserId && row.from_user_id === currentUserId) return;
          // Fetch the joined user info
          const { data: sender } = await supabase
            .from("users")
            .select("full_name, role")
            .eq("id", row.from_user_id)
            .maybeSingle();
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    body: row.body,
                    from_user_id: row.from_user_id,
                    created_at: row.created_at,
                    read_at: row.read_at,
                    users: sender ?? null,
                  },
                ],
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, currentUserId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await postMessage({ data: { company_id: companyId, body: trimmed } });
      setBody("");
      // Refetch to get the inserted row with joined sender info
      const res = await fetchMessages({ data: { company_id: companyId } });
      setMessages(res.messages as Message[]);
    } catch (e) {
      console.error("send failed", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        background: "var(--card)",
        height: 480,
      }}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-[13px] text-text-secondary text-center mt-8">
            No messages yet. Start the conversation.
          </p>
        ) : (
          messages.map((m) => {
            const isClientMsg = m.users?.role === "client";
            const isTeamMsg = !isClientMsg;
            const displayName =
              isTeamMsg && teamNameOverride
                ? teamNameOverride
                : m.users?.full_name ?? "Unknown";
            const initials =
              isTeamMsg && teamNameOverride
                ? "DT"
                : initialsOf(m.users?.full_name);
            const isOwn = currentUserId && m.from_user_id === currentUserId;

            return (
              <div key={m.id} className="flex items-start gap-3">
                <div
                  className="h-8 w-8 rounded-full grid place-items-center shrink-0 text-[11px] font-medium"
                  style={{
                    background: isTeamMsg
                      ? "var(--magenta-soft)"
                      : "var(--teal-soft)",
                    color: isTeamMsg ? "var(--magenta)" : "var(--teal)",
                  }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-medium text-text-primary">
                      {displayName}
                      {isOwn ? " (you)" : ""}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {fmtTime(m.created_at)}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-primary mt-0.5 whitespace-pre-wrap break-words">
                    {m.body}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        className="flex items-end gap-2 p-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={
            currentUserRole === "client"
              ? "Message the Divan team…"
              : "Reply…"
          }
          className="flex-1 resize-none rounded-md px-3 py-2 text-[14px] outline-none"
          style={{
            border: "1px solid var(--border)",
            background: "var(--background)",
            color: "var(--foreground)",
            maxHeight: 120,
          }}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!body.trim() || sending}
          className="h-9 px-3 rounded-md text-[13px] font-medium inline-flex items-center gap-1.5 transition-opacity disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.8} />
          Send
        </button>
      </div>
    </div>
  );
}
