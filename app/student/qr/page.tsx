'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, Copy, Check, RefreshCw, Clock3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentQRPage() {
  const [qrToken, setQrToken] = useState<string>('LOADING_TOKEN...');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing cryptographic pass...');
  const [copied, setCopied] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    regNo: string;
    diet: string;
    mealType: string;
  } | null>(null);

  const fetchQRToken = useCallback(async () => {
    try {
      let userId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('mealpe_user_id='))
        ?.split('=')[1];

      let currentStudent: any = null;

      if (userId) {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, reg_no, dietary_preference')
          .eq('id', userId)
          .single();
        currentStudent = data;
      }

      if (!currentStudent) {
        const { data: student } = await supabase
          .from('users')
          .select('id, full_name, reg_no, dietary_preference')
          .eq('role', 'STUDENT')
          .limit(1)
          .single();
        currentStudent = student;
      }

      if (currentStudent) {
        userId = currentStudent.id;
      }

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

      setStudentInfo({
        name: currentStudent.full_name,
        regNo: currentStudent.reg_no,
        diet: currentStudent.dietary_preference,
        mealType: `${activeMeal.type} • ${activeMeal.service_date}`,
      });

      const res = await fetch(`/api/qr/generate?userId=${userId}&mealId=${activeMeal.id}`);
      const data = await res.json();

      if (data.success && data.qrString) {
        setQrToken(data.qrString);
        if (typeof data.secondsRemaining === 'number') {
          setTimeLeft(data.secondsRemaining);
        }
        setStatusMessage('HMAC-SHA256 Signed • Single-Use Atomic Pass');
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

  const copyToken = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#718071]">
          <QrCode size={16} />
          <span>Student Portal / My QR Code</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#183c2b] sm:text-4xl">
          Rotating dining hall QR pass
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#718071] sm:text-base">
          Your cryptographic QR token automatically rotates every 30 seconds to prevent screenshot sharing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col items-center rounded-3xl border border-[#e5e9dc] bg-white p-6 text-center sm:p-8">
          {studentInfo && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#edf4e6] px-4 py-1.5 text-xs font-semibold text-[#315c38]">
              <ShieldCheck size={15} />
              {studentInfo.name} ({studentInfo.regNo}) • {studentInfo.diet} • {studentInfo.mealType}
            </div>
          )}

          <div className="rounded-3xl border border-[#e5e9dc] bg-[#fbfcf8] p-6 shadow-sm">
            <QRCodeSVG value={qrToken} size={230} fgColor="#183c2b" />
          </div>

          <div className="mt-6 w-full max-w-xs space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e5e9dc]">
              <div
                className="h-full bg-[#244b34] transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-[#718071]">
              <span className="flex items-center gap-1">
                <Clock3 size={13} />
                Rotates in <strong className="text-[#183c2b]">{timeLeft}s</strong>
              </span>
              <button
                type="button"
                onClick={fetchQRToken}
                className="flex items-center gap-1 text-[#315c38] hover:underline"
              >
                <RefreshCw size={12} />
                Refresh now
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs font-medium text-[#718071]">{statusMessage}</p>
        </div>

        <div className="space-y-4 rounded-3xl border border-[#e5e9dc] bg-white p-6">
          <h2 className="text-lg font-bold text-[#183c2b]">Cryptographic token details</h2>
          <p className="text-xs leading-5 text-[#718071]">
            Each QR payload encodes <code className="font-mono text-[#183c2b]">userId|mealId|timeSlot|hmac</code> signed with SHA-256.
          </p>

          <div className="rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#718071]">
              Active Signed Payload
            </p>
            <p className="mt-1.5 break-all font-mono text-xs text-[#183c2b]">{qrToken}</p>
          </div>

          <button
            type="button"
            onClick={copyToken}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#244b34] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#183c2b]"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied QR String!' : 'Copy QR Token (For Scanner Demo)'}
          </button>
        </div>
      </div>
    </div>
  );
}