import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Send,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Prospect } from '../../types/crm';
import {
  FollowUpTone,
  generateFollowUpEmail,
  generateRenewalEmail,
  getDaysSinceDate
} from '../../services/followUpEngine';
import { ActiveService } from '../../types/crm';

interface FollowUpModalProps {
  prospect: Prospect | null;
  contract?: ActiveService | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkContactedToday: (prospectId: string, note?: string) => void;
  onShowToast: (message: string) => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  prospect,
  contract,
  isOpen,
  onClose,
  onMarkContactedToday,
  onShowToast
}) => {
  const [tone, setTone] = useState<FollowUpTone>('professionnel');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prospect) {
      if (contract) {
        const emailData = generateRenewalEmail(prospect, contract, tone);
        setSubject(emailData.subject);
        setBody(emailData.body);
      } else {
        const emailData = generateFollowUpEmail(prospect, tone);
        setSubject(emailData.subject);
        setBody(emailData.body);
      }
    }
  }, [prospect, contract, tone]);

  const daysSince = prospect ? getDaysSinceDate(prospect.last_contact_date) : 0;

  const handleCopy = () => {
    const fullText = `Objet : ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    onShowToast('Email copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(prospect.email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    onShowToast('Client mail ouvert.');
  };

  const handleMarkAndClose = () => {
    onMarkContactedToday(
      prospect.id,
      `Relance effectuée (${tone}) - Objet: "${subject}"`
    );
    onShowToast(`Date de contact mise à jour pour ${prospect.company} !`);
    onClose();
  };

  if (!isOpen || !prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {contract ? 'Relance Renouvellement de Contrat' : 'Assistant de Relance Intelligente'}
                <span className="text-xs font-normal text-slate-700 dark:text-slate-200">
                  · {prospect.company}
                </span>
              </h3>
              {contract ? (
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Contrat : <strong className="text-indigo-600 dark:text-indigo-400">{contract.name}</strong> · Échéance : <span className="font-mono font-semibold">{contract.renewal_date}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Dernier contact il y a <span className="font-semibold text-rose-600 dark:text-rose-400">{daysSince} jour(s)</span> ({prospect.last_contact_date})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tone Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Ton de l'email :
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(['professionnel', 'concis', 'chaleureux'] as FollowUpTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all cursor-pointer ${
                    tone === t
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Destinataire info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs border border-slate-200/60 dark:border-slate-800">
            <div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Contact :</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{prospect.contact_name}</span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Email :</span>{' '}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{prospect.email}</span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Statut :</span>{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{prospect.status}</span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-200 font-medium">Montant :</span>{' '}
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {prospect.estimated_value.toLocaleString('fr-FR')} € HT
              </span>
            </div>
          </div>

          {/* Subject field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objet du message
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Body field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message personnalisé
            </label>
            <textarea
              rows={7}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3 py-2 text-xs font-sans bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              onClick={handleOpenMailto}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir client Mail</span>
            </button>
          </div>

          <button
            onClick={handleMarkAndClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Valider & Marquer contacté aujourd'hui</span>
          </button>
        </div>
      </div>
    </div>
  );
};
