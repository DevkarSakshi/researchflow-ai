import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 focus:ring-blue-500 border border-blue-500/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 focus:ring-slate-500",
    danger: "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200"
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
