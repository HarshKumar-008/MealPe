'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';

export default function StudentQRPage() {
  const [qrToken, setQrToken] = useState<string>('LOADING_TOKEN...');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing pass...');
  const [studentInfo, setStudentInfo] = useState<{ name: string; regNo: string; mealType: string } | null>(null);

  const fetchQRToken = useCallback(async () => {
    try {
      // 1. Get logged-in userId from cookie or fallback to first STUDENT in Supabase
      let userId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('mealpe_user_id='))
        ?.split('=')[1];

      if (!userId) {
        const { data: student } = await supabase
          .from('users')
          .select('id, full_name, reg_no')
          .eq('role', 'STUDENT')
          .limit(1)
          .single();

        if (student) {
          userId = student.id;
          setStudentInfo((prev) => ({
            name: student.full_name,
            regNo: student.reg_no,
            mealType: prev?.mealType || 'ACTIVE MEAL',
          }));
        }
      }

      // 2. Get an ACTIVE or OPEN meal session from /api/meals/schedule
      const scheduleRes = await fetch('/api/meals/schedule');
      const scheduleData = await scheduleRes.json();
      const meals = scheduleData.meals || [];
      const activeMeal =
        meals.find((m: any) => m.state === 'ACTIVE') ||
        meals.find((m: any) => m.state === 'OPEN') ||
        meals[0];

      if (!userId || !activeMeal) {
        setQrToken(`SAMPLE_TOKEN_${Date.now()}`);
        setStatusMessage('Demo Mode (Run seed.sql for live HMAC tokens)');
        return;
      }

      setStudentInfo((prev) =>
        prev ? { ...prev, mealType: `${activeMeal.type} (${activeMeal.service_date})` } : null
      );

      // 3. Call Harsh's /api/qr/generate endpoint with userId and mealId
      const res = await fetch(`/api/qr/generate?userId=${userId}&mealId=${activeMeal.id}`);
      const data = await res.json();

      if (data.success && data.qrString) {
        setQrToken(data.qrString);
        if (typeof data.secondsRemaining === 'number') {
          setTimeLeft(data.secondsRemaining);
        }
        setStatusMessage('Live HMAC-SHA256 Signed Pass');
      } else {
        setQrToken(`BLOCKED_${data.error || Date.now()}`);
        setStatusMessage(data.error || 'Cannot generate QR for this meal');
      }
    } catch {
      setQrToken(`LOCAL_TOKEN_${Date.now()}`);
      setStatusMessage('Offline / Local Token Mode');
    }
  }, []);

  useEffect(() => {
    fetchQRToken();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchQRToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchQRToken]);

  return (
    <section className="max-w-md mx-auto p-6 text-center space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#183c2b]">Your Entry QR Pass</h1>
        <p className="mt-1 text-xs text-gray-500">Show this rotating QR code at the mess counter</p>
        {studentInfo && (
          <p className="mt-2 text-xs font-medium text-emerald-800 bg-emerald-50 py-1 px-3 rounded-full inline-block">
            {studentInfo.name} ({studentInfo.regNo}) • {studentInfo.mealType}
          </p>
        )}
      </div>

      <div className="flex justify-center p-6 bg-white rounded-xl shadow-lg border">
        <QRCodeSVG value={qrToken} size={220} />
      </div>

      <div className="space-y-2">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#183c2b] h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-gray-600">
          Refreshes in: <span className="text-[#183c2b] font-bold">{timeLeft}s</span>
        </p>
        <p className="text-[11px] text-gray-400">{statusMessage}</p>
      </div>
    </section>
  );
}