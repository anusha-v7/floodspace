import React from 'react';
import { ConnectivityStatus, ImpactStatus, PriorityLevel } from '../types';

interface StatusBadgeProps {
  status: ImpactStatus | ConnectivityStatus | PriorityLevel | string;
  type?: 'impact' | 'connectivity' | 'priority' | 'generic';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'generic',
  className = '',
}) => {
  let text = status.replace('_', ' ').toUpperCase();
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-300';
  let borderColor = 'border-slate-800 bg-slate-900/60';

  if (type === 'connectivity') {
    if (status === 'cut_off') {
      text = 'CUT OFF';
      dotColor = 'bg-rose-500 animate-pulse';
      textColor = 'text-rose-400';
      borderColor = 'border-rose-500/30 bg-rose-950/30';
    } else if (status === 'partially_connected') {
      text = 'PARTIAL ACCESS';
      dotColor = 'bg-amber-400';
      textColor = 'text-amber-400';
      borderColor = 'border-amber-500/30 bg-amber-950/30';
    } else {
      text = 'CONNECTED';
      dotColor = 'bg-emerald-400';
      textColor = 'text-emerald-400';
      borderColor = 'border-emerald-500/30 bg-emerald-950/30';
    }
  } else if (type === 'priority') {
    if (status === 'critical') {
      dotColor = 'bg-rose-500';
      textColor = 'text-rose-300';
      borderColor = 'border-rose-500/40 bg-rose-950/40 font-semibold';
    } else if (status === 'high') {
      dotColor = 'bg-amber-400';
      textColor = 'text-amber-300';
      borderColor = 'border-amber-500/30 bg-amber-950/30';
    } else {
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-300';
      borderColor = 'border-slate-800 bg-slate-900/40';
    }
  } else if (type === 'impact') {
    if (status === 'affected') {
      dotColor = 'bg-rose-500';
      textColor = 'text-rose-400';
      borderColor = 'border-rose-500/30 bg-rose-950/30';
    } else if (status === 'potentially_affected') {
      dotColor = 'bg-amber-400';
      textColor = 'text-amber-400';
      borderColor = 'border-amber-500/30 bg-amber-950/30';
    } else if (status === 'unaffected') {
      dotColor = 'bg-emerald-400';
      textColor = 'text-emerald-400';
      borderColor = 'border-emerald-500/30 bg-emerald-950/30';
    } else {
      dotColor = 'bg-cyan-400';
      textColor = 'text-cyan-400';
      borderColor = 'border-cyan-500/30 bg-cyan-950/30';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono border rounded ${borderColor} ${textColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
};
