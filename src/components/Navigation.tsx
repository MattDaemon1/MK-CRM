import React from 'react';
import {
  LayoutDashboard,
  Target,
  Kanban,
  LifeBuoy,
  Repeat
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'leads' | 'pipeline' | 'tickets' | 'contracts';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  urgentFollowUpsCount: number;
  openTicketsCount: number;
  activeMrrCount: number;
  leadsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  urgentFollowUpsCount,
  openTicketsCount,
  activeMrrCount,
  leadsCount
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'To-Do & Relances',
      icon: LayoutDashboard,
      badge: urgentFollowUpsCount > 0 ? urgentFollowUpsCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'leads' as ActiveTab,
      label: 'Leads & Qualification',
      icon: Target,
      badge: leadsCount > 0 ? leadsCount : null,
      badgeColor: 'bg-indigo-500 text-white'
    },
    {
      id: 'pipeline' as ActiveTab,
      label: 'Pipeline Prospection',
      icon: Kanban,
      badge: null
    },
    {
      id: 'tickets' as ActiveTab,
      label: 'Support & Tickets',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? openTicketsCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'contracts' as ActiveTab,
      label: 'Contrats & MRR',
      icon: Repeat,
      badge: activeMrrCount > 0 ? `${activeMrrCount} actifs` : null,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    }
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      tab.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
