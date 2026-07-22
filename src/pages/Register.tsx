import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/api/client";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { AuthLayout, AuthInput, PrimaryButton } from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create your BaatKarte account";
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: authApi.registerStart,
    onSuccess: (data, vars) => {
      toast.success("Code sent — check your inbox.");
      const params = new URLSearchParams({
        token: data.otpToken,
        email: data.email,
        mode: "register",
        name: vars.name,
      });
      navigate(`/verify-otp?${params.toString()}`);
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join BaatKarte"
      subtitle="No passwords. We'll email you a 6-digit code to verify."
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        <AuthInput
          label="Full name"
          placeholder="Aarav Sharma"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthInput
          label="Username"
          placeholder="aarav"
          autoComplete="username"
          error={errors.username?.message}
          {...register("username")}
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PrimaryButton loading={mutation.isPending}>Send verification code</PrimaryButton>
      </form>

      <p className="mt-6 text-center text-xs text-[#BEB0A7]/70">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#8B9D83] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}