'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentQRPage() {
  const [qrToken, setQrToken] = useState<string>('LOADING_TOKEN...');
  const [timeLeft, setTimeLeft] = useState<number>(30);

  const fetchQRToken = async () => {
    try {
      const res = await fetch('/api/qr/generate');
      const data = await res.json();
      if (data.token) {
        setQrToken(data.token);
      } else {
        setQrToken(`SAMPLE_TOKEN_${Date.now()}`);
      }
    } catch {
      setQrToken(`LOCAL_TOKEN_${Date.now()}`);
    }
  };

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
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Your Entry QR Pass</h1>
      <p className="text-xs text-gray-500">Show this QR code at the mess counter</p>

      <div className="flex justify-center p-6 bg-white rounded-xl shadow-lg border">
        <QRCodeSVG value={qrToken} size={220} />
      </div>

      <div className="space-y-2">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-gray-600">
          Refreshes in: <span className="text-blue-600 font-bold">{timeLeft}s</span>
        </p>
      </div>
    </div>
  );
}