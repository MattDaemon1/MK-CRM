import React from 'react';
import {
  Mail,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  Phone,
  FileText
} from 'lucide-react';
import { Prospect, ProspectStatus } from '../../types/crm';
import { getDaysSinceDate } from '../../services/followUpEngine';

interface ProspectCardProps {
  prospect: Prospect;
  onSelect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onMoveStatus: (prospectId: string, newStatus: ProspectStatus) => void;
  availableStatuses: ProspectStatus[];
}

export const ProspectCard: React.FC<ProspectCardProps> = ({
  prospect,
  onSelect,
  onOpenFollowUp,
  onMoveStatus,
  availableStatuses
}) => {
  const daysSince = getDaysSinceDate(prospect.last_contact_date);
  const currentIndex = availableStatuses.indexOf(prospect.status);
  const canMovePrev = currentIndex > 0;
  const canMoveNext = currentIndex < availableStatuses.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMovePrev) {
      onMoveStatus(prospect.id, availableStatuses[currentIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveNext) {
      onMoveStatus(prospect.id, availableStatuses[currentIndex + 1]);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', prospect.id);
  };

  const isOldContact = daysSince >= 5 && prospect.status !== 'Gagné' && prospect.status !== 'Perdu';

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(prospect)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer select-none"
    >
      {/* Top Header: Company & Priority Score */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {prospect.company}
          </h4>
          <p className="text-[11px] text-slate-700 dark:text-slate-200">
            {prospect.contact_name}
          </p>
        </div>

        {/* Lead Score & Priority Badge */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 ${
              prospect.priority === 'Chaud'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                : prospect.priority === 'Tiède'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
            title={`Lead Score : ${prospect.lead_score}/100`}
          >
            {prospect.priority === 'Chaud' && <Flame className="w-2.5 h-2.5" />}
            <span>{prospect.lead_score}</span>
          </span>
        </div>
      </div>

      {/* Service Type Tag */}
      <div className="mb-2">
        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">
          {prospect.service_type}
        </span>
      </div>

      {/* Amount & Active MRR indicator */}
      <div className="flex items-baseline justify-between py-1 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
            {prospect.estimated_value.toLocaleString('fr-FR')} €
          </span>
          <span className="text-[10px] text-slate-700 dark:text-slate-200 ml-1">HT</span>
        </div>

        {prospect.active_services && prospect.active_services.length > 0 && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            +{prospect.active_services.reduce((a, b) => a + b.monthly_price, 0)} €/m
          </span>
        )}
      </div>

      {/* Last contact date & Alert */}
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-1">
          <Clock className={`w-3 h-3 ${isOldContact ? 'text-rose-500' : 'text-slate-400'}`} />
          <span className={isOldContact ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
            {daysSince === 0 ? "Aujourd'hui" : `Il y a ${daysSince}j`}
          </span>
        </div>

        {/* Zero-click quick actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFollowUp(prospect);
            }}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Générer un email de relance"
          >
            <Mail className="w-3 h-3" />
          </button>

          {canMovePrev && (
            <button
              onClick={handlePrev}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={`Déplacer vers ${availableStatuses[currentIndex - 1]}`}
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}

          {canMoveNext && (
            <button
              onClick={handleNext}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={`Déplacer vers ${availableStatuses[currentIndex + 1]}`}
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
