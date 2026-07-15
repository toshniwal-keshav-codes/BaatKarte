import type { ReactNode } from "react";
import { MessagesSquare, Sparkles, ShieldCheck } from "lucide-react";

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen w-full bg-[#08070f] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden lg:block">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1000px 600px at 15% 10%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(800px 500px at 90% 90%, rgba(18,181,201,0.28), transparent 60%), linear-gradient(180deg,#0a0916,#08070f)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-white/10 backdrop-blur">
                <MessagesSquare className="size-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">BaatKarte</span>
            </div>

            <div className="max-w-md">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                Conversations that <span className="italic text-white/70">matter.</span>
              </h2>
              <p className="mt-4 text-white/60">
                Real-time, private one-to-one messaging. No passwords, no noise — just a code to your inbox.
              </p>

              <ul className="mt-10 space-y-4 text-sm text-white/70">
                <li className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-emerald-300" /> Passwordless & phishing-resistant
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="size-4 text-fuchsia-300" /> Beautiful, distraction-free UI
                </li>
              </ul>
            </div>

            <p className="text-xs text-white/40">© {new Date().getFullYear()} BaatKarte</p>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="grid size-9 place-items-center rounded-xl bg-white/10">
                <MessagesSquare className="size-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">BaatKarte</span>
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>

            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1 duration-200">
      {message}
    </p>
  );
}

export function AuthInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string },
) {
  const { label, error, className, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/70">{label}</span>
      <input
        {...rest}
        className={
          "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition " +
          "focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/5 " +
          (error ? "border-rose-400/60" : "border-white/10 hover:border-white/20") +
          (className ? " " + className : "")
        }
      />
      <FieldError message={error} />
    </label>
  );
}

export function PrimaryButton({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={
        "group relative w-full overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 " +
        (props.className || "")
      }
      style={{
        background:
          "linear-gradient(135deg, oklch(0.65 0.22 295), oklch(0.72 0.18 220))",
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {children}
      </span>
    </button>
  );
}