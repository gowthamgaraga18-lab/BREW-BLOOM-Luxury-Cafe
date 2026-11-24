"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Check, X, Users, Clock, Calendar } from "lucide-react";
import { useAdminReservations, QUERY_KEYS } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-champagne/20 text-mocha",
  confirmed: "bg-olive/15 text-olive",
  cancelled: "bg-red-100 text-red-700",
};

export function ReservationsPanel() {
  const { data: reservations, isLoading } = useAdminReservations();
  const qc = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminReservations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminStats });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl text-espresso">Reservations</h2>
        <p className="text-sm text-muted-foreground">{reservations?.length ?? 0} total bookings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-sm border border-border bg-card" />)
        ) : (reservations ?? []).length === 0 ? (
          <div className="col-span-full rounded-sm border border-border bg-card p-10 text-center text-muted-foreground">No reservations yet.</div>
        ) : (
          (reservations ?? []).map((r: Reservation) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-sm border border-border bg-card p-5 shadow-luxe">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg text-espresso">{r.name}</h3>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] capitalize", STATUS_COLORS[r.status])}>{r.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col items-center gap-1 rounded-sm bg-secondary/50 py-2">
                  <Calendar className="size-3.5 text-mocha" />
                  <span className="text-espresso">{r.date}</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-sm bg-secondary/50 py-2">
                  <Clock className="size-3.5 text-mocha" />
                  <span className="text-espresso">{r.time}</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-sm bg-secondary/50 py-2">
                  <Users className="size-3.5 text-mocha" />
                  <span className="text-espresso">{r.guests}</span>
                </div>
              </div>
              {r.specialRequests && (
                <p className="font-editorial text-sm text-mocha italic">“{r.specialRequests}”</p>
              )}
              <p className="text-xs text-muted-foreground">{r.phone}</p>
              <div className="flex gap-2 border-t border-border pt-3">
                <button
                  onClick={() => { mutation.mutate({ id: r.id, status: "confirmed" }); toast({ title: "Reservation confirmed" }); }}
                  disabled={r.status === "confirmed" || mutation.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-olive/15 py-2 text-xs text-olive hover:bg-olive/25 disabled:opacity-40"
                >
                  <Check className="size-3.5" /> Confirm
                </button>
                <button
                  onClick={() => { mutation.mutate({ id: r.id, status: "cancelled" }); toast({ title: "Reservation cancelled" }); }}
                  disabled={r.status === "cancelled" || mutation.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-red-50 py-2 text-xs text-red-700 hover:bg-red-100 disabled:opacity-40"
                >
                  <X className="size-3.5" /> Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
