import React from 'react';

interface ProgressBarProps {
  progress: number;
  color?: 'blue' | 'emerald' | 'amber';
  height?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color = 'blue', height = 'sm' }) => {
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500'
  };

  const h = height === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${h}`}>
      <div 
        className={`${colors[color]} h-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
};
