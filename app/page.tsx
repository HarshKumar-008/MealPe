"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Utensils,
  Leaf,
  Mail,
  LockKeyhole,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";

type UserRole = "STUDENT" | "STAFF" | "ADMIN";

export default function Home() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to sync role cookie & user UUID from the Supabase 'users' table
  async function setSessionCookiesAndRedirect(role: UserRole) {
    try {
      const { data: matchedUser } = await supabase
        .from("users")
        .select("id, role")
        .eq("role", role)
        .limit(1)
        .single();

      if (matchedUser) {
        document.cookie = `mealpe_user_id=${matchedUser.id}; path=/; max-age=86400`;
      }
    } catch {
      // Fallback if offline
    }

    document.cookie = `mealpe_role=${role}; path=/; max-age=86400`;

    if (role === "ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "STAFF") {
      router.push("/staff/scan");
    } else {
      router.push("/student");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (isSignup) {
        const name = String(formData.get("name") ?? "").trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: selectedRole,
            },
          },
        });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          setMessage("Account created! Redirecting to your portal...");
          await setSessionCookiesAndRedirect(selectedRole);
        } else {
          setMessage(
            "Account created! Check your email for a verification link, or use Quick Demo Access below."
          );
          setLoading(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        setMessage("Login successful! Redirecting...");
        await setSessionCookiesAndRedirect(selectedRole);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
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
                <h1 className="text-2xl font-bold tracking-tight">MealPe</h1>
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
                <span className="text-[#c9f27a]">Zero hassle.</span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                Manage your meals, plan your week, and keep track of your mess
                expenses — all in one place.
              </p>

              <div className="mt-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    Plan your weekly meals &amp; opt-outs before cutoff
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    30-second rotating HMAC-SHA256 QR pass
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 text-[#c9f27a]"
                  />
                  <span className="text-sm text-white/80">
                    Automated rebate ledger &amp; waste telemetry
                  </span>
                </div>
              </div>
            </div>

            <p className="relative z-10 text-xs text-white/40">
              Made for smarter campus dining • Team TriveniX
            </p>
          </section>

          {/* Right side: Login and signup forms */}
          <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-16">
            <div className="w-full max-w-md">
              {/* Mobile branding */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183c2b] text-[#c9f27a]">
                  <Utensils size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">MealPe</h1>
                  <p className="text-xs text-gray-500">
                    Smart meals. Simple living.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#64805f]">
                  {isSignup ? "Get started" : "Welcome back"}
                </p>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {isSignup ? "Create account" : "Sign in to MealPe"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {isSignup
                    ? "Create your account and make meal management easier."
                    : "Select your portal role and sign in below."}
                </p>
              </div>

              {/* Role Selector Tabs */}
              <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#f7f8f2] p-1.5 border border-[#e5e9dc]">
                {(["STUDENT", "STAFF", "ADMIN"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      selectedRole === role
                        ? "bg-[#244b34] text-white shadow-sm"
                        : "text-[#718071] hover:text-[#183c2b]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-semibold"
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
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-semibold"
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
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
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
                            "Use the Quick Demo Access buttons below if you don't have a password set."
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
                      className="w-full rounded-xl border border-gray-200 bg-[#fcfdf9] py-3 pl-12 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5d8c50] focus:ring-4 focus:ring-[#5d8c50]/10"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#183c2b]"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                {!isSignup && (
                  <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 accent-[#315c38]"
                    />
                    Remember me
                  </label>
                )}

                {message && (
                  <p
                    role="status"
                    className="rounded-xl bg-[#f0f7e9] px-4 py-3 text-xs font-medium leading-5 text-[#315c38]"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#234b32] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#234b32]/10 transition hover:bg-[#183c2b] active:scale-[0.99] disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : isSignup
                    ? `Create ${selectedRole.toLowerCase()} account`
                    : `Sign in as ${selectedRole.toLowerCase()}`}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>

              {/* 1-Click Quick Role Switcher for Live Evaluation */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718071]">
                  Quick Evaluation Portal Access
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSessionCookiesAndRedirect("STUDENT")}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-3 text-xs font-semibold text-[#183c2b] transition hover:border-[#9caf8d] hover:bg-[#edf4e6]"
                >
                  <User size={17} className="text-[#436b37]" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionCookiesAndRedirect("STAFF")}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-3 text-xs font-semibold text-[#183c2b] transition hover:border-[#9caf8d] hover:bg-[#edf4e6]"
                >
                  <QrCode size={17} className="text-[#436b37]" />
                  <span>Staff Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSessionCookiesAndRedirect("ADMIN")}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-3 text-xs font-semibold text-[#183c2b] transition hover:border-[#9caf8d] hover:bg-[#edf4e6]"
                >
                  <ShieldCheck size={17} className="text-[#436b37]" />
                  <span>Admin</span>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}