import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, Prospect } from '../../types/crm';

interface TicketListViewProps {
  tickets: Ticket[];
  prospects: Prospect[];
  onNewTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onChangeTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onSelectProspect: (prospect: Prospect) => void;
}

export const TicketListView: React.FC<TicketListViewProps> = ({
  tickets,
  prospects,
  onNewTicket,
  onEditTicket,
  onDeleteTicket,
  onChangeTicketStatus,
  onSelectProspect
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchComp = (t.client_company || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchComp && !matchDesc) return false;
    }
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'Ouvert').length;
  const inProgressCount = tickets.filter((t) => t.status === 'En cours').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Résolu').length;
  const blockingCount = tickets.filter(
    (t) => t.priority === 'Bloquant' && t.status !== 'Résolu'
  ).length;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Support & Maintenance Client
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Suivi des bugs, demandes d’évolution et tickets du Pack Sérénité
          </p>
        </div>

        <button
          onClick={onNewTicket}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau Ticket</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Tickets Ouverts</p>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {openCount}
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">En Cours de Traitement</p>
          <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {inProgressCount}
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Bloquants Urgents</p>
          <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {blockingCount}
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Résolus</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher ticket ou client (MP41, n8n...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="Ouvert">Ouvert</option>
            <option value="En cours">En cours</option>
            <option value="Résolu">Résolu</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes priorités</option>
            <option value="Bloquant">Bloquant</option>
            <option value="Normal">Normal</option>
            <option value="Bas">Bas</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 text-xs">
            Aucun ticket ne correspond aux critères sélectionnés.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isResolved = ticket.status === 'Résolu';
            const isBlocking = ticket.priority === 'Bloquant';
            const matchedProspect = prospects.find((p) => p.id === ticket.client_id);

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border transition-all bg-white dark:bg-slate-900 ${
                  isBlocking && !isResolved
                    ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                    : isResolved
                    ? 'border-slate-200/60 dark:border-slate-800 opacity-70'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                        #{ticket.id}
                      </span>
                      <h3
                        className={`text-sm font-bold ${
                          isResolved
                            ? 'line-through text-slate-700 dark:text-slate-300'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {ticket.title}
                      </h3>

                      {/* Priority tag */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          ticket.priority === 'Bloquant'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            : ticket.priority === 'Normal'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {ticket.priority}
                      </span>

                      {/* Category tag */}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {ticket.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed pt-0.5">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-700 dark:text-slate-200 pt-1">
                      <span>Client :</span>
                      {matchedProspect ? (
                        <button
                          onClick={() => onSelectProspect(matchedProspect)}
                          className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          {ticket.client_company}
                        </button>
                      ) : (
                        <span className="font-semibold">{ticket.client_company}</span>
                      )}
                      <span>·</span>
                      <span>Créé le {ticket.created_at}</span>
                      {ticket.time_spent_hours ? (
                        <>
                          <span>·</span>
                          <span className="font-mono">{ticket.time_spent_hours}h passées</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions Rapides Status Shift */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {ticket.status === 'Ouvert' && (
                      <button
                        onClick={() => onChangeTicketStatus(ticket.id, 'En cours')}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                      >
                        Passer En cours
                      </button>
                    )}

                    {ticket.status === 'En cours' && (
                      <button
                        onClick={() => onChangeTicketStatus(ticket.id, 'Résolu')}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                      >
                        Marquer Résolu
                      </button>
                    )}

                    {ticket.status === 'Résolu' && (
                      <button
                        onClick={() => onChangeTicketStatus(ticket.id, 'Ouvert')}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Réouvrir
                      </button>
                    )}

                    <button
                      onClick={() => onEditTicket(ticket)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Modifier le ticket"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteTicket(ticket.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Supprimer le ticket"
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
  );
};
