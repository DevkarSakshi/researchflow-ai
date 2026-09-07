import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-xl ${hoverEffect ? 'hover:border-slate-700 transition-all duration-200 hover:shadow-blue-500/5' : ''} ${className}`}>
      {children}
    </div>
  );
};
