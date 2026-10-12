import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  Plus,
  Repeat,
  Trash2,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Flame,
  FileText,
  Edit2
} from 'lucide-react';
import {
  Prospect,
  ActiveService,
  TimelineEntry,
  ProspectStatus
} from '../../types/crm';
import { getDaysSinceDate } from '../../services/followUpEngine';

interface ClientDetailDrawerProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProspect: (updated: Prospect) => void;
  onEditProspect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onDeleteProspect: (prospectId: string) => void;
  onShowToast: (message: string) => void;
  availableServiceTypes?: string[];
  onAddServiceType?: (newType: string) => void;
}

const STATUS_OPTIONS: ProspectStatus[] = [
  'Lead entrant',
  'Contacté',
  'Proposition envoyée',
  'En attente de signature',
  'Gagné',
  'Perdu'
];

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  prospect,
  isOpen,
  onClose,
  onUpdateProspect,
  onEditProspect,
  onOpenFollowUp,
  onDeleteProspect,
  onShowToast,
  availableServiceTypes = [],
  onAddServiceType
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'timeline'>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');

  // New contract service form state
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceName, setServiceName] = useState('Création de site web sur-mesure');
  const [billingCycle, setBillingCycle] = useState<'Ponctuel' | 'Mensuel' | 'Trimestriel' | 'Annuel'>('Ponctuel');
  const [category, setCategory] = useState<'Projet / Création' | 'Maintenance' | 'Évolution' | 'Support' | 'Autre'>('Projet / Création');
  const [oneOffPrice, setOneOffPrice] = useState(3500);
  const [monthlyPrice, setMonthlyPrice] = useState(100);
  const [annualPrice, setAnnualPrice] = useState(1200);
  const [startDate, setStartDate] = useState('2026-10-11');
  const [renewalDate, setRenewalDate] = useState('2027-10-11');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(30);

  const daysSince = prospect ? getDaysSinceDate(prospect.last_contact_date) : 0;

  const totalClientMrr = (prospect?.active_services || []).reduce(
    (acc, s) => (s.status === 'Actif' && s.billing_cycle !== 'Ponctuel' ? acc + s.monthly_price : acc),
    0
  );

  const totalClientOneOff = (prospect?.active_services || []).reduce(
    (acc, s) => (s.billing_cycle === 'Ponctuel' ? acc + (s.one_off_price || 0) : acc),
    0
  );

  const handleStatusChange = (newStatus: ProspectStatus) => {
    const timelineEntry: TimelineEntry = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'status_change',
      content: `Statut passé à "${newStatus}"`
    };

    const updated: Prospect = {
      ...prospect,
      status: newStatus,
      timeline: [timelineEntry, ...(prospect.timeline || [])]
    };
    onUpdateProspect(updated);
    onShowToast(`Statut mis à jour : ${newStatus}`);
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: TimelineEntry = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: noteType,
      content: newNote.trim()
    };

    const updated: Prospect = {
      ...prospect,
      notes: [newNote.trim(), ...prospect.notes],
      timeline: [newEntry, ...(prospect.timeline || [])],
      last_contact_date: '2026-10-11'
    };

    onUpdateProspect(updated);
    setNewNote('');
    onShowToast('Note enregistrée & contact actualisé !');
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

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

    const newSrv: ActiveService = {
      id: `srv-${Date.now()}`,
      name: serviceName.trim(),
      monthly_price: calculatedMonthly,
      annual_price: calculatedAnnual,
      one_off_price: isOneOff ? Number(oneOffPrice) || 0 : undefined,
      billing_cycle: billingCycle,
      category,
      start_date: startDate || '2026-10-11',
      renewal_date: isOneOff ? (startDate || '2026-10-11') : renewalDate,
      status: 'Actif',
      reminder_days_before: isOneOff ? undefined : Number(reminderDaysBefore) || 30
    };

    const priceLabel = isOneOff
      ? `${Number(oneOffPrice) || 0} € HT (Forfait)`
      : billingCycle === 'Annuel'
      ? `${calculatedAnnual} €/an`
      : `${calculatedMonthly} €/mois`;

    const newTimelineEntry: TimelineEntry = {
      id: `t-${Date.now()}`,
      date: '2026-10-11 12:00',
      type: 'note',
      content: `Nouvelle prestation ajoutée : ${newSrv.name} (${priceLabel}${!isOneOff ? `, échéance le ${renewalDate}` : ''})`
    };

    const updated: Prospect = {
      ...prospect,
      active_services: [...(prospect.active_services || []), newSrv],
      timeline: [newTimelineEntry, ...(prospect.timeline || [])]
    };

    if (onAddServiceType && serviceName.trim()) {
      onAddServiceType(serviceName.trim());
    }

    onUpdateProspect(updated);
    setIsAddingService(false);
    onShowToast(`Contrat "${serviceName}" activé (+${calculatedMonthly} €/m MRR) !`);
  };

  const handleRenewContractOneYear = (serviceId: string) => {
    const srv = (prospect.active_services || []).find((s) => s.id === serviceId);
    if (!srv) return;

    // Advance renewal date by 1 year
    let nextDate = '2027-11-01';
    if (srv.renewal_date) {
      const parts = srv.renewal_date.split('-');
      if (parts.length === 3) {
        const nextYear = Number(parts[0]) + 1;
        nextDate = `${nextYear}-${parts[1]}-${parts[2]}`;
      }
    }

    const updatedServices = (prospect.active_services || []).map((s) => {
      if (s.id === serviceId) {
        return {
          ...s,
          renewal_date: nextDate,
          last_renewed_date: '2026-10-11',
          status: 'Actif' as const
        };
      }
      return s;
    });

    const newTimelineEntry: TimelineEntry = {
      id: `t-${Date.now()}`,
      date: '2026-10-11 12:00',
      type: 'note',
      content: `Reconduction confirmée pour 1 an du contrat "${srv.name}". Nouvelle date de renouvellement : ${nextDate}.`
    };

    const updated: Prospect = {
      ...prospect,
      active_services: updatedServices,
      timeline: [newTimelineEntry, ...(prospect.timeline || [])]
    };

    onUpdateProspect(updated);
    onShowToast(`Contrat "${srv.name}" reconduit jusqu'au ${nextDate} !`);
  };

  const handleRemoveService = (serviceId: string) => {
    const updated: Prospect = {
      ...prospect,
      active_services: (prospect.active_services || []).filter((s) => s.id !== serviceId)
    };
    onUpdateProspect(updated);
    onShowToast('Service retiré.');
  };

  if (!isOpen || !prospect) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {prospect.company}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-0.5 ${
                  prospect.priority === 'Chaud'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                    : prospect.priority === 'Tiède'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {prospect.priority === 'Chaud' && <Flame className="w-2.5 h-2.5" />}
                <span>Score {prospect.lead_score}</span>
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
              {prospect.contact_name} · {prospect.service_type}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEditProspect(prospect);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
              title="Modifier les informations de l'entreprise"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => onOpenFollowUp(prospect)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Générer un email de relance"
            >
              <Mail className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fiche Client & Pipeline
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Prestations & Contrats ({prospect.active_services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Historique & Notes
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Status and Value Quick Bar */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    Statut Pipeline
                  </span>
                  <select
                    value={prospect.status}
                    onChange={(e) => handleStatusChange(e.target.value as ProspectStatus)}
                    className="mt-1 w-full px-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    Montant de l'Affaire
                  </span>
                  <div className="mt-1 text-base font-mono font-bold text-slate-900 dark:text-white">
                    {prospect.estimated_value.toLocaleString('fr-FR')} € HT
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Coordonnées & Informations
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Email :</span>
                    <a
                      href={`mailto:${prospect.email}`}
                      className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {prospect.email || 'Non renseigné'}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Téléphone :</span>
                    <a
                      href={`tel:${prospect.phone}`}
                      className="font-mono text-slate-800 dark:text-slate-200"
                    >
                      {prospect.phone || 'Non renseigné'}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Source :</span>
                    <span className="text-slate-800 dark:text-slate-200">{prospect.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">Dernier Contact :</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {prospect.last_contact_date} (il y a {daysSince} jours)
                    </span>
                  </div>
                </div>
              </div>

              {/* Prestations & Contrats liés */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Prestations & Contrats ({prospect.active_services?.length || 0})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveTab('services');
                      setIsAddingService(true);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Ajouter prestation</span>
                  </button>
                </div>

                {(!prospect.active_services || prospect.active_services.length === 0) ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      Aucune prestation spécifique enregistrée (création site, maintenance, évolution...).
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('services');
                        setIsAddingService(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter une prestation à ce client</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {prospect.active_services.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setActiveTab('services')}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {srv.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            {srv.category && (
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                {srv.category}
                              </span>
                            )}
                            <span>·</span>
                            <span>{srv.billing_cycle}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {srv.billing_cycle === 'Ponctuel'
                            ? `${(srv.one_off_price || 0).toLocaleString('fr-FR')} €`
                            : `${srv.monthly_price} €/m`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes rapides */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notes & Historique
                </h3>
                <div className="space-y-2">
                  {prospect.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 font-semibold cursor-pointer py-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer cette entreprise / affaire</span>
                  </button>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      Confirmer la suppression de {prospect.company} ?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onDeleteProspect(prospect.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
                      >
                        Oui, supprimer
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-5">
              {/* MRR & Prestations Summary for this client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
                  <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                    Revenu Récurrent Mensuel (MRR)
                  </p>
                  <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {totalClientMrr.toLocaleString('fr-FR')} € / mois
                  </p>
                </div>
                <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300">
                      Prestations Forfaitaires Livrées / En cours
                    </p>
                    <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {totalClientOneOff.toLocaleString('fr-FR')} € HT
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingService(!isAddingService)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter prestation</span>
                  </button>
                </div>
              </div>

              {/* Add Service Form */}
              {isAddingService && (
                <form
                  onSubmit={handleAddService}
                  className="p-4 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ajouter une Prestation ou un Contrat
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Création, Évolution ou Récurrent
                    </span>
                  </div>

                  {/* Prestation Category */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Catégorie de la prestation
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                      {(['Projet / Création', 'Maintenance', 'Évolution', 'Support', 'Autre'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            if (cat === 'Projet / Création') {
                              setServiceName('Création de site web vitrine');
                              setBillingCycle('Ponctuel');
                              setOneOffPrice(3500);
                            } else if (cat === 'Maintenance') {
                              setServiceName('Pack Sérénité Maintenance');
                              setBillingCycle('Annuel');
                              setAnnualPrice(1200);
                              setMonthlyPrice(100);
                            } else if (cat === 'Évolution') {
                              setServiceName('Évolution module / Automatisation n8n');
                              setBillingCycle('Ponctuel');
                              setOneOffPrice(1800);
                            }
                          }}
                          className={`text-[9px] py-1 px-1.5 rounded-md border font-medium text-center transition-all cursor-pointer ${
                            category === cat
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nom de la prestation *
                    </label>
                    <input
                      type="text"
                      required
                      list="client-drawer-services-list"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Création site vitrine, Refonte e-commerce, Évolution n8n, Pack Sérénité..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                    <datalist id="client-drawer-services-list">
                      {availableServiceTypes.map((st) => (
                        <option key={st} value={st} />
                      ))}
                    </datalist>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {['Création site web WordPress', 'Évolution module n8n', 'Pack Sérénité (Maintenance)', 'Hébergement Dédié'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            setServiceName(st);
                            if (st.includes('Création')) {
                              setBillingCycle('Ponctuel');
                              setCategory('Projet / Création');
                              setOneOffPrice(3800);
                            } else if (st.includes('Évolution')) {
                              setBillingCycle('Ponctuel');
                              setCategory('Évolution');
                              setOneOffPrice(1500);
                            } else if (st.includes('Sérénité')) {
                              setBillingCycle('Annuel');
                              setCategory('Maintenance');
                              setAnnualPrice(1200);
                              setMonthlyPrice(100);
                            }
                          }}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                            serviceName === st
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Type de facturation
                      </label>
                      <select
                        value={billingCycle}
                        onChange={(e) => {
                          const cycle = e.target.value as 'Ponctuel' | 'Mensuel' | 'Trimestriel' | 'Annuel';
                          setBillingCycle(cycle);
                          if (cycle === 'Annuel') {
                            setRenewalDate('2027-10-11');
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
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
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Montant forfaitaire (€ HT)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            required
                            value={oneOffPrice}
                            onChange={(e) => setOneOffPrice(Number(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      ) : billingCycle === 'Annuel' ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Montant Annuel (€ HT)
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
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            ≈ {Math.round(annualPrice / 12)} € / mois (MRR)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Montant mensuel (€ HT)
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
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            = {monthlyPrice * 12} € / an (ARR)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {billingCycle === 'Ponctuel' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Date de commande / démarrage
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Date de renouvellement / échéance
                        </label>
                        <input
                          type="date"
                          value={renewalDate}
                          onChange={(e) => setRenewalDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Rappel d'échéance
                        </label>
                        <select
                          value={reminderDaysBefore}
                          onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value={30}>Alerter 30j avant (conseillé)</option>
                          <option value={15}>Alerter 15j avant</option>
                          <option value={7}>Alerter 7j avant</option>
                          <option value={60}>Alerter 60j avant</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                      Activer le contrat
                    </button>
                  </div>
                </form>
              )}

              {/* Active Services List */}
              <div className="space-y-3">
                {(!prospect.active_services || prospect.active_services.length === 0) ? (
                  <p className="text-xs text-center py-6 text-slate-700 dark:text-slate-200">
                    Aucun contrat ou abonnement actif pour ce client.
                  </p>
                ) : (
                  prospect.active_services.map((srv) => {
                    const daysToRenew = srv.renewal_date
                      ? Math.floor((new Date(srv.renewal_date).getTime() - new Date('2026-10-11').getTime()) / (1000 * 3600 * 24))
                      : 999;

                    return (
                      <div
                        key={srv.id}
                        className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {srv.name}
                            </span>
                            {srv.category && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-sm bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                {srv.category}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                              {srv.status}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-sm ${
                              srv.billing_cycle === 'Ponctuel'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            }`}>
                              {srv.billing_cycle}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200 mt-1">
                            {srv.billing_cycle === 'Ponctuel' ? (
                              <span>Démarré le : <strong className="font-mono">{srv.start_date || '2026-10-11'}</strong> · Forfait unique</span>
                            ) : (
                              <>
                                <span>Échéance : <strong className="font-mono">{srv.renewal_date}</strong></span>
                                <span>·</span>
                                {daysToRenew < 0 ? (
                                  <span className="font-bold text-rose-600 dark:text-rose-400">
                                    Échu depuis {Math.abs(daysToRenew)} j
                                  </span>
                                ) : daysToRenew <= 15 ? (
                                  <span className="font-bold text-amber-600 dark:text-amber-400">
                                    🔔 Urgent (dans {daysToRenew} j)
                                  </span>
                                ) : daysToRenew <= 30 ? (
                                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                                    🔔 À anticiper (dans {daysToRenew} j)
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    Dans {daysToRenew} jours
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {srv.billing_cycle === 'Ponctuel'
                                ? `${(srv.one_off_price || 0).toLocaleString('fr-FR')} € HT`
                                : srv.billing_cycle === 'Annuel'
                                ? `${(srv.annual_price || srv.monthly_price * 12).toLocaleString('fr-FR')} € / an`
                                : `${srv.monthly_price.toLocaleString('fr-FR')} € / mois`}
                            </p>
                            {srv.billing_cycle === 'Annuel' && (
                              <p className="text-[10px] font-mono text-slate-400">
                                {srv.monthly_price} €/m MRR
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {srv.billing_cycle !== 'Ponctuel' && (
                              <button
                                onClick={() => handleRenewContractOneYear(srv.id)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                                title="Reconduire ce contrat pour 1 an de plus"
                              >
                                +1 an
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveService(srv.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                              title="Supprimer cette prestation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Quick Note Input */}
              <form onSubmit={handleAddTimelineNote} className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={noteType}
                    onChange={(e) =>
                      setNoteType(e.target.value as 'note' | 'call' | 'email' | 'meeting')
                    }
                    className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                  >
                    <option value="note">Note interne</option>
                    <option value="call">Appel téléphonique</option>
                    <option value="email">Email</option>
                    <option value="meeting">Visio / RDV</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Consigner un échange, une décision..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </form>

              {/* Timeline Items */}
              <div className="space-y-3 pt-2">
                {(!prospect.timeline || prospect.timeline.length === 0) ? (
                  <p className="text-xs text-center py-4 text-slate-700 dark:text-slate-200">
                    Aucune entrée dans la chronologie.
                  </p>
                ) : (
                  prospect.timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200">
                        <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                          {entry.type === 'call'
                            ? '📞 Appel'
                            : entry.type === 'email'
                            ? '✉️ Email'
                            : entry.type === 'meeting'
                            ? '🤝 Réunion'
                            : '📝 Note'}
                        </span>
                        <span className="font-mono">{entry.date}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
