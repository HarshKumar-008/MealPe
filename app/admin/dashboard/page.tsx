'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  RefreshCw,
  Utensils,
} from 'lucide-react';
import SurplusAlertBanner from '@/components/SurplusAlertBanner';

interface MealAnalytics {
  mealId: string;
  serviceDate: string;
  mealType: string;
  state: string;
  projectedCount: number;
  consumedCount: number;
  optedOutCount: number;
  unconsumedPlates: number;
  surplusAlert: boolean;
  dietaryBreakdown: {
    VEG: number;
    JAIN: number;
    EGG: number;
  };
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<MealAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success && Array.isArray(data.analytics)) {
        setAnalytics(data.analytics);
      }
    } catch {
      // Keep existing state if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Compute totals across today's/upcoming meals
  const totalProjected = analytics.reduce((sum, m) => sum + m.projectedCount, 0);
  const totalConsumed = analytics.reduce((sum, m) => sum + m.consumedCount, 0);
  const totalOptedOut = analytics.reduce((sum, m) => sum + m.optedOutCount, 0);
  const totalUnconsumed = analytics.reduce((sum, m) => sum + m.unconsumedPlates, 0);

  // Aggregate dietary breakdown for active/next meal
  const focusMeal =
    analytics.find((m) => m.state === 'ACTIVE') ||
    analytics.find((m) => m.state === 'OPEN') ||
    analytics[0];

  const surplusMeal = analytics.find((m) => m.surplusAlert) || focusMeal;

  const chartData = analytics.map((m) => ({
    meal: `${m.mealType.slice(0, 1)}${m.mealType.slice(1).toLowerCase()} (${m.serviceDate.slice(5)})`,
    projected: m.projectedCount,
    consumed: m.consumedCount,
    skipped: m.optedOutCount,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header matching Shrey's pages */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718071]">
            <BarChart3 size={16} />
            <span>Admin Portal / Analytics & Forecasting</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
            Kitchen headcount & waste analytics
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718071] sm:text-base">
            Real-time meal opt-in projections, dietary splits, and live QR check-in telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#244b34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183c2b]"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh telemetry
        </button>
      </div>

      {/* Surplus Food Redistribution Alert Banner */}
      {surplusMeal && (
        <SurplusAlertBanner
          surplusCount={surplusMeal.unconsumedPlates}
          mealName={`${surplusMeal.mealType} (${surplusMeal.serviceDate})`}
        />
      )}

      {/* 4 Summary Cards in Shrey's exact card style */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#718071]">Projected plates</span>
            <div className="rounded-xl bg-[#f0f5e8] p-2 text-[#436b37]">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#183c2b]">{totalProjected}</p>
          <p className="mt-1 text-xs text-[#718071]">Finalized OPT_IN headcount</p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#718071]">Actual consumed</span>
            <div className="rounded-xl bg-[#eaf7ec] p-2 text-[#267345]">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#267345]">{totalConsumed}</p>
          <p className="mt-1 text-xs text-[#718071]">Verified via atomic QR scan</p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#718071]">Meals opted out</span>
            <div className="rounded-xl bg-[#f0f5e8] p-2 text-[#436b37]">
              <Utensils size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#183c2b]">{totalOptedOut}</p>
          <p className="mt-1 text-xs text-[#718071]">Saved from kitchen prep</p>
        </div>

        <div className="rounded-2xl border border-[#e5e9dc] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#718071]">Unconsumed buffer</span>
            <div className="rounded-xl bg-[#fff2e7] p-2 text-[#a45b26]">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold text-[#a45b26]">{totalUnconsumed}</p>
          <p className="mt-1 text-xs text-[#718071]">Available for redistribution</p>
        </div>
      </div>

      {/* Dietary Preference Breakdown Card */}
      {focusMeal && (
        <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#183c2b]">
                Live kitchen dietary forecaster — {focusMeal.mealType} ({focusMeal.serviceDate})
              </h2>
              <p className="mt-1 text-sm text-[#718071]">
                Exact plate preparation split based on opted-in student dietary preferences.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[#edf4e6] px-3.5 py-1.5 text-xs font-semibold text-[#436b37]">
              State: {focusMeal.state}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e6] text-[#267345]">
                  <Leaf size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#183c2b]">Standard Veg</p>
                  <p className="text-xs text-[#718071]">Regular mess menu</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[#183c2b]">
                {focusMeal.dietaryBreakdown.VEG}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e6] text-[#436b37]">
                  <Leaf size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#183c2b]">Jain Counter</p>
                  <p className="text-xs text-[#718071]">No onion / garlic / root</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[#183c2b]">
                {focusMeal.dietaryBreakdown.JAIN}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2e7] text-[#a45b26]">
                  <Utensils size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#183c2b]">Egg / Protein</p>
                  <p className="text-xs text-[#718071]">Special addon counter</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[#183c2b]">
                {focusMeal.dietaryBreakdown.EGG}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recharts BarChart in Shrey's Card Style */}
      <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#183c2b]">
              Projected opt-ins vs. actual consumed plates
            </h2>
            <p className="mt-1 text-sm text-[#718071]">
              Live comparison across scheduled meal sessions to quantify food waste reduction.
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1e6" />
              <XAxis dataKey="meal" stroke="#718071" fontSize={12} />
              <YAxis stroke="#718071" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e9dc',
                  borderRadius: '16px',
                  color: '#183c2b',
                }}
              />
              <Legend />
              <Bar
                dataKey="projected"
                fill="#9caf8d"
                name="Projected Opt-Ins (Plates Cooked)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="consumed"
                fill="#244b34"
                name="Actual Consumed (QR Scanned)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="skipped"
                fill="#c9f27a"
                name="Opted Out Before Cutoff (Saved)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}