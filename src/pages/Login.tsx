import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/api/client";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth";
import { AuthLayout, AuthInput, PrimaryButton } from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign in to BaatKarte";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: authApi.loginStart,
    onSuccess: (data) => {
      toast.success("Code sent to your email.");
      const params = new URLSearchParams({
        token: data.otpToken,
        email: data.email,
        mode: "login",
      });
      navigate(`/verify-otp?${params.toString()}`);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Enter your email and we'll send a one-time code."
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PrimaryButton loading={mutation.isPending}>Send login code</PrimaryButton>
      </form>

      <p className="mt-6 text-center text-xs text-[#BEB0A7]/70">
        New to BaatKarte?{" "}
        <Link to="/register" className="font-semibold text-[#8B9D83] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}