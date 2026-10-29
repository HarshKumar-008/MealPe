"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ReceiptText,
  QrCode,
  LayoutDashboard,
  Utensils,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const navigation = [
  {
    name: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    name: "Weekly Schedule",
    href: "/student/schedule",
    icon: CalendarDays,
  },
  {
    name: "My QR Code",
    href: "/student/qr",
    icon: QrCode,
  },
  {
    name: "Billing",
    href: "/student/billing",
    icon: ReceiptText,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
  setUserEmail("demo@mealpe.local");
  setLoading(false);
  return;
}

      setUserEmail(data.session.user.email ?? "");
      setLoading(false);
    }

    checkSession();

    const {
    data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return;

    if (!session) {
        setUserEmail("demo@mealpe.local");
        setLoading(false);
        return;
    }

    setUserEmail(session.user.email ?? "");
    setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Unable to sign out. Please try again.");
      return;
    }

    router.replace("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f2]">
        <p className="text-sm font-medium text-[#315c38]">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f2] lg:flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#183c2b] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/student"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c9f27a] text-[#183c2b]">
              <Utensils size={23} />
            </div>

            <div>
              <p className="text-xl font-bold">MealPe</p>
              <p className="text-xs text-white/55">Student Portal</p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/student" &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#c9f27a] text-[#183c2b]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-xs text-white/45">Signed in as</p>
            <p className="mt-1 truncate text-sm font-medium">
              {userEmail || "Student"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#183c2b]/10 bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#183c2b] transition hover:bg-[#f0f4e9] lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-sm font-semibold text-[#183c2b]">
                Student Portal
              </p>
              <p className="text-xs text-gray-500">
                Manage your campus meals
              </p>
            </div>
          </div>

          <div className="hidden rounded-full bg-[#edf5e5] px-4 py-2 text-xs font-medium text-[#315c38] sm:block">
            MealPe Student
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}