import React from 'react';
import { LucideIcon } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: LucideIcon;
  badgeText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'neutral';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  badgeText = 'Demo Estimate',
  variant = 'neutral',
  onClick,
}) => {
  const accentBorder = {
    danger: 'hover:border-rose-500/50 group-hover:text-rose-400',
    warning: 'hover:border-amber-500/50 group-hover:text-amber-400',
    info: 'hover:border-cyan-500/50 group-hover:text-cyan-400',
    neutral: 'hover:border-slate-700 group-hover:text-slate-200',
  }[variant];

  const valueColor = {
    danger: 'text-rose-400',
    warning: 'text-amber-400',
    info: 'text-cyan-400',
    neutral: 'text-slate-100',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative p-4 bg-slate-900/80 border border-slate-800 rounded-lg transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:bg-slate-850 ' + accentBorder : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className={`text-2xl lg:text-3xl font-semibold font-mono tabular-nums ${valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono uppercase text-slate-500 font-normal">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="truncate">{subtext || 'Simulated analysis'}</span>
        <DemoBadge label={badgeText} variant={variant === 'danger' ? 'amber' : variant === 'info' ? 'cyan' : 'slate'} />
      </div>
    </div>
  );
};
