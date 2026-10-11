import React, { useState } from 'react';
import {
  ArrowUpDown,
  Mail,
  Eye,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';
import { Prospect, ProspectStatus } from '../../types/crm';
import { getDaysSinceDate } from '../../services/followUpEngine';

interface ProspectTableViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onMoveStatus: (prospectId: string, newStatus: ProspectStatus) => void;
  onEditProspect?: (prospect: Prospect) => void;
  onDeleteProspect?: (prospect: Prospect) => void;
}

type SortField = 'company' | 'estimated_value' | 'lead_score' | 'last_contact_date';

const STATUS_OPTIONS: ProspectStatus[] = [
  'Lead entrant',
  'Contacté',
  'Proposition envoyée',
  'En attente de signature',
  'Gagné',
  'Perdu'
];

export const ProspectTableView: React.FC<ProspectTableViewProps> = ({
  prospects,
  onSelectProspect,
  onOpenFollowUp,
  onMoveStatus,
  onEditProspect,
  onDeleteProspect
}) => {
  const [sortField, setSortField] = useState<SortField>('lead_score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sorted = [...prospects].sort((a, b) => {
    let factor = sortAsc ? 1 : -1;
    if (sortField === 'company') {
      return a.company.localeCompare(b.company) * factor;
    }
    if (sortField === 'estimated_value') {
      return (a.estimated_value - b.estimated_value) * factor;
    }
    if (sortField === 'lead_score') {
      return (a.lead_score - b.lead_score) * factor;
    }
    if (sortField === 'last_contact_date') {
      return (a.last_contact_date || '').localeCompare(b.last_contact_date || '') * factor;
    }
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort('company')}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-bold"
                >
                  <span>Entreprise & Contact</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3">Prestation</th>
              <th className="py-3 px-3">Statut Pipeline</th>
              <th className="py-3 px-3">
                <button
                  onClick={() => handleSort('estimated_value')}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-bold"
                >
                  <span>Montant HT</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  onClick={() => handleSort('lead_score')}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-bold"
                >
                  <span>Score & Priorité</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  onClick={() => handleSort('last_contact_date')}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-bold"
                >
                  <span>Dernier Contact</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {sorted.map((prospect) => {
              const daysSince = getDaysSinceDate(prospect.last_contact_date);
              const isOldContact =
                daysSince >= 5 && prospect.status !== 'Gagné' && prospect.status !== 'Perdu';

              return (
                <tr
                  key={prospect.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Company & Contact */}
                  <td className="py-3 px-4">
                    <div>
                      <button
                        onClick={() => onSelectProspect(prospect)}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left"
                      >
                        {prospect.company}
                      </button>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200">
                        {prospect.contact_name} · <span className="font-mono">{prospect.email}</span>
                      </p>
                    </div>
                  </td>

                  {/* Prestation */}
                  <td className="py-3 px-3">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {prospect.service_type}
                    </span>
                    <span className="block text-[10px] text-slate-700 dark:text-slate-200">
                      Src : {prospect.source}
                    </span>
                  </td>

                  {/* Statut Dropdown Inline */}
                  <td className="py-3 px-3">
                    <select
                      value={prospect.status}
                      onChange={(e) => onMoveStatus(prospect.id, e.target.value as ProspectStatus)}
                      className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Montant */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {prospect.estimated_value.toLocaleString('fr-FR')} €
                    </span>
                    {prospect.active_services && prospect.active_services.length > 0 && (
                      <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{prospect.active_services.reduce((a, b) => a + b.monthly_price, 0)} €/m
                      </span>
                    )}
                  </td>

                  {/* Score & Priorité */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                          prospect.priority === 'Chaud'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            : prospect.priority === 'Tiède'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {prospect.priority === 'Chaud' && <Flame className="w-3 h-3" />}
                        <span>{prospect.priority} ({prospect.lead_score})</span>
                      </span>
                    </div>
                  </td>

                  {/* Dernier contact */}
                  <td className="py-3 px-3 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock className={`w-3 h-3 ${isOldContact ? 'text-rose-500' : 'text-slate-400'}`} />
                      <span className={isOldContact ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                        {daysSince === 0 ? "Aujourd'hui" : `${daysSince}j`} ({prospect.last_contact_date})
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenFollowUp(prospect)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Générer un email de relance"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>

                      {onEditProspect && (
                        <button
                          onClick={() => onEditProspect(prospect)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Modifier les informations de l'entreprise"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteProspect && (
                        <button
                          onClick={() => onDeleteProspect(prospect)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Supprimer cette entreprise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onSelectProspect(prospect)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Ouvrir la fiche client"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
