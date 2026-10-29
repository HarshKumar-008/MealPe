"use client";

import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Utensils,
  Leaf,
  Mail,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "Your form is ready! Supabase authentication will be connected next."
    );
  }

  function switchMode() {
    setIsSignup(!isSignup);
    setMessage("");
    setShowPassword(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f8f2] text-[#183c2b]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center p-4 sm:p-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(24,60,43,0.10)] lg:min-h-[680px] lg:grid-cols-2">

          {/* Left side: Branding */}
          <section className="relative hidden flex-col justify-between overflow-hidden bg-[#183c2b] p-10 text-white lg:flex xl:p-14">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#8abf73]/10 blur-2xl" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9f27a] text-[#183c2b]">
                <Utensils size={25} strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  MealPe
                </h1>
                <p className="text-xs tracking-wide text-white/60">
                  Smart meals. Simple living.
                </p>
              </div>
            </div>

            <div className="relative z-10 my-12">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-[#d6f6b0]">
                <Leaf size={16} />
                A smarter way to eat
              </div>

              <h2 className="max-w-lg text-4xl font-semibold leading-[1.2] tracking-tight xl:text-5xl">
                Good food.
                <br />
                Better habits.
                <br />
                <span className="text-[#c9f27a]">
                  Zero hassle.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                Manage your meals, plan your week, and keep track of your
                mess expenses — all in one place.
              </p>

              <div className="mt-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    Plan your weekly meals
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    Manage meal opt-outs
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    Keep your billing organized
                  </span>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-xs text-white/40">
              Made for smarter campus dining.
            </p>
          </section>

          {/* Right side: Login and signup forms */}
          <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-16">
            <div className="w-full max-w-md">

              {/* Mobile branding */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183c2b] text-[#c9f27a]">
                  <Utensils size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    MealPe
                  </h1>
                  <p className="text-xs text-gray-500">
                    Smart meals. Simple living.
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#64805f]">
                  {isSignup ? "Get started" : "Welcome back"}
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {isSignup ? "Create account" : "Sign in to MealPe"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {isSignup
                    ? "Create your account and make meal management easier."
                    : "Your meals and dashboard are just a sign-in away."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {isSignup && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold"
                    >
                      Password
                    </label>

                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() =>
                          setMessage(
                            "Password recovery will be connected with Supabase next."
                          )
                        }
                        className="text-xs font-semibold text-[#47733d] transition hover:text-[#183c2b]"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        isSignup ? "Create a password" : "Enter your password"
                      }
                      autoComplete={
                        isSignup ? "new-password" : "current-password"
                      }
                      minLength={6}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#183c2b]"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>

                  {isSignup && (
                    <p className="mt-2 text-xs text-gray-400">
                      Use at least 6 characters.
                    </p>
                  )}
                </div>

                {!isSignup && (
                  <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      className="h-4 w-4 accent-[#315c38]"
                    />
                    Remember me
                  </label>
                )}

                {message && (
                  <p
                    role="status"
                    className="rounded-xl bg-[#f0f7e9] px-4 py-3 text-sm leading-5 text-[#315c38]"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#234b32] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#234b32]/10 transition hover:bg-[#183c2b] active:scale-[0.99]"
                >
                  {isSignup ? "Create account" : "Sign in"}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">
                  YOUR CAMPUS, SIMPLIFIED
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="text-center text-sm text-gray-500">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-[#315c38] transition hover:text-[#183c2b]"
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </p>

              <p className="mt-10 text-center text-xs leading-5 text-gray-400">
                By continuing, you agree to use MealPe responsibly.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}