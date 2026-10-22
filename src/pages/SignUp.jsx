
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { user, signup, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-5 dark:bg-[#131314]">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-[#202124]">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Mail size={27} />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
            You're already signed in
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You can continue to your Mailora inbox.
          </p>
          <button
            type="button"
            onClick={() => navigate("/inbox", { replace: true })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b57d0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0842a0]"
          >
            Open Mailora <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agree) {
      setError("Please agree to the terms before creating an account.");
      return;
    }

    const createAccount = signup || register;

    if (typeof createAccount !== "function") {
      setError(
        "Account registration is not configured in AuthContext. Check your authentication setup."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await createAccount({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      if (result === false) {
        setError("Unable to create your account. Please try again.");
        return;
      }

      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Unable to create your account. Please try again."
        );
        return;
      }

      // Some authentication systems require users to sign in after registration.
      if (result?.user || result?.success || result === true) {
        navigate("/inbox", { replace: true });
      } else {
        navigate("/signin", {
          replace: true,
          state: {
            message: "Your account was created. Please sign in.",
            email: cleanEmail,
          },
        });
      }
    } catch (err) {
      setError(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Passwords match",
      valid: Boolean(password) && password === confirmPassword,
    },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4 py-8 dark:bg-[#131314] sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_60px_rgba(30,64,175,0.08)] dark:border-slate-700 dark:bg-[#202124] lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden bg-[#e8f0fe] p-10 dark:bg-[#202b3c] lg:flex xl:p-12">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-blue-200/60 blur-2xl dark:bg-blue-700/20" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-indigo-200/60 blur-2xl dark:bg-indigo-700/20" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b57d0] text-white shadow-lg shadow-blue-600/20">
              <Mail size={23} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Mailora
            </span>
          </div>

          <div className="relative z-10 max-w-md">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-medium text-blue-800 backdrop-blur dark:border-slate-600 dark:bg-slate-800/70 dark:text-blue-200">
              <ShieldCheck size={15} />
              A better inbox starts here
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-800 xl:text-5xl dark:text-white">
              Make room for what matters.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
              Create your Mailora account to organize conversations, save
              important messages, and keep your everyday communication in one
              place.
            </p>

            <div className="mt-9 space-y-4">
              {[
                "Organize messages into folders",
                "Save important emails with stars",
                "Write and manage drafts easily",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                    <CheckCircle2 size={16} />
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500 dark:text-slate-400">
            Your workspace for everyday communication.
          </p>
        </section>

        {/* Registration form */}
        <section className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <Link to="/signin" className="mb-8 flex w-fit items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b57d0] text-white">
              <Mail size={21} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Mailora
            </span>
          </Link>

          <div className="mb-7">
            <p className="mb-3 text-sm font-medium text-[#0b57d0] dark:text-blue-300">
              Get started for free
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-white">
              Create your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enter your details to get started with Mailora.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Full name
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <UserRound size={18} className="shrink-0 text-slate-400" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <Mail size={18} className="shrink-0 text-slate-400" />
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Password
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Confirm password
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <LockKeyhole size={18} className="shrink-0 text-slate-400" />
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {password && (
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-[#303134]">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`flex items-center gap-2 text-xs ${
                      check.valid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {check.label}
                  </div>
                ))}
              </div>
            )}

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#0b57d0]"
              />
              <span>
                I agree to the terms of use and understand the account
                policies.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0b57d0] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0842a0] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-[#0b57d0] hover:underline dark:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
