'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '@/lib/dexie';
import StatusFeedbackCard from '@/components/StatusFeedbackCard';

export default function StaffScannerPage() {
  const [isOffline, setIsOffline] = useState(false);
  const [scanStatus, setScanStatus] = useState<'SUCCESS' | 'ALREADY_CONSUMED' | 'OFFLINE_QUEUED' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [student, setStudent] = useState<{ name: string; regNo: string; diet: string } | undefined>();

  const playBeep = () => {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const handleScan = async (decodedText: string) => {
    playBeep();

    if (isOffline) {
      await db.pendingScans.add({
        qrToken: decodedText,
        scannedAt: new Date().toISOString(),
        synced: false,
      });
      setScanStatus('OFFLINE_QUEUED');
      setStatusMessage('Scan saved locally in IndexedDB.');
      setStudent(undefined);
      return;
    }

    try {
      const res = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText }),
      });

      if (res.status === 200) {
        const data = await res.json();
        setScanStatus('SUCCESS');
        setStudent(data.student || { name: 'Yuvraj M.', regNo: '2026CS101', diet: 'Veg' });
        setStatusMessage('Verified successfully!');
      } else {
        setScanStatus('ALREADY_CONSUMED');
        setStatusMessage('Token already used or expired!');
        setStudent(undefined);
      }
    } catch {
      setScanStatus('ALREADY_CONSUMED');
      setStatusMessage('Verification failed.');
    }
  };

  const syncOfflineScans = async () => {
    const pending = await db.pendingScans.where('synced').equals(0).toArray();
    if (pending.length === 0) return;

    try {
      const res = await fetch('/api/staff/sync-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scans: pending }),
      });

      if (res.ok) {
        await db.pendingScans.clear();
        alert(`Successfully synced ${pending.length} offline scans!`);
      }
    } catch {
      alert('Sync failed. Try again when online.');
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false);
    scanner.render((text) => handleScan(text), () => {});

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOffline]);

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border">
        <span className="text-sm font-semibold">Simulate Offline Mode</span>
        <button
          onClick={() => {
            const nextState = !isOffline;
            setIsOffline(nextState);
            if (!nextState) syncOfflineScans();
          }}
          className={`px-3 py-1 text-xs font-bold rounded ${
            isOffline ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {isOffline ? 'OFFLINE' : 'ONLINE'}
        </button>
      </div>

      <div id="reader" className="w-full bg-white rounded-lg overflow-hidden border shadow-sm"></div>

      <StatusFeedbackCard status={scanStatus} message={statusMessage} studentInfo={student} />
    </div>
  );
}