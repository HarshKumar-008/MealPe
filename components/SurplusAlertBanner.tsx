'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

interface AlertProps {
  surplusCount: number;
  mealName: string;
}

export default function SurplusAlertBanner({ surplusCount, mealName }: AlertProps) {
  const [notified, setNotified] = useState(false);

  if (surplusCount <= 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#e3d3a8] bg-[#fff9eb] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7e6b5] text-[#8a5a10]">
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#8a5a10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Surplus Redistribution Alert
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-bold text-[#183c2b]">
            {surplusCount} unconsumed plates detected for {mealName}
          </h3>
          <p className="mt-0.5 text-xs text-[#718071]">
            Threshold exceeded. Notify campus food bank & hostel volunteers for immediate redistribution.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setNotified(true)}
        disabled={notified}
        className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
          notified
            ? 'bg-[#edf7e7] text-[#267345] border border-[#cfe2c0]'
            : 'bg-[#244b34] text-white hover:bg-[#183c2b]'
        }`}
      >
        {notified ? (
          <>
            <CheckCircle2 size={16} />
            Volunteers Notified
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Broadcast Surplus Alert
          </>
        )}
      </button>
    </div>
  );
}