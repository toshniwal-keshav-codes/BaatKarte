import type { ReactNode } from "react";
import { MessagesSquare, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen w-full bg-[#040303] text-[#BEB0A7] font-sans antialiased selection:bg-[#8B9D83]/30 selection:text-[#BEB0A7]">
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden lg:col-span-5 lg:flex flex-col justify-between p-12 border-r border-[#BEB0A7]/10 bg-gradient-to-b from-[#0A0D0C] to-[#040303]">
          {/* Subtle glow orb background */}
          <div
            className="pointer-events-none absolute -left-20 -top-20 size-[500px] rounded-full blur-[140px] opacity-25"
            style={{ background: "radial-gradient(circle, #3A4E48 0%, #8B9D83 100%)" }}
          />
          <div
            className="pointer-events-none absolute -right-20 -bottom-20 size-[400px] rounded-full blur-[120px] opacity-15"
            style={{ background: "radial-gradient(circle, #6A7B76 0%, transparent 70%)" }}
          />

          <div className="relative z-10 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#3A4E48]/40 border border-[#8B9D83]/30 shadow-lg shadow-[#040303]/50">
              <MessagesSquare className="size-5 text-[#8B9D83]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#BEB0A7]">BaatKarte</span>
          </div>

          <div className="relative z-10 max-w-md my-auto py-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#8B9D83]/20 bg-[#3A4E48]/20 px-3.5 py-1 text-xs font-medium text-[#8B9D83] backdrop-blur-md mb-6">
                <Zap className="size-3.5" /> Next-gen SaaS Messaging
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                Conversations designed for <span className="text-[#8B9D83]">focus.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#BEB0A7]/70">
                Real-time, encrypted, passwordless messaging engineered for clarity. Zero clutter, zero noise.
              </p>

              <div className="mt-10 space-y-4 text-sm">
                <div className="flex items-center gap-3.5 rounded-xl border border-[#BEB0A7]/10 bg-[#0A0C0B]/60 p-3.5 backdrop-blur-sm">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#3A4E48]/30 border border-[#8B9D83]/20 text-[#8B9D83]">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white/90 text-xs">Passwordless & Secure</p>
                    <p className="text-[#BEB0A7]/60 text-xs">Instant OTP delivery directly to your inbox</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-[#BEB0A7]/10 bg-[#0A0C0B]/60 p-3.5 backdrop-blur-sm">
                  <div className="grid size-8 place-items-center rounded-lg bg-[#3A4E48]/30 border border-[#8B9D83]/20 text-[#8B9D83]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white/90 text-xs">Distraction-Free UI</p>
                    <p className="text-[#BEB0A7]/60 text-xs">Clean, focused, modern interface</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#BEB0A7]/40">
            <p>© {new Date().getFullYear()} BaatKarte Inc.</p>
            <p className="font-mono">v2.0 SaaS</p>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center p-6 lg:p-12 lg:col-span-7 bg-[#040303]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md rounded-2xl border border-[#BEB0A7]/15 bg-[#0A0C0B]/80 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid size-9 place-items-center rounded-xl bg-[#3A4E48]/40 border border-[#8B9D83]/30">
                <MessagesSquare className="size-5 text-[#8B9D83]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#BEB0A7]">BaatKarte</span>
            </div>

            <p className="text-xs uppercase font-semibold tracking-[0.2em] text-[#8B9D83]">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-[#BEB0A7]/70">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-rose-400 font-medium">
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
      <span className="mb-1.5 block text-xs font-semibold text-[#BEB0A7]/80">{label}</span>
      <input
        {...rest}
        className={
          "w-full rounded-xl border bg-[#040303]/80 px-4 py-3 text-sm text-white placeholder:text-[#BEB0A7]/30 outline-none transition-all duration-200 " +
          "focus:border-[#8B9D83] focus:bg-[#080B0A] focus:ring-2 focus:ring-[#8B9D83]/20 " +
          (error ? "border-rose-500/60" : "border-[#BEB0A7]/15 hover:border-[#BEB0A7]/30") +
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
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      {...props}
      disabled={loading || props.disabled}
      className={
        "group relative w-full overflow-hidden rounded-xl bg-[#3A4E48] hover:bg-[#475F58] border border-[#8B9D83]/30 px-4 py-3 text-sm font-semibold text-[#BEB0A7] transition-all duration-200 shadow-lg shadow-[#3A4E48]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer " +
        (props.className || "")
      }
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <span className="inline-block size-4 animate-spin rounded-full border-2 border-[#BEB0A7]/40 border-t-[#BEB0A7]" />
        )}
        {children}
      </span>
    </motion.button>
  );
}