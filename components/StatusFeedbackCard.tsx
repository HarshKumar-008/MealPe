import React from 'react';
import { CheckCircle2, XCircle, WifiOff, User, Hash, Leaf, Clock } from 'lucide-react';

interface StudentData {
  full_name?: string;
  reg_no?: string;
  dietary_preference?: string;
  name?: string;
  regNo?: string;
  diet?: string;
}

interface Props {
  status: 'SUCCESS' | 'ALREADY_CONSUMED' | 'OFFLINE_QUEUED' | null;
  message?: string;
  studentInfo?: StudentData;
  latencyMs?: number;
}

export default function StatusFeedbackCard({ status, message, studentInfo, latencyMs }: Props) {
  if (!status) return null;

  const config = {
    SUCCESS: {
      wrapper: 'border-[#cfe2c0] bg-[#edf7e7] text-[#183c2b]',
      badge: 'bg-[#244b34] text-[#c9f27a]',
      icon: CheckCircle2,
      iconColor: 'text-[#267345]',
      title: 'Meal Verified — Allow Entry',
    },
    ALREADY_CONSUMED: {
      wrapper: 'border-[#f5c2c7] bg-[#fff0ed] text-[#7a271a]',
      badge: 'bg-[#a43b2b] text-white',
      icon: XCircle,
      iconColor: 'text-[#a43b2b]',
      title: 'Access Denied — Token Blocked',
    },
    OFFLINE_QUEUED: {
      wrapper: 'border-[#f3d9a4] bg-[#fff8eb] text-[#6b4c1b]',
      badge: 'bg-[#b4781e] text-white',
      icon: WifiOff,
      iconColor: 'text-[#b4781e]',
      title: 'Offline Verified & Queued',
    },
  }[status];

  const Icon = config.icon;
  const displayName = studentInfo?.full_name || studentInfo?.name;
  const displayReg = studentInfo?.reg_no || studentInfo?.regNo;
  const displayDiet = studentInfo?.dietary_preference || studentInfo?.diet;

  return (
    <div className={`rounded-3xl border p-6 shadow-sm transition-all ${config.wrapper}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80">
            <Icon size={26} className={config.iconColor} />
          </div>
          <div>
            <span className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${config.badge}`}>
              {status.replace('_', ' ')}
            </span>
            <h3 className="mt-1 text-lg font-bold">{config.title}</h3>
          </div>
        </div>

        {typeof latencyMs === 'number' && (
          <span className="flex items-center gap-1 rounded-xl bg-white/80 px-2.5 py-1 font-mono text-xs font-semibold text-[#315c38]">
            <Clock size={13} />
            {latencyMs}ms
          </span>
        )}
      </div>

      {message && <p className="mt-3 text-sm font-medium opacity-90">{message}</p>}

      {displayName && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/80 p-3.5 text-xs text-[#183c2b]">
          <div className="flex items-center gap-2">
            <User size={15} className="text-[#436b37]" />
            <div>
              <p className="text-[10px] text-[#718071]">Student</p>
              <p className="font-bold">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Hash size={15} className="text-[#436b37]" />
            <div>
              <p className="text-[10px] text-[#718071]">Reg No.</p>
              <p className="font-bold">{displayReg}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Leaf size={15} className="text-[#436b37]" />
            <div>
              <p className="text-[10px] text-[#718071]">Dietary Pref</p>
              <p className="font-bold">{displayDiet}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}