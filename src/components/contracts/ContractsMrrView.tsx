import React, { useState } from 'react';
import {
  Repeat,
  DollarSign,
  Calendar,
  AlertCircle,
  Plus,
  Building,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Prospect } from '../../types/crm';
import { MrrMetrics } from '../../services/storage';

interface ContractsMrrViewProps {
  prospects: Prospect[];
  mrrMetrics: MrrMetrics;
  onSelectProspect: (prospect: Prospect) => void;
}

export const ContractsMrrView: React.FC<ContractsMrrViewProps> = ({
  prospects,
  mrrMetrics,
  onSelectProspect
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Flatten contracts with their client
  const allContracts = prospects.flatMap((p) =>
    (p.active_services || []).map((srv) => ({
      ...srv,
      client: p
    }))
  );

  const filtered = allContracts.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Suivi des Contrats & Revenus Récurrents (MRR)
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Pilotage des abonnements, maintenance récurrente (Pack Sérénité) et dates de renouvellement
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              MRR Total Actif
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {mrrMetrics.monthlyMrr.toLocaleString('fr-FR')} €
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-200">/ mois</span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Revenus récurrents prévisibles
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              ARR Prévisionnel (Annuel)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {mrrMetrics.annualArr.toLocaleString('fr-FR')} €
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Base annuelle contractuelle
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Abonnements Souscrits
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {mrrMetrics.activeServicesCount}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Sur {mrrMetrics.activeClientsCount} client(s) actif(s)
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              MRR Moyen / Client
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {mrrMetrics.activeClientsCount > 0
                ? Math.round(mrrMetrics.monthlyMrr / mrrMetrics.activeClientsCount).toLocaleString(
                    'fr-FR'
                  )
                : 0}{' '}
              €
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Panier mensuel récurrent (ARPU)
          </p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Liste des Abonnements & Contrats en cours
          </h3>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Tous les états</option>
            <option value="Actif">Actif</option>
            <option value="En pause">En pause</option>
            <option value="Résilié">Résilié</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-900/60">
                <th className="py-3 px-4">Client / Entreprise</th>
                <th className="py-3 px-3">Service & Contrat</th>
                <th className="py-3 px-3">Montant Mensuel</th>
                <th className="py-3 px-3">Facturation</th>
                <th className="py-3 px-3">Date de Renouvellement</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-700 dark:text-slate-200 text-xs">
                    Aucun contrat actif répertorié.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectProspect(item.client)}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left"
                      >
                        {item.client.company}
                      </button>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200">
                        {item.client.contact_name}
                      </p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      {item.notes && (
                        <p className="text-[10px] text-slate-700 dark:text-slate-200 truncate max-w-xs">
                          {item.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.monthly_price.toLocaleString('fr-FR')} € / mois
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.billing_cycle}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {item.renewal_date}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          item.status === 'Actif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectProspect(item.client)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
