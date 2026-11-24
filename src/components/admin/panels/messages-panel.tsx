"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Mail, Trash2, MailOpen, Circle } from "lucide-react";
import { useAdminMessages, QUERY_KEYS } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function MessagesPanel() {
  const { data: messages, isLoading } = useAdminMessages();
  const qc = useQueryClient();
  const { toast } = useToast();

  const toggle = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      if (!res.ok) throw new Error("Could not update");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.adminMessages }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminMessages });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
      toast({ title: "Message deleted" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl text-espresso">Messages</h2>
        <p className="text-sm text-muted-foreground">
          {messages?.length ?? 0} total · {(messages ?? []).filter((m: any) => !m.read).length} unread
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-sm border border-border bg-card" />
        ) : (messages ?? []).length === 0 ? (
          <div className="rounded-sm border border-border bg-card p-10 text-center text-muted-foreground">No messages yet.</div>
        ) : (
          (messages ?? []).map((m: any) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-3 rounded-sm border bg-card p-5 shadow-luxe",
                m.read ? "border-border" : "border-mocha/40 bg-mocha/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-mocha">
                    {m.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                  </div>
                  <div>
                    <h3 className="font-display text-base text-espresso">{m.subject}</h3>
                    <p className="text-xs text-muted-foreground">{m.name} · {m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!m.read && <Circle className="size-2 fill-mocha text-mocha" />}
                  <button
                    onClick={() => toggle.mutate({ id: m.id, read: !m.read })}
                    aria-label={m.read ? "Mark unread" : "Mark read"}
                    className="flex size-8 items-center justify-center text-mocha hover:bg-secondary"
                  >
                    {m.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this message?")) remove.mutate(m.id); }}
                    aria-label="Delete"
                    className="flex size-8 items-center justify-center text-mocha hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="font-editorial text-base leading-relaxed text-mocha">{m.message}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
