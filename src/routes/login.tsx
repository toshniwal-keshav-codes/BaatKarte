import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/api/client";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth";
import { AuthLayout, AuthInput, PrimaryButton } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in to BaatKarte" },
      { name: "description", content: "Passwordless sign-in for BaatKarte." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
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
      navigate({
        to: "/verify-otp",
        search: { token: data.otpToken, email: data.email, mode: "login" },
      });
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

      <p className="mt-6 text-center text-sm text-white/60">
        New to BaatKarte?{" "}
        <Link to="/register" className="font-medium text-white hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}