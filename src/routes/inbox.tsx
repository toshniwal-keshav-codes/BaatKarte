import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, MessagesSquare } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — BaatKarte" },
      { name: "description", content: "Your private conversations on BaatKarte." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
  }, [hydrated, user, navigate]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clear();
      toast.success("Signed out.");
      navigate({ to: "/login" });
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#08070f] text-white">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-white/10">
            <MessagesSquare className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">BaatKarte</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="font-medium">{user.name}</div>
            <div className="text-white/50">@{user.username}</div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Signed in</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-3 text-white/60">
            Your inbox will live here. The authentication module is fully wired — up next: contacts, conversations, and real-time messaging.
          </p>
        </div>
      </main>
    </div>
  );
}