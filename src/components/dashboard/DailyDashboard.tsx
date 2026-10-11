import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Plus,
  Send,
  Calendar,
  DollarSign,
  ChevronRight,
  LifeBuoy,
  FileCheck,
  Building,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';
import { Prospect, Ticket, DailyTask, ActiveService } from '../../types/crm';
import { StatCard } from './StatCard';
import { FollowUpAlert } from '../../services/followUpEngine';
import { PipelineMetrics, MrrMetrics } from '../../services/storage';

interface DailyDashboardProps {
  prospects: Prospect[];
  tickets: Ticket[];
  tasks: DailyTask[];
  followUpAlerts: FollowUpAlert[];
  pipelineMetrics: PipelineMetrics;
  mrrMetrics: MrrMetrics;
  onOpenFollowUpModal: (prospect: Prospect) => void;
  onMarkContactedToday: (prospectId: string, note?: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, priority: 'Haute' | 'Moyenne' | 'Basse') => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompletedTasks?: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  onNavigateToTab: (tab: 'leads' | 'pipeline' | 'tickets' | 'contracts') => void;
  onOpenRenewalEmail?: (client: Prospect, contract: ActiveService) => void;
  onRenewContractOneYear?: (clientId: string, contractId: string) => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  prospects,
  tickets,
  tasks,
  followUpAlerts,
  pipelineMetrics,
  mrrMetrics,
  onOpenFollowUpModal,
  onMarkContactedToday,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onClearCompletedTasks,
  onSelectProspect,
  onNavigateToTab,
  onOpenRenewalEmail,
  onRenewContractOneYear
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Haute' | 'Moyenne' | 'Basse'>('Haute');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
  };

  const blockingTickets = tickets.filter(
    (t) => t.status !== 'Résolu' && (t.priority === 'Bloquant' || t.priority === 'Normal')
  );

  const upcomingRenewals = prospects
    .flatMap((p) =>
      (p.active_services || []).map((srv) => ({
        ...srv,
        client: p
      }))
    )
    .filter((c) => {
      if (c.status !== 'Actif' || !c.renewal_date) return false;
      const target = new Date(c.renewal_date);
      const diffTime = target.getTime() - new Date('2026-10-11').getTime();
      const days = Math.floor(diffTime / (1000 * 3600 * 24));
      return days <= 45;
    })
    .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cockpit du Jour & Actions Prioritaires
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
            Dimanche 11 octobre 2026 · Pilotage en temps réel avec zéro clic superflu
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {tasks.length - completedTasksCount} tâches restantes
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {followUpAlerts.length} relances requises
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CA Pipeline En Cours"
          value={`${pipelineMetrics.totalPipelineValue.toLocaleString('fr-FR')} €`}
          subtitle={`Pondéré : ${pipelineMetrics.weightedPipelineValue.toLocaleString('fr-FR')} € (${pipelineMetrics.activeProspectsCount} affaires)`}
          icon={TrendingUp}
          colorScheme="indigo"
          badge={`${pipelineMetrics.hotCount} chauds`}
        />

        <StatCard
          title="MRR Récurrent Actif"
          value={`${mrrMetrics.monthlyMrr.toLocaleString('fr-FR')} €/m`}
          subtitle={`ARR : ${mrrMetrics.annualArr.toLocaleString('fr-FR')} €/an (${mrrMetrics.activeServicesCount} abonnements)`}
          icon={DollarSign}
          colorScheme="emerald"
        />

        <StatCard
          title="Relances Prioritaires"
          value={followUpAlerts.length}
          subtitle={
            followUpAlerts.length > 0
              ? 'Leads entrants & devis sans réponse'
              : 'Aucune relance en retard !'
          }
          icon={Clock}
          colorScheme={followUpAlerts.length > 0 ? 'rose' : 'emerald'}
          badge={followUpAlerts.filter((a) => a.urgency === 'Critique').length ? 'Critique' : undefined}
        />

        <StatCard
          title="Support & Maintenance"
          value={tickets.filter((t) => t.status !== 'Résolu').length}
          subtitle={`${tickets.filter((t) => t.priority === 'Bloquant' && t.status !== 'Résolu').length} bloquant(s) · Pack Sérénité`}
          icon={LifeBuoy}
          colorScheme="amber"
        />
      </div>

      {/* Main Grid: Smart Follow-ups & Daily To-Dos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Intelligent Follow-up Engine */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Moteur Intelligent de Relances ({followUpAlerts.length})
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-200">
                    Détection automatique selon le statut et les jours d'inactivité
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('pipeline')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {followUpAlerts.length === 0 ? (
              <div className="py-8 text-center text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-semibold">Toutes vos opportunités sont à jour !</p>
                <p className="text-[11px] mt-0.5">Aucun prospect n'a dépassé le seuil de relance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followUpAlerts.map((alert) => {
                  const p = alert.prospect;
                  const isCritique = alert.urgency === 'Critique';
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCritique
                          ? 'border-rose-200/90 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onSelectProspect(p)}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left"
                            >
                              {p.company}
                            </button>
                            <span className="text-xs text-slate-700 dark:text-slate-200">
                              · {p.contact_name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isCritique
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                              }`}
                            >
                              {alert.daysSinceContact === 0
                                ? "Aujourd'hui"
                                : `${alert.daysSinceContact}j sans contact`}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {p.estimated_value.toLocaleString('fr-FR')} €
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.reason}</span>
                            {' — '}
                            {alert.recommendedAction}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200 pt-0.5">
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              {p.service_type}
                            </span>
                            <span>·</span>
                            <span>Statut : {p.status}</span>
                            <span>·</span>
                            <span
                              className={`font-semibold ${
                                p.priority === 'Chaud'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : p.priority === 'Tiède'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            >
                              Lead {p.priority} ({p.lead_score}/100)
                            </span>
                          </div>
                        </div>

                        {/* Actions Rapides "Zéro Clic Superflu" */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => onOpenFollowUpModal(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                            title="Générer un email de relance personnalisé"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Générer email</span>
                          </button>

                          <button
                            onClick={() => onMarkContactedToday(p.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                            title="Marquer comme contacté aujourd'hui et réinitialiser le compteur"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Contacté !</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Proposals / Quotes Alert Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Devis & Propositions en cours de négociation ({pendingProposals.length})
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {pendingProposals
                  .reduce((acc, curr) => acc + curr.estimated_value, 0)
                  .toLocaleString('fr-FR')}{' '}
                € HT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingProposals.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProspect(p)}
                  className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {p.company}
                    </p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-200">
                      {p.service_type} · Statut : {p.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {p.estimated_value.toLocaleString('fr-FR')} €
                    </p>
                    <p className="text-[10px] text-slate-700 dark:text-slate-200">
                      Score {p.lead_score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Daily To-Do List & Critical Support Tickets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Daily To-Do Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  To-Do Prioritaire du Jour
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {completedTasksCount} / {tasks.length} faites
                </span>
                {completedTasksCount > 0 && onClearCompletedTasks && (
                  <button
                    onClick={onClearCompletedTasks}
                    className="text-[10px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium underline cursor-pointer"
                    title="Supprimer toutes les tâches terminées"
                  >
                    Vider faites
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Task Input */}
            <form onSubmit={handleCreateTask} className="mb-4 flex items-center gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ajouter une action rapide (+ Entrée)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-700 dark:placeholder-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={newTaskPriority}
                onChange={(e) =>
                  setNewTaskPriority(e.target.value as 'Haute' | 'Moyenne' | 'Basse')
                }
                className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                title="Ajouter la tâche"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task Items */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-center py-4 text-slate-700 dark:text-slate-200">
                  Aucune tâche programmée pour aujourd'hui.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                      task.completed
                        ? 'border-slate-200/50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-snug ${
                          task.completed
                            ? 'line-through text-slate-700 dark:text-slate-300'
                            : 'font-medium text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.related_to && (
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Lié à : {task.related_to.label}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                          task.priority === 'Haute'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            : task.priority === 'Moyenne'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Supprimer cette tâche"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Contract & Subscription Renewals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  🔔 Échéances de Contrats & Abonnements ({upcomingRenewals.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('contracts')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Gérer contrats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingRenewals.length === 0 ? (
                <p className="text-xs text-center py-3 text-slate-700 dark:text-slate-200">
                  Aucun contrat arrivant à échéance sous 45 jours.
                </p>
              ) : (
                upcomingRenewals.slice(0, 3).map((item) => {
                  const target = new Date(item.renewal_date);
                  const days = Math.floor((target.getTime() - new Date('2026-10-11').getTime()) / (1000 * 3600 * 24));
                  const priceLabel = item.annual_price
                    ? `${item.annual_price.toLocaleString('fr-FR')} €/an`
                    : `${item.monthly_price} €/m`;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSelectProspect(item.client)}
                            className="text-xs font-bold text-slate-900 dark:text-white truncate hover:underline text-left cursor-pointer"
                          >
                            {item.client.company}
                          </button>
                          {days < 0 ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Échu
                            </span>
                          ) : days <= 15 ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              J-{days}
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Dans {days}j
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 truncate">
                          {item.name} · <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{priceLabel}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onOpenRenewalEmail && (
                          <button
                            onClick={() => onOpenRenewalEmail(item.client, item)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                            title="Générer email de renouvellement"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                        )}
                        {onRenewContractOneYear && (
                          <button
                            onClick={() => onRenewContractOneYear(item.client.id, item.id)}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            title="Reconduire le contrat pour +1 an"
                          >
                            +1 an
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Critical Support / Maintenance Alerts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tickets Support Urgents ({blockingTickets.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('tickets')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Voir tickets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {blockingTickets.length === 0 ? (
                <p className="text-xs text-center py-3 text-slate-700 dark:text-slate-200">
                  Aucun ticket critique en attente.
                </p>
              ) : (
                blockingTickets.slice(0, 3).map((tick) => (
                  <div
                    key={tick.id}
                    onClick={() => onNavigateToTab('tickets')}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tick.title}
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-slate-200">
                        {tick.client_company} · {tick.category}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        tick.priority === 'Bloquant'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}
                    >
                      {tick.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
