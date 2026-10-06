import React from 'react';

interface DemoBadgeProps {
  label?: string;
  variant?: 'amber' | 'cyan' | 'slate';
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'SIMULATED DATA',
  variant = 'amber',
  className = '',
}) => {
  const colorStyles = {
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    slate: 'text-slate-400 bg-slate-800/50 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider border rounded whitespace-nowrap ${colorStyles[variant]} ${className}`}
      title="Prototype estimate for hackathon evaluation; not an actual certified satellite measurement"
    >
      [DEMO] {label}
    </span>
  );
};
