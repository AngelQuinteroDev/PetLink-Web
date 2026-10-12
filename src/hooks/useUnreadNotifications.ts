import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Cuenta de notificaciones sin leer con actualización en tiempo real. */
export function useUnreadNotifications(): number {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function count() {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      if (mounted) setUnread(count ?? 0);
    }
    void count();
    const channel = supabase
      .channel(`unread-notifications-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => void count()
      )
      .subscribe();
    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  return unread;
}
