import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) {
      if (!user) {
        navigate("/login");
      } else if (user.role !== "admin") {
        navigate("/inbox");
      }
    }
  }, [hydrated, user, navigate]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#08070f] p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-16 rounded-2xl bg-white/10" />
          <Skeleton className="h-6 w-48 bg-white/10" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#08070f] p-6 text-center text-white">
        <div className="grid size-16 place-items-center rounded-2xl bg-destructive/10 border border-destructive/20 mb-4 text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-white/50 max-w-sm">
          You do not have administrator privileges to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
