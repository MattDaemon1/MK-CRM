import React, { useState } from 'react';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Prospect, ProspectStatus, PriorityLevel, ServiceType } from '../../types/crm';
import { KanbanBoard } from './KanbanBoard';
import { ProspectTableView } from './ProspectTableView';
import { PipelineMetrics } from '../../services/storage';

interface PipelineViewProps {
  prospects: Prospect[];
  pipelineMetrics: PipelineMetrics;
  onSelectProspect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onMoveStatus: (prospectId: string, newStatus: ProspectStatus) => void;
  onNewProspect: (initialStatus?: ProspectStatus) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  prospects,
  pipelineMetrics,
  onSelectProspect,
  onOpenFollowUp,
  onMoveStatus,
  onNewProspect
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Filtering
  const filteredProspects = prospects.filter((p) => {
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    if (serviceFilter !== 'all' && p.service_type !== serviceFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchComp = p.company.toLowerCase().includes(q);
      const matchContact = p.contact_name.toLowerCase().includes(q);
      const matchNotes = p.notes.some((n) => n.toLowerCase().includes(q));
      if (!matchComp && !matchContact && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Title & Quick Pipeline Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pipeline de Prospection & Ventes
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Suivi des affaires en cours, calcul du CA potentiel et qualification des leads
          </p>
        </div>

        {/* Global Pipeline Figures */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs">
            <span className="text-slate-700 dark:text-slate-200">Pipeline Actif : </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {pipelineMetrics.totalPipelineValue.toLocaleString('fr-FR')} €
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-700 dark:text-slate-200">Pondéré : </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {pipelineMetrics.weightedPipelineValue.toLocaleString('fr-FR')} €
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-xs">
            <span className="text-slate-700 dark:text-slate-200">Gagné : </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {pipelineMetrics.totalWonValue.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Quick search input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrer prospects (MP41...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes priorités</option>
            <option value="Chaud">Chaud (Score &gt;= 75)</option>
            <option value="Tiède">Tiède (Score 50-74)</option>
            <option value="Froid">Froid (Score &lt; 50)</option>
          </select>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes prestations</option>
            <option value="Refonte & Dev Web">Refonte & Dev Web</option>
            <option value="IA & Automatisation">IA & Automatisation</option>
            <option value="Workflows n8n">Workflows n8n</option>
            <option value="Pack Sérénité (Maintenance)">Pack Sérénité</option>
            <option value="Application sur-mesure">Application sur-mesure</option>
          </select>
        </div>

        {/* Right Actions: Kanban/Table switch + New Prospect */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={() => onNewProspect()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Lead</span>
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          prospects={filteredProspects}
          onSelectProspect={onSelectProspect}
          onOpenFollowUp={onOpenFollowUp}
          onMoveStatus={onMoveStatus}
          onNewProspectWithStatus={(st) => onNewProspect(st)}
        />
      ) : (
        <ProspectTableView
          prospects={filteredProspects}
          onSelectProspect={onSelectProspect}
          onOpenFollowUp={onOpenFollowUp}
          onMoveStatus={onMoveStatus}
        />
      )}
    </div>
  );
};
