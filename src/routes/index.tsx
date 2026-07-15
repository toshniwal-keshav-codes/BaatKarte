import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    navigate({ to: user ? "/inbox" : "/login", replace: true });
  }, [hydrated, user, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#08070f] text-white">
      <div className="flex items-center gap-3">
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <span className="text-sm text-white/60">Loading BaatKarte…</span>
      </div>
    </div>
  );
}
