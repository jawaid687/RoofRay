import React from 'react';

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  variant?: 'default' | 'highlight' | 'success' | 'warning';
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  subtext,
  variant = 'default',
}: MetricCardProps) {
  const borderStyles = {
    default: 'border-slate-800 bg-[#0d1527]/70',
    highlight: 'border-sky-500/30 bg-[#0c1830]/80 text-sky-400',
    success: 'border-emerald-500/30 bg-[#091a24]/80 text-emerald-400',
    warning: 'border-amber-500/30 bg-[#1c1810]/80 text-amber-400',
  };

  return (
    <div
      className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-150 ${borderStyles[variant]}`}
    >
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
        <span className="truncate">{label}</span>
        {icon && <span className="opacity-80 shrink-0 ml-1">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-slate-100 font-mono tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>
      {subtext && (
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
}
