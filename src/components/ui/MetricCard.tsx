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
    default: 'border-slate-800 bg-slate-900/60',
    highlight: 'border-sky-500/30 bg-sky-950/20 text-sky-400',
    success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    warning: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
  };

  return (
    <div
      className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-200 ${borderStyles[variant]}`}
    >
      <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
        <span>{label}</span>
        {icon && <span className="opacity-80">{icon}</span>}
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
