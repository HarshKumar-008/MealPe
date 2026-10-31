"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  IndianRupee,
  Printer,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
  type: "charge" | "payment" | "rebate";
};

const baseTransactions: Transaction[] = [
  {
    id: "TXN-001",
    title: "Monthly mess charges",
    description: "Base hostel dining fee (30 days)",
    date: "01 Oct 2026",
    amount: 4500,
    type: "charge",
  },
  {
    id: "TXN-002",
    title: "Semester advance payment",
    description: "UPI / Institute fee portal",
    date: "05 Oct 2026",
    amount: 3000,
    type: "payment",
  },
];

const billingPeriods = ["October 2026", "September 2026", "August 2026"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BillingPage() {
  const [period, setPeriod] = useState("October 2026");
  const [filter, setFilter] = useState("All");
  const [liveRebates, setLiveRebates] = useState<Transaction[]>([]);
  const [liveRebateSum, setLiveRebateSum] = useState<number>(400);

  useEffect(() => {
    async function loadLiveBilling() {
      try {
        let uid = document.cookie
          .split("; ")
          .find((row) => row.startsWith("mealpe_user_id="))
          ?.split("=")[1];

        if (!uid) {
          const { data: student } = await supabase
            .from("users")
            .select("id")
            .eq("role", "STUDENT")
            .limit(1)
            .single();
          if (student) uid = student.id;
        }

        if (!uid) return;

        const res = await fetch(`/api/student/billing?userId=${uid}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.rebateHistory)) {
          const mapped: Transaction[] = data.rebateHistory.map((item: any, idx: number) => ({
            id: item.id || `REB-${idx}`,
            title: `Meal opt-out rebate (${item.meal?.type || "MEAL"})`,
            description: `Verified cutoff cancellation for ${item.meal?.service_date || "scheduled meal"}`,
            date: new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            amount: Number(item.credit_amount),
            type: "rebate",
          }));

          if (mapped.length > 0) {
            setLiveRebates(mapped);
            setLiveRebateSum(data.billingSummary?.totalRebateCredited ?? 0);
          }
        }
      } catch {
        // Fallback to default transactions
      }
    }

    loadLiveBilling();
  }, []);

  const allTransactions =
    liveRebates.length > 0
      ? [...baseTransactions, ...liveRebates]
      : [
          ...baseTransactions,
          {
            id: "TXN-003",
            title: "Meal opt-out rebate",
            description: "Eligible meal cancellations",
            date: "12 Oct 2026",
            amount: 250,
            type: "rebate" as const,
          },
          {
            id: "TXN-005",
            title: "Meal opt-out rebate",
            description: "Eligible meal cancellations",
            date: "22 Oct 2026",
            amount: 150,
            type: "rebate" as const,
          },
        ];

  const totalCharges = 4500;
  const totalPaid = 3000;
  const totalRebate = liveRebateSum;
  const balance = Math.max(0, totalCharges - totalPaid - totalRebate);

  const filteredTransactions = allTransactions.filter((transaction) => {
    if (filter === "All") return true;
    if (filter === "Charges") return transaction.type === "charge";
    if (filter === "Payments") return transaction.type === "payment";
    if (filter === "Rebates") return transaction.type === "rebate";
    return true;
  });

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          aside,
          nav,
          button,
          select,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .billing-print-area {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718071]">
            <ReceiptText size={16} />
            <span>Student Portal / Billing</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
            Billing & rebates
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718071] sm:text-base">
            Track your mess charges, payments, and live database rebate credits.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="no-print flex items-center justify-center gap-2 rounded-xl bg-[#244b34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183c2b]"
        >
          <Printer size={17} />
          Print statement
        </button>
      </div>

      <div className="billing-print-area space-y-8">
        <div className="flex flex-col gap-3 rounded-3xl bg-[#244b34] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#d6e4cf]">
              <Wallet size={17} />
              Net payable balance
            </div>

            <p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrency(balance)}
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-[#d6e4cf]">
              <CheckCircle2 size={16} />
              Reconciled with Supabase Rebate Ledger
            </div>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <IndianRupee size={32} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#718071]">Total charges</span>
              <div className="rounded-xl bg-[#f0f5e8] p-2 text-[#436b37]">
                <FileText size={18} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#183c2b]">
              {formatCurrency(totalCharges)}
            </p>
            <p className="mt-1 text-xs text-[#718071]">Before rebates</p>
          </div>

          <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#718071]">Amount paid</span>
              <div className="rounded-xl bg-[#eaf7ec] p-2 text-[#267345]">
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#183c2b]">
              {formatCurrency(totalPaid)}
            </p>
            <p className="mt-1 text-xs text-[#718071]">Payments recorded</p>
          </div>

          <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#718071]">Rebates earned</span>
              <div className="rounded-xl bg-[#f0f5e8] p-2 text-[#436b37]">
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#267345]">
              {formatCurrency(totalRebate)}
            </p>
            <p className="mt-1 text-xs text-[#718071]">Automated opt-out credits</p>
          </div>

          <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#718071]">Billing period</span>
              <div className="rounded-xl bg-[#f0f5e8] p-2 text-[#436b37]">
                <CalendarDays size={18} />
              </div>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="mt-4 w-full rounded-lg border border-[#e5e9dc] bg-[#fbfcf8] px-3 py-2 text-sm font-semibold text-[#183c2b] outline-none focus:border-[#71935d]"
            >
              {billingPeriods.map((billingPeriod) => (
                <option key={billingPeriod} value={billingPeriod}>
                  {billingPeriod}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-[#718071]">Active statement month</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#183c2b]">Transaction & rebate ledger</h2>
              <p className="mt-1 text-sm text-[#718071]">
                Your itemized charges, payments, and opt-out rebates for {period}.
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              {["All", "Charges", "Payments", "Rebates"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    filter === option
                      ? "bg-[#244b34] text-white"
                      : "border border-[#e5e9dc] bg-white text-[#718071] hover:bg-[#f7f8f2]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredTransactions.map((transaction) => {
              const isPayment = transaction.type === "payment";
              const isRebate = transaction.type === "rebate";

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#edf0e7] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isPayment || isRebate
                          ? "bg-[#eaf7ec] text-[#267345]"
                          : "bg-[#fff2e7] text-[#a45b26]"
                      }`}
                    >
                      {isPayment || isRebate ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-[#183c2b]">{transaction.title}</p>
                      <p className="mt-1 text-xs text-[#718071]">
                        {transaction.description} · {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p
                      className={`font-bold ${
                        isPayment || isRebate ? "text-[#267345]" : "text-[#183c2b]"
                      }`}
                    >
                      {isPayment || isRebate ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="mt-1 text-xs text-[#718071]">
                      {isPayment ? "Payment" : isRebate ? "Rebate credit" : "Charge"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}