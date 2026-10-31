import Link from "next/link";
import {
  CalendarDays,
  ReceiptText,
  QrCode,
  ArrowRight,
  Utensils,
} from "lucide-react";

const cards = [
  {
    title: "Weekly Schedule",
    description: "View your meals and manage meal opt-outs.",
    href: "/student/schedule",
    icon: CalendarDays,
  },
  {
    title: "My QR Code",
    description: "Access your meal identification QR code.",
    href: "/student/qr",
    icon: QrCode,
  },
  {
    title: "Billing & Rebates",
    description: "Review your billing information and rebates.",
    href: "/student/billing",
    icon: ReceiptText,
  },
];

export default function StudentDashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-[#64805f]">
          YOUR CAMPUS, SIMPLIFIED
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
          Student Dashboard
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Welcome to MealPe. Manage your weekly meals, access your QR code,
          and keep track of your mess billing.
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-[#183c2b] p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c9f27a] text-[#183c2b]">
            <Utensils size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Everything about your meals, in one place.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Check your schedule, manage your meal preferences, and keep
              your billing information organized.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-[#183c2b]/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#183c2b]/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf5e5] text-[#315c38]">
                <Icon size={23} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[#183c2b]">
                {card.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {card.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#315c38]">
                Open section
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}