import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calculator,
  Save,
  Building,
  User,
  Mail,
  Phone,
  Euro,
  Flame
} from 'lucide-react';
import {
  Prospect,
  ProspectStatus,
  PriorityLevel,
  ServiceType
} from '../../types/crm';
import { computeLeadScore, ScoreResult } from '../../services/leadScorer';
import { Plus } from 'lucide-react';

interface ProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prospect: Partial<Prospect>) => void;
  editingProspect: Prospect | null;
  initialStatus?: ProspectStatus;
  availableServiceTypes?: string[];
  onAddServiceType?: (newType: string) => void;
}

const DEFAULT_SERVICE_OPTIONS: ServiceType[] = [
  'Refonte & Dev Web',
  'IA & Automatisation',
  'Workflows n8n',
  'Pack Sérénité (Maintenance)',
  'Application sur-mesure',
  'Audit & Conseil',
  'SEO & Référencement',
  'Formation & Coaching',
  'Hébergement & Infogérance'
];

const STATUS_OPTIONS: ProspectStatus[] = [
  'Lead entrant',
  'Contacté',
  'Proposition envoyée',
  'En attente de signature',
  'Gagné',
  'Perdu'
];

export const ProspectModal: React.FC<ProspectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProspect,
  initialStatus,
  availableServiceTypes = DEFAULT_SERVICE_OPTIONS,
  onAddServiceType
}) => {
  const [isAddingCustomType, setIsAddingCustomType] = useState(false);
  const [newCustomTypeName, setNewCustomTypeName] = useState('');

  const [company, setCompany] = useState(editingProspect?.company || '');
  const [contactName, setContactName] = useState(editingProspect?.contact_name || '');
  const [email, setEmail] = useState(editingProspect?.email || '');
  const [phone, setPhone] = useState(editingProspect?.phone || '');
  const [source, setSource] = useState(editingProspect?.source || 'Formulaire de contact web');
  const [serviceType, setServiceType] = useState<ServiceType>(
    editingProspect?.service_type || 'Refonte & Dev Web'
  );
  const [status, setStatus] = useState<ProspectStatus>(
    editingProspect?.status || initialStatus || 'Lead entrant'
  );
  const [estimatedValue, setEstimatedValue] = useState<number>(
    editingProspect?.estimated_value || 3500
  );
  const [lastContactDate, setLastContactDate] = useState<string>(
    editingProspect?.last_contact_date || '2026-10-11'
  );
  const [notes, setNotes] = useState<string>(
    editingProspect?.notes ? editingProspect.notes.join('\n') : ''
  );

  // Manual score override toggle or auto
  const [manualScore, setManualScore] = useState<number>(editingProspect?.lead_score || 80);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Sync state whenever editingProspect or modal open status changes
  useEffect(() => {
    if (editingProspect) {
      setCompany(editingProspect.company);
      setContactName(editingProspect.contact_name);
      setEmail(editingProspect.email);
      setPhone(editingProspect.phone);
      setSource(editingProspect.source);
      setServiceType(editingProspect.service_type);
      setStatus(editingProspect.status);
      setEstimatedValue(editingProspect.estimated_value);
      setLastContactDate(editingProspect.last_contact_date);
      setNotes(editingProspect.notes ? editingProspect.notes.join('\n') : '');
      setManualScore(editingProspect.lead_score);
    } else {
      setCompany('');
      setContactName('');
      setEmail('');
      setPhone('');
      setSource('Formulaire de contact web');
      setServiceType('Refonte & Dev Web');
      setStatus(initialStatus || 'Lead entrant');
      setEstimatedValue(3500);
      setLastContactDate('2026-10-11');
      setNotes('');
      setManualScore(80);
    }
    setIsManualOverride(false);
  }, [editingProspect, initialStatus, isOpen]);

  // Live computed score result
  const [scoreResult, setScoreResult] = useState<ScoreResult>(() =>
    computeLeadScore({
      estimatedValue: editingProspect?.estimated_value || 3500,
      serviceType: editingProspect?.service_type || 'Refonte & Dev Web',
      source: editingProspect?.source || 'Formulaire de contact web',
      lastContactDate: editingProspect?.last_contact_date || '2026-10-11'
    })
  );

  useEffect(() => {
    const computed = computeLeadScore({
      estimatedValue: Number(estimatedValue) || 0,
      serviceType,
      source,
      lastContactDate
    });
    setScoreResult(computed);
    if (!isManualOverride) {
      setManualScore(computed.score);
    }
  }, [estimatedValue, serviceType, source, lastContactDate, isManualOverride]);

  const currentPriority: PriorityLevel = isManualOverride
    ? manualScore >= 75
      ? 'Chaud'
      : manualScore >= 50
      ? 'Tiède'
      : 'Froid'
    : scoreResult.priority;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;

    const notesList = notes
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);

    onSave({
      id: editingProspect?.id || `p-${Date.now().toString().slice(-4)}`,
      company: company.trim(),
      contact_name: contactName.trim() || 'Contact',
      email: email.trim(),
      phone: phone.trim(),
      source,
      service_type: serviceType,
      status,
      estimated_value: Number(estimatedValue) || 0,
      lead_score: isManualOverride ? manualScore : scoreResult.score,
      priority: currentPriority,
      last_contact_date: lastContactDate,
      notes: notesList.length > 0 ? notesList : ['Demande enregistrée.'],
      active_services: editingProspect?.active_services || [],
      timeline: editingProspect?.timeline || [
        {
          id: `t-${Date.now()}`,
          date: '2026-10-11 12:00',
          type: 'status_change',
          content: `Création du prospect avec le statut "${status}"`
        }
      ]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingProspect ? `Modifier : ${editingProspect.company}` : 'Nouveau Prospect / Affaire'}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                Qualification rapide & Scoring automatique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Entreprise * (ex: MP41)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="MP41, Logistique Sologne..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nom du Contact
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jean Dupont, Contact MP41..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@mp41.fr"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Service & Montant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Type de Prestation
                </label>
                {!isAddingCustomType ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomType(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter un type</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustomType(false);
                      setNewCustomTypeName('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {!isAddingCustomType ? (
                <select
                  value={serviceType}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingCustomType(true);
                    } else {
                      setServiceType(e.target.value as ServiceType);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {Array.from(new Set([...availableServiceTypes, serviceType])).filter(Boolean).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="__add_new__">+ Ajouter un type personnalisé...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newCustomTypeName}
                    onChange={(e) => setNewCustomTypeName(e.target.value)}
                    placeholder="Ex: Branding, Formation, Intégration..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newCustomTypeName.trim();
                        if (trimmed) {
                          setServiceType(trimmed);
                          if (onAddServiceType) onAddServiceType(trimmed);
                          setIsAddingCustomType(false);
                          setNewCustomTypeName('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCustomTypeName.trim();
                      if (trimmed) {
                        setServiceType(trimmed);
                        if (onAddServiceType) onAddServiceType(trimmed);
                        setIsAddingCustomType(false);
                        setNewCustomTypeName('');
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Montant estimé (€ HT)
              </label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Status, Source, Last Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Statut Initial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Formulaire web, LinkedIn..."
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dernier contact
              </label>
              <input
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Lead Scoring Engine Card (Interactive) */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Moteur de Lead Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 ${
                    currentPriority === 'Chaud'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                      : currentPriority === 'Tiède'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {currentPriority === 'Chaud' && <Flame className="w-3 h-3" />}
                  Priorité {currentPriority} ({isManualOverride ? manualScore : scoreResult.score}/100)
                </span>
              </div>
            </div>

            {/* Score points breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              {scoreResult.breakdown.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30"
                >
                  <p className="text-slate-700 dark:text-slate-200 truncate">{b.label}</p>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    +{b.points} pts
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes initiales */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Contexte initial
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails du besoin, cahier des charges, remarques..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer le prospect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
