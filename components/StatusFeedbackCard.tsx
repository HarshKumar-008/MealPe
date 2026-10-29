import React from 'react';

interface Props {
  status: 'SUCCESS' | 'ALREADY_CONSUMED' | 'OFFLINE_QUEUED' | null;
  message?: string;
  studentInfo?: { name: string; regNo: string; diet: string };
}

export default function StatusFeedbackCard({ status, message, studentInfo }: Props) {
  if (!status) return null;

  const styles = {
    SUCCESS: 'bg-green-100 border-green-500 text-green-800',
    ALREADY_CONSUMED: 'bg-red-100 border-red-500 text-red-800',
    OFFLINE_QUEUED: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };

  return (
    <div className={`p-4 border-l-4 rounded shadow-md mt-4 transition-all ${styles[status]}`}>
      <h3 className="font-bold text-lg">
        {status === 'SUCCESS' && '✅ Meal Verified'}
        {status === 'ALREADY_CONSUMED' && '❌ Already Consumed / Invalid'}
        {status === 'OFFLINE_QUEUED' && '⚡ Offline Queued'}
      </h3>
      {studentInfo && (
        <div className="mt-2 text-sm">
          <p><strong>Name:</strong> {studentInfo.name}</p>
          <p><strong>Reg No:</strong> {studentInfo.regNo}</p>
          <p><strong>Diet:</strong> {studentInfo.diet}</p>
        </div>
      )}
      {message && <p className="mt-1 text-xs">{message}</p>}
    </div>
  );
}