'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SurplusAlertBanner from '@/components/SurplusAlertBanner';

const sampleChartData = [
  { meal: 'Mon Breakfast', projected: 250, actual: 210 },
  { meal: 'Mon Lunch', projected: 300, actual: 285 },
  { meal: 'Mon Dinner', projected: 280, actual: 240 },
  { meal: 'Tue Breakfast', projected: 250, actual: 220 },
  { meal: 'Tue Lunch', projected: 300, actual: 290 },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Top Header & Breadcrumb (Matches Wireframe Header) */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="text-xs font-mono text-gray-500">
          Officer Console / <span className="font-bold text-gray-800">Dashboard Home</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="search..."
            className="border text-xs px-3 py-1.5 rounded w-48 font-mono focus:outline-none"
          />
          <button className="w-7 h-7 border text-xs rounded-full flex items-center justify-center font-mono">?</button>
          <button className="w-7 h-7 border text-xs rounded-full flex items-center justify-center font-mono">@</button>
        </div>
      </div>

      {/* Title + Subtitle + Action Button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900">Dashboard Home</h1>
          <p className="text-xs font-mono text-gray-400">route: /home — empty shell</p>
        </div>
        <button className="border border-gray-400 px-4 py-1.5 text-xs font-mono hover:bg-gray-50">
          [ action ]
        </button>
      </div>

      <SurplusAlertBanner surplusCount={40} mealName="Lunch" />

      {/* 4 Stat Cards Grid (Matches Wireframe 2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-4 rounded-none bg-gray-50 space-y-2">
          <div className="h-4 bg-gray-300 w-32"></div>
          <div className="text-xl font-bold font-mono">280 Plates</div>
          <p className="text-xs font-mono text-gray-500">STAT LABEL: Total Projected</p>
        </div>
        <div className="border p-4 rounded-none bg-gray-50 space-y-2">
          <div className="h-4 bg-gray-300 w-32"></div>
          <div className="text-xl font-bold font-mono">240 Checked-In</div>
          <p className="text-xs font-mono text-gray-500">STAT LABEL: Actual Served</p>
        </div>
        <div className="border p-4 rounded-none bg-gray-50 space-y-2">
          <div className="h-4 bg-gray-300 w-32"></div>
          <div className="text-xl font-bold font-mono">40 Plates</div>
          <p className="text-xs font-mono text-gray-500">STAT LABEL: Food Waste / Surplus</p>
        </div>
        <div className="border p-4 rounded-none bg-gray-50 space-y-2">
          <div className="h-4 bg-gray-300 w-32"></div>
          <div className="text-xl font-bold font-mono">₹1,800</div>
          <p className="text-xs font-mono text-gray-500">STAT LABEL: Rebates Saved</p>
        </div>
      </div>

      {/* Main Overview Widget Area with Recharts (Matches Wireframe Dashed Container) */}
      <div className="border-2 border-dashed border-gray-300 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono text-gray-400">[00]</span>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest font-bold">
            summary widgets & food waste analytics
          </span>
          <span className="text-xs font-mono text-gray-400">[00]</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleChartData}>
              <XAxis dataKey="meal" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="projected" fill="#cbd5e1" name="Projected Opt-Ins" />
              <Bar dataKey="actual" fill="#2563eb" name="Actual Consumed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-right mt-2">
          <span className="text-xs font-mono text-gray-400">flex / grid TBD</span>
        </div>
      </div>
    </div>
  );
}