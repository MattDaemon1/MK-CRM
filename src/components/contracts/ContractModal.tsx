import React, { useState } from 'react';
import { X, Repeat, Save, Building, Calendar, DollarSign, Bell } from 'lucide-react';
import { Prospect, ActiveService } from '../../types/crm';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: Prospect[];
  onSaveContract: (clientId: string, contract: ActiveService) => void;
  defaultClientId?: string;
  availableServiceTypes?: string[];
  onAddServiceType?: (newType: string) => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  prospects,
  onSaveContract,
  defaultClientId,
  availableServiceTypes = [],
  onAddServiceType
}) => {
  const eligibleClients = prospects.filter((p) => p.status !== 'Perdu');
  const [selectedClientId, setSelectedClientId] = useState<string>(
    defaultClientId || eligibleClients[0]?.id || ''
  );
  const [contractName, setContractName] = useState('Création de site web sur-mesure');
  const [billingCycle, setBillingCycle] = useState<'Ponctuel' | 'Annuel' | 'Mensuel' | 'Trimestriel'>('Ponctuel');
  const [category, setCategory] = useState<'Projet / Création' | 'Maintenance' | 'Évolution' | 'Support' | 'Autre'>('Projet / Création');
  const [oneOffPrice, setOneOffPrice] = useState<number>(3500);
  const [annualPrice, setAnnualPrice] = useState<number>(1200);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(100);
  const [startDate, setStartDate] = useState('2026-10-11');
  const [renewalDate, setRenewalDate] = useState('2027-10-11');
  const [reminderDays, setReminderDays] = useState<number>(30);
  const [notes, setNotes] = useState('Cahier des charges, livrables convenus et accompagnement.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !contractName.trim()) return;

    const isOneOff = billingCycle === 'Ponctuel';

    const calculatedMonthly = isOneOff
      ? 0
      : billingCycle === 'Annuel'
      ? Math.round((Number(annualPrice) || 0) / 12)
      : Number(monthlyPrice) || 0;

    const calculatedAnnual = isOneOff
      ? undefined
      : billingCycle === 'Annuel'
      ? Number(annualPrice) || 0
      : (Number(monthlyPrice) || 0) * 12;

    const newContract: ActiveService = {
      id: `srv-${Date.now()}`,
      name: contractName.trim(),
      monthly_price: calculatedMonthly,
      annual_price: calculatedAnnual,
      one_off_price: isOneOff ? Number(oneOffPrice) || 0 : undefined,
      billing_cycle: billingCycle,
      category,
      start_date: startDate,
      renewal_date: isOneOff ? startDate : renewalDate,
      status: 'Actif',
      reminder_days_before: isOneOff ? undefined : Number(reminderDays) || 30,
      notes: notes.trim()
    };

    if (onAddServiceType && contractName.trim()) {
      onAddServiceType(contractName.trim());
    }

    onSaveContract(selectedClientId, newContract);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ajouter une Prestation ou un Contrat
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Création de site, évolution, mission forfaitaire ou abonnement récurrent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client ou Entreprise concernée *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {eligibleClients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company} ({p.contact_name}) - {p.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prestation Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nature de la prestation
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['Projet / Création', 'Maintenance', 'Évolution', 'Support', 'Autre'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat === 'Projet / Création') {
                      setContractName('Création de site web vitrine');
                      setBillingCycle('Ponctuel');
                      setOneOffPrice(3500);
                    } else if (cat === 'Maintenance') {
                      setContractName('Pack Sérénité Maintenance');
                      setBillingCycle('Annuel');
                      setAnnualPrice(1200);
                      setMonthlyPrice(100);
                    } else if (cat === 'Évolution') {
                      setContractName('Évolution module / Automatisation n8n');
                      setBillingCycle('Ponctuel');
                      setOneOffPrice(1800);
                    }
                  }}
                  className={`text-[10px] py-1.5 px-2 rounded-lg border font-medium transition-all text-center cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Contract Name & Service Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Intitulé de la prestation *
              </label>
              {availableServiceTypes.length > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Modèles ou saisie libre
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                required
                list="contract-service-types-list"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="Ex: Création site web, Maintenance n8n, Évolution portail..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <datalist id="contract-service-types-list">
                {availableServiceTypes.map((st) => (
                  <option key={st} value={st} />
                ))}
              </datalist>

              {/* Quick suggestions chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Exemples rapides :</span>
                {Array.from(new Set([
                  'Création site web WordPress',
                  'Refonte e-commerce Shopify',
                  'Pack Sérénité (Maintenance)',
                  'Évolution workflows n8n',
                  'Hébergement & Infogérance'
                ])).map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => {
                      setContractName(template);
                      if (template.includes('Création') || template.includes('Refonte')) {
                        setBillingCycle('Ponctuel');
                        setCategory('Projet / Création');
                        setOneOffPrice(3800);
                      } else if (template.includes('Évolution')) {
                        setBillingCycle('Ponctuel');
                        setCategory('Évolution');
                        setOneOffPrice(1500);
                      } else if (template.includes('Sérénité')) {
                        setBillingCycle('Annuel');
                        setCategory('Maintenance');
                        setAnnualPrice(1200);
                        setMonthlyPrice(100);
                      }
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      contractName === template
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Billing frequency & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type de facturation
              </label>
              <select
                value={billingCycle}
                onChange={(e) => {
                  const cycle = e.target.value as 'Ponctuel' | 'Annuel' | 'Mensuel' | 'Trimestriel';
                  setBillingCycle(cycle);
                  if (cycle === 'Annuel') {
                    setRenewalDate('2027-10-11');
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Ponctuel">🎯 Prestation ponctuelle (Forfait)</option>
                <option value="Annuel">🔄 Abonnement Annuel (avec rappel)</option>
                <option value="Mensuel">📅 Abonnement Mensuel</option>
                <option value="Trimestriel">📆 Abonnement Trimestriel</option>
              </select>
            </div>

            <div>
              {billingCycle === 'Ponctuel' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prix de la prestation (€ HT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={oneOffPrice}
                    onChange={(e) => setOneOffPrice(Number(e.target.value) || 0)}
                    placeholder="Ex: 3500"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Montant facturé à la livraison ou selon jalons
                  </p>
                </div>
              ) : billingCycle === 'Annuel' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Montant Annuel (€ HT / an)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={annualPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setAnnualPrice(val);
                      setMonthlyPrice(Math.round(val / 12));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Équivalent MRR : ≈ {Math.round(annualPrice / 12)} € / mois
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Montant Mensuel (€ HT / mois)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={monthlyPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setMonthlyPrice(val);
                      setAnnualPrice(val * 12);
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Équivalent ARR : {monthlyPrice * 12} € / an
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates & Renewal alert (only for recurring or completion for one-off) */}
          {billingCycle === 'Ponctuel' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date de début / commande
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Statut de la prestation
                </label>
                <div className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                  🚀 En cours d'exécution
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date de renouvellement / fin
                </label>
                <input
                  type="date"
                  required
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rappel d'échéance automatique
                </label>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={30}>Alerter 30 jours avant (conseillé)</option>
                  <option value={15}>Alerter 15 jours avant</option>
                  <option value={7}>Alerter 7 jours avant</option>
                  <option value={60}>Alerter 60 jours avant</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Détails & Prestations incluses
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Description des prestations récurrentes, SLA, engagements..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Créer le contrat & programmer le rappel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
