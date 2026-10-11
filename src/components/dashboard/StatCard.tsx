import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  colorScheme: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50/60 dark:bg-indigo-950/20',
    border: 'border-indigo-100 dark:border-indigo-900/40',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-600 dark:text-indigo-400'
  },
  emerald: {
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-600 dark:text-emerald-400'
  },
  amber: {
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    border: 'border-amber-100 dark:border-amber-900/40',
    iconBg: 'bg-amber-600 text-white',
    text: 'text-amber-600 dark:text-amber-400'
  },
  rose: {
    bg: 'bg-rose-50/60 dark:bg-rose-950/20',
    border: 'border-rose-100 dark:border-rose-900/40',
    iconBg: 'bg-rose-600 text-white',
    text: 'text-rose-600 dark:text-rose-400'
  },
  purple: {
    bg: 'bg-purple-50/60 dark:bg-purple-950/20',
    border: 'border-purple-100 dark:border-purple-900/40',
    iconBg: 'bg-purple-600 text-white',
    text: 'text-purple-600 dark:text-purple-400'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  colorScheme
}) => {
  const styles = colorMap[colorScheme];

  return (
    <div
      className={`p-4 rounded-xl border bg-white dark:bg-slate-900/80 ${styles.border} shadow-xs transition-all hover:shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.iconBg} shadow-xs`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-semibold ${styles.text}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
          {subtitle}
        </p>
      )}
    </div>
  );
};
