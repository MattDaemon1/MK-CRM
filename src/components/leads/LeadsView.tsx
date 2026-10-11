import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Flame,
  Clock,
  Mail,
  Edit2,
  Trash2,
  ChevronRight,
  Filter,
  Phone,
  Building,
  User,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Prospect, ProspectStatus, PriorityLevel } from '../../types/crm';
import { getDaysSinceDate } from '../../services/followUpEngine';

interface LeadsViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onMoveStatus: (prospectId: string, newStatus: ProspectStatus) => void;
  onNewLead: () => void;
  availableServiceTypes?: string[];
}

const STATUS_OPTIONS: ProspectStatus[] = [
  'Lead entrant',
  'Contacté',
  'Proposition envoyée',
  'En attente de signature',
  'Gagné',
  'Perdu'
];

export const LeadsView: React.FC<LeadsViewProps> = ({
  prospects,
  onSelectProspect,
  onEditProspect,
  onDeleteProspect,
  onOpenFollowUp,
  onMoveStatus,
  onNewLead,
  availableServiceTypes = []
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Filter leads (primarily non-won, non-lost, or all according to filter)
  const filtered = prospects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;
    if (serviceFilter !== 'all' && p.service_type !== serviceFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchComp = p.company.toLowerCase().includes(q);
      const matchContact = p.contact_name.toLowerCase().includes(q);
      const matchEmail = p.email.toLowerCase().includes(q);
      const matchSrc = p.source.toLowerCase().includes(q);
      if (!matchComp && !matchContact && !matchEmail && !matchSrc) return false;
    }
    return true;
  });

  const incomingLeads = prospects.filter((p) => p.status === 'Lead entrant');
  const hotLeads = prospects.filter((p) => p.priority === 'Chaud' && p.status !== 'Perdu');
  const totalLeadsValue = filtered.reduce((acc, p) => acc + (p.estimated_value || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestion & Qualification des Leads
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Suivi des demandes entrantes, qualification des opportunités et conversion
          </p>
        </div>

        <button
          onClick={onNewLead}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Lead</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Total Leads Actifs</p>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {prospects.filter((p) => p.status !== 'Gagné' && p.status !== 'Perdu').length}
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-950/40 rounded-xl bg-blue-50/20 dark:bg-blue-950/10">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Leads Entrants Neufs</p>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {incomingLeads.length}
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Leads Chauds (Score ≥ 75)</p>
          <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {hotLeads.length}
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Valeur Cumulée</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {totalLeadsValue.toLocaleString('fr-FR')} €
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher lead (MP41, contact, email...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes priorités</option>
            <option value="Chaud">Chaud</option>
            <option value="Tiède">Tiède</option>
            <option value="Froid">Froid</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes prestations</option>
            {Array.from(new Set([...availableServiceTypes, ...prospects.map((p) => p.service_type)])).filter(Boolean).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs">
            Aucun lead trouvé avec ces critères de recherche.
          </div>
        ) : (
          filtered.map((prospect) => {
            const daysSince = getDaysSinceDate(prospect.last_contact_date);

            return (
              <div
                key={prospect.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onSelectProspect(prospect)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left"
                      >
                        {prospect.company}
                      </button>

                      {/* Lead Score & Priority */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                          prospect.priority === 'Chaud'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            : prospect.priority === 'Tiède'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {prospect.priority === 'Chaud' && <Flame className="w-2.5 h-2.5" />}
                        <span>Score {prospect.lead_score}/100</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {prospect.estimated_value.toLocaleString('fr-FR')} € HT
                      </span>

                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        · {prospect.service_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {prospect.contact_name}
                        </span>
                      </span>

                      {prospect.email && (
                        <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${prospect.email}`} className="hover:underline">
                            {prospect.email}
                          </a>
                        </span>
                      )}

                      {prospect.phone && (
                        <span className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`tel:${prospect.phone}`} className="hover:underline">
                            {prospect.phone}
                          </a>
                        </span>
                      )}

                      <span className="text-slate-700 dark:text-slate-200">
                        Source : {prospect.source}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          Dernier contact : {daysSince === 0 ? "Aujourd'hui" : `il y a ${daysSince}j`} ({prospect.last_contact_date})
                        </span>
                      </span>
                    </div>

                    {prospect.notes && prospect.notes.length > 0 && (
                      <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-1 italic pt-0.5">
                        "{prospect.notes[0]}"
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
                    {/* Status Dropdown */}
                    <select
                      value={prospect.status}
                      onChange={(e) =>
                        onMoveStatus(prospect.id, e.target.value as ProspectStatus)
                      }
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    {/* Email follow up */}
                    <button
                      onClick={() => onOpenFollowUp(prospect)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Générer un email de relance"
                    >
                      <Mail className="w-4 h-4" />
                    </button>

                    {/* Edit Company button */}
                    <button
                      onClick={() => onEditProspect(prospect)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Modifier l'entreprise et les informations du lead"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Modifier</span>
                    </button>

                    {/* Delete Company button */}
                    <button
                      onClick={() => onDeleteProspect(prospect)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Supprimer définitivement ce lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* View details */}
                    <button
                      onClick={() => onSelectProspect(prospect)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Voir la fiche détaillée"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
