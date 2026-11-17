'use client';
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkSessionStatus } from "@/lib/session";
import { queryClient } from "@/lib/queryClient";

/**
 * Enforces "one session per user" in an open tab: polls the server and
 * re-checks whenever the tab regains focus. When another sign-in has replaced
 * this browser's session (or it expired), it leaves the app immediately.
 */
const SessionGuard = () => {
  const leaving = useRef(false);

  const { data } = useQuery({
    queryKey: ["session-status"],
    queryFn: () => checkSessionStatus(),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (!data || data.status === "active" || leaving.current) return;
    leaving.current = true;
    queryClient.clear();
    const target = data.status === "replaced" ? "/?signedOut=elsewhere" : "/";
    // Hard navigation so no in-memory state from the old session survives.
    window.location.replace(target);
  }, [data]);

  return null;
};

export default SessionGuard;
