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
  onShowToast
}) => {
  if (!isOpen || !prospect) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'timeline'>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');

  // New contract service form state
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceName, setServiceName] = useState('Pack Sérénité Maintenance');
  const [monthlyPrice, setMonthlyPrice] = useState(250);
  const [renewalDate, setRenewalDate] = useState('2027-10-11');
  const [billingCycle, setBillingCycle] = useState<'Mensuel' | 'Trimestriel' | 'Annuel'>('Mensuel');

  const daysSince = getDaysSinceDate(prospect.last_contact_date);

  const totalClientMrr = (prospect.active_services || []).reduce(
    (acc, s) => (s.status === 'Actif' ? acc + s.monthly_price : acc),
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

    const newSrv: ActiveService = {
      id: `srv-${Date.now()}`,
      name: serviceName.trim(),
      monthly_price: Number(monthlyPrice) || 0,
      billing_cycle: billingCycle,
      start_date: '2026-10-11',
      renewal_date: renewalDate,
      status: 'Actif'
    };

    const updated: Prospect = {
      ...prospect,
      active_services: [...(prospect.active_services || []), newSrv]
    };

    onUpdateProspect(updated);
    setIsAddingService(false);
    onShowToast(`Contrat "${serviceName}" ajouté (+${monthlyPrice} €/m MRR) !`);
  };

  const handleRemoveService = (serviceId: string) => {
    const updated: Prospect = {
      ...prospect,
      active_services: (prospect.active_services || []).filter((s) => s.id !== serviceId)
    };
    onUpdateProspect(updated);
    onShowToast('Service retiré.');
  };

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
            Contrats & MRR ({prospect.active_services?.length || 0})
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
              {/* MRR Summary for this client */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Revenu Récurrent Mensuel (MRR)
                  </p>
                  <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {totalClientMrr.toLocaleString('fr-FR')} € / mois
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingService(!isAddingService)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter contrat</span>
                </button>
              </div>

              {/* Add Service Form */}
              {isAddingService && (
                <form
                  onSubmit={handleAddService}
                  className="p-4 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl space-y-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Nouveau Contrat de Récurrence
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nom du service
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Pack Sérénité, Maintenance n8n, Cloud..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Montant mensuel (€)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Facturation
                      </label>
                      <select
                        value={billingCycle}
                        onChange={(e) =>
                          setBillingCycle(e.target.value as 'Mensuel' | 'Trimestriel' | 'Annuel')
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Mensuel">Mensuel</option>
                        <option value="Trimestriel">Trimestriel</option>
                        <option value="Annuel">Annuel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date de renouvellement
                    </label>
                    <input
                      type="date"
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Ajouter
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
                  prospect.active_services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {srv.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            {srv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 mt-0.5">
                          Renouvellement : <span className="font-mono">{srv.renewal_date}</span> ·{' '}
                          {srv.billing_cycle}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {srv.monthly_price} €/m
                        </span>
                        <button
                          onClick={() => handleRemoveService(srv.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Supprimer ce contrat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
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
