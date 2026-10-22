
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const auth = useAuth();

  const resetPassword = auth?.resetPassword || auth?.forgotPassword;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (typeof resetPassword !== "function") {
      setError(
        "Password reset is not configured yet. Please contact your administrator."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(cleanEmail);

      if (result === false || result?.success === false) {
        throw new Error(
          result?.message || "Unable to process your request. Please try again."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#202124] dark:bg-[#131314] dark:text-[#e3e3e3]">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
        {/* Left promotional panel */}
        <section className="relative hidden overflow-hidden bg-[#e8f0fe] p-12 dark:bg-[#202b3c] lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />

          <Link to="/signin" className="relative z-10 flex w-fit items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0b57d0] text-white shadow-lg shadow-blue-900/15">
              <Mail size={23} />
            </span>
            <span className="text-2xl font-bold tracking-tight">Mailora</span>
          </Link>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 grid h-20 w-20 place-items-center rounded-3xl bg-white text-[#0b57d0] shadow-xl shadow-blue-900/5 dark:bg-[#303846]">
              <LockKeyhole size={38} strokeWidth={1.7} />
            </div>

            <h1 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Your inbox is safe with us.
            </h1>

            <p className="mt-5 max-w-md text-base leading-8 text-slate-600 dark:text-slate-300">
              Forgot your password? No worries. Follow the recovery process to
              get back to your messages and keep everything moving.
            </p>

            <div className="mt-9 flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <ShieldCheck size={19} className="text-[#0b57d0]" />
              A simple, secure account recovery experience
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-500 dark:text-slate-400">
            Simple communication. Thoughtfully designed.
          </p>
        </section>

        {/* Recovery form */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-[430px]">
            <Link
              to="/signin"
              className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#0b57d0] dark:text-slate-300 dark:hover:text-blue-400"
            >
              <ArrowLeft size={17} />
              Back to sign in
            </Link>

            <div className="mb-8 lg:hidden">
              <Link to="/signin" className="inline-flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b57d0] text-white">
                  <Mail size={21} />
                </span>
                <span className="text-2xl font-bold tracking-tight">Mailora</span>
              </Link>
            </div>

            {success ? (
              <div className="animate-enter">
                <div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Check your email
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Your password reset request has been processed for{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {email.trim()}
                  </span>
                  . If the account exists, follow the instructions sent to your
                  inbox.
                </p>

                <Link
                  to="/signin"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0b57d0] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0842a0] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  Return to sign in
                  <ArrowRight size={17} />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setError("");
                  }}
                  className="mt-5 w-full text-center text-sm font-medium text-[#0b57d0] hover:underline dark:text-blue-400"
                >
                  Try another email address
                </button>
              </div>
            ) : (
              <div className="animate-enter">
                <div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl bg-[#d3e3fd] text-[#0b57d0] dark:bg-[#26364d] dark:text-blue-300">
                  <LockKeyhole size={30} strokeWidth={1.8} />
                </div>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-[34px]">
                  Forgot password?
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Enter the email address associated with your Mailora account.
                  We&apos;ll help you get back in.
                </p>

                <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                  <div>
                    <label
                      htmlFor="recovery-email"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="recovery-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError("");
                        }}
                        placeholder="you@example.com"
                        required
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b57d0] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-[#1e1f20] dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0b57d0] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0842a0] focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Reset password
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Remember your password?{" "}
                  <Link
                    to="/signin"
                    className="font-semibold text-[#0b57d0] hover:underline dark:text-blue-400"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            <p className="mt-12 text-center text-xs leading-6 text-slate-400">
              By continuing, you agree to Mailora&apos;s Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
