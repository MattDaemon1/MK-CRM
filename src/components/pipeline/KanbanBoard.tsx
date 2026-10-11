import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Prospect, ProspectStatus } from '../../types/crm';
import { ProspectCard } from './ProspectCard';

interface KanbanBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onOpenFollowUp: (prospect: Prospect) => void;
  onMoveStatus: (prospectId: string, newStatus: ProspectStatus) => void;
  onNewProspectWithStatus?: (status: ProspectStatus) => void;
  onEditProspect?: (prospect: Prospect) => void;
  onDeleteProspect?: (prospect: Prospect) => void;
}

const COLUMNS: { id: ProspectStatus; label: string; dotColor: string }[] = [
  { id: 'Lead entrant', label: 'Lead entrant', dotColor: 'bg-blue-500' },
  { id: 'Contacté', label: 'Contacté', dotColor: 'bg-indigo-500' },
  { id: 'Proposition envoyée', label: 'Proposition envoyée', dotColor: 'bg-amber-500' },
  { id: 'En attente de signature', label: 'En attente de signature', dotColor: 'bg-purple-500' },
  { id: 'Gagné', label: 'Gagné', dotColor: 'bg-emerald-500' },
  { id: 'Perdu', label: 'Perdu', dotColor: 'bg-slate-400' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  prospects,
  onSelectProspect,
  onOpenFollowUp,
  onMoveStatus,
  onNewProspectWithStatus,
  onEditProspect,
  onDeleteProspect
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<ProspectStatus | null>(null);

  const statusesList = COLUMNS.map((c) => c.id);

  const handleDragOver = (e: React.DragEvent, status: ProspectStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: ProspectStatus) => {
    e.preventDefault();
    const prospectId = e.dataTransfer.getData('text/plain');
    if (prospectId) {
      onMoveStatus(prospectId, status);
    }
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
      {COLUMNS.map((column) => {
        const columnProspects = prospects.filter((p) => p.status === column.id);
        const columnTotal = columnProspects.reduce((acc, p) => acc + (p.estimated_value || 0), 0);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-xl border p-2.5 transition-all min-h-[500px] ${
              isOver
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                : 'border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            {/* Column Header */}
            <div className="px-1.5 py-1 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${column.dotColor}`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {column.label}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  {columnProspects.length}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-200 font-medium">Sous-total :</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {columnTotal.toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1">
              {columnProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onSelect={onSelectProspect}
                  onOpenFollowUp={onOpenFollowUp}
                  onMoveStatus={onMoveStatus}
                  availableStatuses={statusesList}
                  onEditProspect={onEditProspect}
                  onDeleteProspect={onDeleteProspect}
                />
              ))}

              {columnProspects.length === 0 && (
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 text-xs text-center p-2">
                  Glisser une affaire ici
                </div>
              )}
            </div>

            {/* Quick add button in column */}
            {onNewProspectWithStatus && (
              <button
                onClick={() => onNewProspectWithStatus(column.id)}
                className="mt-2 w-full py-1.5 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Ajouter</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
