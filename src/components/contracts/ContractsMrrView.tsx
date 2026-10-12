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
  ShieldCheck,
  HelpCircle,
  Clock,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Prospect, ActiveService } from '../../types/crm';
import { MrrMetrics, getDaysUntilRenewal } from '../../services/storage';

interface ContractsMrrViewProps {
  prospects: Prospect[];
  mrrMetrics: MrrMetrics;
  onSelectProspect: (prospect: Prospect) => void;
  onNewContract: () => void;
  onRenewContractOneYear: (clientId: string, contractId: string) => void;
  onOpenRenewalEmail: (prospect: Prospect, contract: ActiveService) => void;
}

export const ContractsMrrView: React.FC<ContractsMrrViewProps> = ({
  prospects,
  mrrMetrics,
  onSelectProspect,
  onNewContract,
  onRenewContractOneYear,
  onOpenRenewalEmail
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Flatten contracts with their client
  const allContracts = prospects.flatMap((p) =>
    (p.active_services || []).map((srv) => ({
      ...srv,
      client: p
    }))
  );

  // Filter logic
  const filtered = allContracts.filter((c) => {
    if (filterType === 'all') return true;
    if (filterType === 'renewals') {
      const days = getDaysUntilRenewal(c.renewal_date);
      return days <= 45 && c.status === 'Actif' && c.billing_cycle !== 'Ponctuel';
    }
    if (filterType === 'ponctuel') return c.billing_cycle === 'Ponctuel';
    if (filterType === 'annual') return c.billing_cycle === 'Annuel';
    if (filterType === 'monthly') return c.billing_cycle === 'Mensuel';
    if (filterType === 'paused') return c.status !== 'Actif';
    return true;
  });

  // Upcoming renewals (< 45 days)
  const urgentRenewals = allContracts.filter((c) => {
    if (c.status !== 'Actif' || !c.renewal_date) return false;
    const days = getDaysUntilRenewal(c.renewal_date);
    return days <= 45;
  }).sort((a, b) => getDaysUntilRenewal(a.renewal_date) - getDaysUntilRenewal(b.renewal_date));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Abonnements Récurrents & Contrats Annuels (MRR / ARR)
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {allContracts.filter((c) => c.status === 'Actif').length} actifs
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Pilotage de la maintenance (Pack Sérénité), des abonnements annuels et alertes de renouvellement
          </p>
        </div>

        <button
          onClick={onNewContract}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Contrat / Abonnement</span>
        </button>
      </div>

      {/* Explanatory Guide Banner */}
      <div className="bg-gradient-to-r from-indigo-50/90 to-emerald-50/90 dark:from-indigo-950/30 dark:to-emerald-950/30 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Comment fonctionne le suivi des contrats récurrents ?
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Guide pratique
                </span>
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">
                Idéal pour les forfaits de maintenance (Pack Sérénité), l'infogérance, et les abonnements annuels ou mensuels.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{showExplanation ? 'Masquer' : 'Afficher les détails'}</span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showExplanation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-indigo-200/60 dark:border-indigo-900/40 text-xs">
            <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-indigo-100 dark:border-slate-800">
              <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1">
                <span>1. Abonnements Annuels & Mensuels</span>
              </p>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[11px]">
                Enregistrez le montant annuel directement (ex : <strong>1 200 € / an</strong> pour un Pack Sérénité). MK CRM calcule automatiquement le revenu mensuel équivalent (MRR : <strong>100 €/m</strong>) et annuel (ARR : <strong>1 200 €/an</strong>).
              </p>
            </div>

            <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-indigo-100 dark:border-slate-800">
              <p className="font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                <span>2. Rappels de Renouvellement</span>
              </p>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[11px]">
                Vous êtes automatiquement prévenu <strong>30 jours avant la date de fin</strong>. Un compte à rebours (J-30, J-15, Échu) apparaît sur votre tableau de bord afin que vous puissiez relancer le client à temps sans jamais oublier.
              </p>
            </div>

            <div className="p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-indigo-100 dark:border-slate-800">
              <p className="font-bold text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                <span>3. Relance & Reconduction en 1 clic</span>
              </p>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[11px]">
                Cliquez sur <strong>"Relancer"</strong> pour générer un email de renouvellement sur-mesure ou sur <strong>"+1 an"</strong> pour reconduire le contrat instantanément jusqu'à l'année suivante et tracer la note dans l'historique client.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              MRR Mensuel Actif
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
            Revenu mensuel récurrent garanti
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              ARR Annuel Contractuel
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
            Base annuelle contractée (MRR × 12)
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
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {mrrMetrics.activeServicesCount}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-200">
              ({mrrMetrics.annualContractsCount} annuels)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Sur {mrrMetrics.activeClientsCount} client(s) récurrent(s)
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Renouvellements Proches
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${urgentRenewals.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {urgentRenewals.length}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-200">contrat(s)</span>
          </div>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
            Échéance sous 45 jours à anticiper
          </p>
        </div>
      </div>

      {/* Urgent Renewals Alert Box if any */}
      {urgentRenewals.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  🔔 Alertes de Renouvellement à anticiper ({urgentRenewals.length})
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Ces contrats annuels ou mensuels arrivent à échéance. Pensez à relancer pour reconduire et facturer !
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {urgentRenewals.map((item) => {
              const days = getDaysUntilRenewal(item.renewal_date);
              const priceLabel = item.annual_price
                ? `${item.annual_price.toLocaleString('fr-FR')} € / an`
                : `${(item.monthly_price * 12).toLocaleString('fr-FR')} € / an (${item.monthly_price} €/m)`;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.client.company}
                      </span>
                      {days < 0 ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Échu ({Math.abs(days)}j)
                        </span>
                      ) : days <= 15 ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Urgent : J-{days}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Dans {days} jours
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200 truncate mt-0.5">
                      {item.name} · <strong className="font-mono text-emerald-600 dark:text-emerald-400">{priceLabel}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Échéance : {item.renewal_date} ({item.client.contact_name})
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenRenewalEmail(item.client, item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                      title="Générer l'email de relance de renouvellement"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Relancer</span>
                    </button>

                    <button
                      onClick={() => onRenewContractOneYear(item.client.id, item.id)}
                      className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                      title="Reconduire le contrat pour +1 an"
                    >
                      +1 an
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Liste de tous les Contrats & Abonnements ({filtered.length})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Reconduction, calculs du MRR et dates d'échéances
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les prestations & contrats ({allContracts.length})</option>
              <option value="renewals">🔔 Renouvellements proches ({urgentRenewals.length})</option>
              <option value="ponctuel">🎯 Prestations ponctuelles (Forfaits)</option>
              <option value="annual">🔄 Abonnements annuels</option>
              <option value="monthly">📅 Abonnements mensuels</option>
              <option value="paused">En pause / Résiliés</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-900/60">
                <th className="py-3 px-4">Client / Entreprise</th>
                <th className="py-3 px-3">Prestation & Nature</th>
                <th className="py-3 px-3">Périodicité & Montant</th>
                <th className="py-3 px-3">MRR Mensuel</th>
                <th className="py-3 px-3">Date / Échéance</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-700 dark:text-slate-200 text-xs">
                    Aucun contrat ne correspond à ce filtre.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const daysToRenew = getDaysUntilRenewal(item.renewal_date);

                  return (
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.name}
                          </span>
                          {item.category && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 font-medium">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[10px] text-slate-700 dark:text-slate-200 truncate max-w-xs mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.billing_cycle === 'Ponctuel'
                            ? `${(item.one_off_price || 0).toLocaleString('fr-FR')} € HT`
                            : item.billing_cycle === 'Annuel'
                            ? `${(item.annual_price || item.monthly_price * 12).toLocaleString('fr-FR')} € / an`
                            : `${item.monthly_price.toLocaleString('fr-FR')} € / mois`}
                        </span>
                        <span className={`ml-1.5 px-1.5 py-0.2 rounded-sm text-[10px] font-medium ${
                          item.billing_cycle === 'Ponctuel'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {item.billing_cycle}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.billing_cycle === 'Ponctuel' ? '—' : `${item.monthly_price.toLocaleString('fr-FR')} € / mois`}
                      </td>

                      <td className="py-3 px-3">
                        {item.billing_cycle === 'Ponctuel' ? (
                          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                            Commande : {item.start_date || '2026-10-11'}
                          </span>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300">
                              <span>{item.renewal_date}</span>
                            </div>
                            <div className="mt-0.5">
                              {daysToRenew < 0 ? (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  Échu depuis {Math.abs(daysToRenew)} j
                                </span>
                              ) : daysToRenew <= 15 ? (
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                  🔔 Urgent : dans {daysToRenew} j
                                </span>
                              ) : daysToRenew <= 45 ? (
                                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                  🔔 À anticiper : dans {daysToRenew} j
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">
                                  Dans {daysToRenew} jours
                                </span>
                              )}
                            </div>
                          </>
                        )}
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
                        <div className="flex items-center justify-end gap-1.5">
                          {item.billing_cycle !== 'Ponctuel' && (
                            <>
                              <button
                                onClick={() => onOpenRenewalEmail(item.client, item)}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                                title="Préparer l'email de relance pour renouvellement"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onRenewContractOneYear(item.client.id, item.id)}
                                className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                                title="Reconduire le contrat pour +1 an"
                              >
                                +1 an
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => onSelectProspect(item.client)}
                            className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            Fiche
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
