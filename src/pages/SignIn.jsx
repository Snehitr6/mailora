
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Eye,
  EyeOff,
  LockKeyhole,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = location.state?.from;
  const redirectTo = destination
    ? `${destination.pathname || "/inbox"}${destination.search || ""}${destination.hash || ""}`
    : "/inbox";

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
            Continue to your Mailora inbox.
          </p>
          <button
            type="button"
            onClick={() => navigate(redirectTo, { replace: true })}
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

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (typeof login !== "function") {
      setError(
        "Sign-in is not configured in AuthContext. Check your authentication setup."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await login(cleanEmail, password, rememberMe);

      if (result === false) {
        setError("Unable to sign in. Please check your credentials.");
        return;
      }

      if (result?.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Unable to sign in. Please try again."
        );
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] px-4 py-8 dark:bg-[#131314] sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_16px_60px_rgba(30,64,175,0.08)] dark:border-slate-700 dark:bg-[#202124] lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-[#e8f0fe] p-10 dark:bg-[#202b3c] lg:flex xl:p-12">
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
              Your email, beautifully organized
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-800 xl:text-5xl dark:text-white">
              A calmer way to manage your inbox.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
              Keep conversations organized, find important messages faster,
              and focus on what matters most.
            </p>

            <div className="mt-9 rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-slate-600 dark:bg-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-200">
                  M
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    Your workspace
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Inbox · Starred · Sent · Drafts
                  </p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-600" />
                <div className="h-2 w-4/5 rounded-full bg-slate-200 dark:bg-slate-600" />
                <div className="h-2 w-3/5 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500 dark:text-slate-400">
            Simple, organized email for your everyday work.
          </p>
        </section>

        {/* Sign-in form */}
        <section className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <Link
            to="/signin"
            className="mb-9 flex w-fit items-center gap-2.5 lg:hidden"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b57d0] text-white">
              <Mail size={21} />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              Mailora
            </span>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-[#0b57d0] dark:text-blue-300">
              Welcome back
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800 dark:text-white">
              Sign in to Mailora
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enter your account details to continue to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="signin-email"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <Mail
                  size={18}
                  className="shrink-0 text-slate-400"
                />
                <input
                  id="signin-email"
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
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="signin-password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#0b57d0] hover:underline dark:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-[#303134]">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-slate-400"
                />
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="shrink-0 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded accent-[#0b57d0]"
              />
              Keep me signed in
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">NEW TO MAILORA?</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <Link
            to="/signup"
            className="flex h-12 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Create an account
          </Link>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to use your account responsibly.
          </p>
        </section>
      </div>
    </main>
  );
}
