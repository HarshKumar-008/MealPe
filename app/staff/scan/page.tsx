'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Utensils,
  Database,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { db } from '@/lib/dexie';
import StatusFeedbackCard from '@/components/StatusFeedbackCard';

export default function StaffScannerPage() {
  const [isOffline, setIsOffline] = useState(false);
  const [scanStatus, setScanStatus] = useState<'SUCCESS' | 'ALREADY_CONSUMED' | 'OFFLINE_QUEUED' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [latencyMs, setLatencyMs] = useState<number | undefined>();
  const [student, setStudent] = useState<any>(undefined);
  const [queuedCount, setQueuedCount] = useState(0);
  const [manualQrInput, setManualQrInput] = useState('');
  const lastScannedRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });

  const refreshQueueCount = useCallback(async () => {
    const all = await db.pendingScans.toArray();
    const unsynced = all.filter((item) => !item.synced);
    setQueuedCount(unsynced.length);
  }, []);

  useEffect(() => {
    refreshQueueCount();
  }, [refreshQueueCount]);

  const playBeep = (freq = 800) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors if browser blocks autoplay
    }
  };

  const handleScan = useCallback(
    async (decodedText: string) => {
      const cleaned = decodedText.trim();
      if (!cleaned) return;

      // Prevent camera from firing 10 requests in the same second for the same frame
      const now = Date.now();
      if (lastScannedRef.current.text === cleaned && now - lastScannedRef.current.time < 2000) {
        return;
      }
      lastScannedRef.current = { text: cleaned, time: now };

      if (isOffline) {
        playBeep(600);
        await db.pendingScans.add({
          qrToken: cleaned,
          scannedAt: new Date().toISOString(),
          synced: false,
        });
        await refreshQueueCount();
        setScanStatus('OFFLINE_QUEUED');
        setStatusMessage('Wi-Fi Blackout Mode: HMAC token stored in IndexedDB (Dexie.js) for background sync.');
        setStudent(undefined);
        setLatencyMs(undefined);
        return;
      }

      try {
        const res = await fetch('/api/qr/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // FIXED: Backend expects "qrString", not "token"
          body: JSON.stringify({ qrString: cleaned }),
        });

        const data = await res.json();

        if (res.status === 200 && data.success) {
          playBeep(880);
          setScanStatus('SUCCESS');
          setStudent(data.student);
          setLatencyMs(data.latencyMs);
          setStatusMessage(data.message || 'Atomic Compare-And-Swap check-in completed!');
        } else {
          playBeep(300);
          setScanStatus('ALREADY_CONSUMED');
          setStatusMessage(data.error || 'Token already consumed or expired!');
          setStudent(undefined);
          setLatencyMs(undefined);
        }
      } catch {
        setScanStatus('ALREADY_CONSUMED');
        setStatusMessage('Network error while verifying token.');
      }
    },
    [isOffline, refreshQueueCount]
  );

  const syncOfflineScans = useCallback(async () => {
    const all = await db.pendingScans.toArray();
    const pending = all.filter((item) => !item.synced);
    if (pending.length === 0) return;

    try {
      // FIXED: Backend expects "offlineScans" with { qrString, scannedAt }
      const payload = pending.map((item) => ({
        qrString: item.qrToken,
        scannedAt: item.scannedAt,
      }));

      const res = await fetch('/api/staff/sync-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offlineScans: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await db.pendingScans.clear();
        await refreshQueueCount();
        setScanStatus('SUCCESS');
        setStatusMessage(`Synced ${pending.length} queued offline scan(s) to Supabase PostgreSQL!`);
      }
    } catch {
      setStatusMessage('Offline sync failed. Will retry when online.');
    }
  }, [refreshQueueCount]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 240 }, false);
    scanner.render(
      (text) => handleScan(text),
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [handleScan]);

  return (
    <div className="min-h-screen bg-[#f7f8f2] text-[#183c2b]">
      {/* Top Navbar in Shrey's exact style */}
      <header className="sticky top-0 z-30 border-b border-[#183c2b]/10 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183c2b] text-[#c9f27a]">
              <Utensils size={22} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#183c2b]">MealPe Refectory Scanner</p>
              <p className="text-xs text-[#718071]">Staff Terminal • Atomic Check-In & Offline PWA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student/qr"
              className="hidden items-center gap-1.5 rounded-xl border border-[#e5e9dc] bg-[#fbfcf8] px-3.5 py-2 text-xs font-semibold text-[#183c2b] hover:bg-[#edf4e6] sm:flex"
            >
              <QrCode size={15} />
              Student QR
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-[#e5e9dc] bg-[#fbfcf8] px-3.5 py-2 text-xs font-semibold text-[#183c2b] hover:bg-[#edf4e6]"
            >
              <ArrowLeft size={15} />
              Admin Analytics
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-5 sm:p-8">
        {/* Offline Simulator & IndexedDB Queue Bar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isOffline ? 'bg-[#fff2e7] text-[#a45b26]' : 'bg-[#edf4e6] text-[#267345]'
              }`}
            >
              {isOffline ? <WifiOff size={22} /> : <Wifi size={22} />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#183c2b]">
                {isOffline ? 'Offline Queue Mode (IndexedDB Active)' : 'Online Mode (Live Supabase Lock)'}
              </p>
              <p className="text-xs text-[#718071]">
                Pending offline scans in Dexie queue: <strong className="text-[#183c2b]">{queuedCount}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queuedCount > 0 && !isOffline && (
              <button
                type="button"
                onClick={syncOfflineScans}
                className="flex items-center gap-1.5 rounded-xl border border-[#dce8cf] bg-[#edf4e6] px-3.5 py-2.5 text-xs font-semibold text-[#315b2b]"
              >
                <RefreshCw size={14} />
                Sync ({queuedCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const nextState = !isOffline;
                setIsOffline(nextState);
                if (!nextState) {
                  syncOfflineScans();
                }
              }}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isOffline
                  ? 'bg-[#a45b26] text-white hover:bg-[#8c4b1d]'
                  : 'bg-[#244b34] text-white hover:bg-[#183c2b]'
              }`}
            >
              {isOffline ? 'Switch to ONLINE & Sync' : 'Simulate Wi-Fi Blackout'}
            </button>
          </div>
        </div>

        {/* Camera Scanner Box */}
        <div className="rounded-3xl border border-[#e5e9dc] bg-white p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#183c2b]">Live camera QR scanner</h2>
              <p className="text-xs text-[#718071]">
                Hold the student&apos;s 30-second rotating QR pass in front of the camera.
              </p>
            </div>
            <span className="rounded-full bg-[#edf4e6] px-3 py-1 text-xs font-semibold text-[#436b37]">
              HMAC-SHA256
            </span>
          </div>

          <div
            id="reader"
            className="overflow-hidden rounded-2xl border border-[#e5e9dc] bg-[#fbfcf8]"
          />

          {/* Manual Paste / Viva Quick Test Box */}
          <div className="mt-5 border-t border-[#e5e9dc] pt-4">
            <label className="mb-2 block text-xs font-semibold text-[#718071]">
              Or paste a raw QR token string below to test verification without camera:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualQrInput}
                onChange={(e) => setManualQrInput(e.target.value)}
                placeholder="userId|mealId|timeSlot|hmacSignature"
                className="flex-1 rounded-xl border border-[#e5e9dc] bg-[#fbfcf8] px-3.5 py-2.5 font-mono text-xs text-[#183c2b] outline-none focus:border-[#71935d]"
              />
              <button
                type="button"
                onClick={() => handleScan(manualQrInput)}
                className="flex items-center gap-1.5 rounded-xl bg-[#244b34] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#183c2b]"
              >
                <Send size={14} />
                Verify Token
              </button>
            </div>
          </div>
        </div>

        {/* Status Feedback Card */}
        <StatusFeedbackCard
          status={scanStatus}
          message={statusMessage}
          studentInfo={student}
          latencyMs={latencyMs}
        />
      </main>
    </div>
  );
}