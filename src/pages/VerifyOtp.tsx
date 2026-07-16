import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth";
import { otpFormSchema, type OtpFormValues } from "@/lib/validation/auth";
import { AuthLayout, PrimaryButton, FieldError } from "@/components/auth/AuthLayout";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);

  const initialToken = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const mode = (searchParams.get("mode") as "login" | "register") ?? "login";

  const [cooldown, setCooldown] = useState(60);
  const [otpToken, setOtpToken] = useState(initialToken);

  useEffect(() => {
    document.title = "Verify your code — BaatKarte";
  }, []);

  useEffect(() => {
    if (!initialToken || !email) navigate("/login", { replace: true });
  }, [initialToken, email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: "" },
  });

  const verifyMutation = useMutation({
    mutationFn: authApi.otpVerify,
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Welcome${data.user.name ? ", " + data.user.name.split(" ")[0] : ""}!`);
      navigate("/inbox");
    },
    onError: (err) => {
      toast.error(extractApiError(err));
      reset({ code: "" });
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.otpResend,
    onSuccess: (data) => {
      toast.success("New code sent.");
      setCooldown(data.resendCooldown ?? 60);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const subtitle = useMemo(
    () => `We sent a 6-digit code to ${email}. It expires in 10 minutes.`,
    [email],
  );

  return (
    <AuthLayout
      eyebrow={mode === "register" ? "Verify email" : "One-time code"}
      title="Enter your code"
      subtitle={subtitle}
    >
      <form
        onSubmit={handleSubmit((v) => verifyMutation.mutate({ otpToken, code: v.code }))}
        className="space-y-6"
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <div>
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  if (v.length === 6)
                    handleSubmit((vals) =>
                      verifyMutation.mutate({ otpToken, code: vals.code }),
                    )();
                }}
                inputMode="numeric"
                autoFocus
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="size-12 rounded-xl border-white/10 bg-white/5 text-lg text-white data-[active=true]:border-white/40 data-[active=true]:ring-2 data-[active=true]:ring-white/10"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="text-center">
                <FieldError message={errors.code?.message} />
              </div>
            </div>
          )}
        />

        <PrimaryButton loading={verifyMutation.isPending}>Verify and continue</PrimaryButton>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-white/60">
        <Link to={mode === "register" ? "/register" : "/login"} className="hover:text-white">
          ← Use a different email
        </Link>
        <button
          type="button"
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={() =>
            resendMutation.mutate(
              { otpToken },
              {
                onSuccess: (_, vars) => {
                  setOtpToken(vars.otpToken);
                },
              },
            )
          }
          className="font-medium text-white/80 hover:text-white disabled:cursor-not-allowed disabled:text-white/30"
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : resendMutation.isPending
              ? "Sending…"
              : "Resend code"}
        </button>
      </div>
    </AuthLayout>
  );
}