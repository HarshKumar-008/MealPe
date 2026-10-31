import React from 'react';

interface AlertProps {
  surplusCount: number;
  mealName: string;
}

export default function SurplusAlertBanner({ surplusCount, mealName }: AlertProps) {
  if (surplusCount <= 0) return null;

  return (
    <div className="bg-amber-500 text-white p-3 rounded-md shadow-sm mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-xl">⚠️</span>
        <span className="font-semibold text-sm">
          Surplus Food Alert: {surplusCount} extra plates available for {mealName}!
        </span>
      </div>
      <button className="bg-white text-amber-600 px-3 py-1 text-xs font-bold rounded hover:bg-amber-50">
        Claim / Redistribute
      </button>
    </div>
  );
}