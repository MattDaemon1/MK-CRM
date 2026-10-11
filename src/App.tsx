import React, { useState, useEffect, useMemo } from 'react';
import {
  CrmDatabase,
  Prospect,
  Ticket,
  DailyTask,
  ProspectStatus,
  TicketStatus
} from './types/crm';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  exportDatabaseAsJson,
  parseAndValidateImport,
  calculatePipelineMetrics,
  calculateMrrMetrics
} from './services/storage';
import { detectFollowUps } from './services/followUpEngine';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DailyDashboard } from './components/dashboard/DailyDashboard';
import { PipelineView } from './components/pipeline/PipelineView';
import { TicketListView } from './components/tickets/TicketListView';
import { ContractsMrrView } from './components/contracts/ContractsMrrView';
import { FollowUpModal } from './components/dashboard/FollowUpModal';
import { ProspectModal } from './components/pipeline/ProspectModal';
import { TicketModal } from './components/tickets/TicketModal';
import { ClientDetailDrawer } from './components/contracts/ClientDetailDrawer';
import { Toast } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('mk_crm_auth_user') === 'Matt' ||
      sessionStorage.getItem('mk_crm_auth_user') === 'Matt'
    );
  });

  // 1. Initial State
  const [database, setDatabase] = useState<CrmDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kroma_crm_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kroma_crm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kroma_crm_theme', 'light');
    }
  }, [darkMode]);

  // Modals & Drawers state
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [initialProspectStatus, setInitialProspectStatus] = useState<ProspectStatus | undefined>();

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpProspect, setFollowUpProspect] = useState<Prospect | null>(null);

  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Helper to commit DB changes
  const updateDb = (newDb: CrmDatabase) => {
    setDatabase(newDb);
    saveDatabase(newDb);
  };

  // 2. Computed Metrics
  const pipelineMetrics = useMemo(
    () => calculatePipelineMetrics(database.prospects),
    [database.prospects]
  );

  const mrrMetrics = useMemo(
    () => calculateMrrMetrics(database.prospects),
    [database.prospects]
  );

  const followUpAlerts = useMemo(
    () => detectFollowUps(database.prospects),
    [database.prospects]
  );

  const selectedProspect = useMemo(
    () => database.prospects.find((p) => p.id === selectedProspectId) || null,
    [database.prospects, selectedProspectId]
  );

  // 3. Handlers: Prospects
  const handleOpenNewProspect = (initialStatus?: ProspectStatus) => {
    setEditingProspect(null);
    setInitialProspectStatus(initialStatus);
    setIsProspectModalOpen(true);
  };

  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setIsProspectModalOpen(true);
  };

  const handleSaveProspect = (prospectData: Partial<Prospect>) => {
    const existingIndex = database.prospects.findIndex((p) => p.id === prospectData.id);
    let updatedProspects = [...database.prospects];

    if (existingIndex >= 0) {
      updatedProspects[existingIndex] = {
        ...updatedProspects[existingIndex],
        ...prospectData
      } as Prospect;
      showToast(`Prospect "${prospectData.company}" mis à jour.`);
    } else {
      const newProspect: Prospect = {
        id: prospectData.id || `p-${Date.now()}`,
        company: prospectData.company || 'Nouvelle Affaire',
        contact_name: prospectData.contact_name || 'Contact',
        email: prospectData.email || '',
        phone: prospectData.phone || '',
        source: prospectData.source || 'Direct',
        status: prospectData.status || 'Lead entrant',
        service_type: prospectData.service_type || 'Refonte & Dev Web',
        estimated_value: prospectData.estimated_value || 0,
        lead_score: prospectData.lead_score || 50,
        priority: prospectData.priority || 'Tiède',
        last_contact_date: prospectData.last_contact_date || '2026-10-11',
        notes: prospectData.notes || ['Lead créé.'],
        timeline: [
          {
            id: `t-${Date.now()}`,
            date: '2026-10-11 12:00',
            type: 'status_change',
            content: `Création du prospect avec le statut "${prospectData.status || 'Lead entrant'}"`
          }
        ],
        active_services: []
      };
      updatedProspects = [newProspect, ...updatedProspects];
      showToast(`Nouveau lead "${newProspect.company}" enregistré !`);
    }

    updateDb({
      ...database,
      prospects: updatedProspects
    });
  };

  const handleDeleteProspect = (prospectId: string) => {
    const updated = database.prospects.filter((p) => p.id !== prospectId);
    updateDb({
      ...database,
      prospects: updated
    });
    if (selectedProspectId === prospectId) {
      setSelectedProspectId(null);
    }
    showToast('Prospect supprimé de la base de données.');
  };

  const handleMoveProspectStatus = (prospectId: string, newStatus: ProspectStatus) => {
    const updatedProspects = database.prospects.map((p) => {
      if (p.id === prospectId) {
        return {
          ...p,
          status: newStatus,
          timeline: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              type: 'status_change' as const,
              content: `Déplacement pipeline vers "${newStatus}"`
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    });

    updateDb({
      ...database,
      prospects: updatedProspects
    });
    showToast(`Statut mis à jour : ${newStatus}`);
  };

  const handleMarkContactedToday = (prospectId: string, customNote?: string) => {
    const updatedProspects = database.prospects.map((p) => {
      if (p.id === prospectId) {
        const noteText = customNote || 'Relance effectuée - contact pris aujourd’hui.';
        return {
          ...p,
          last_contact_date: '2026-10-11',
          notes: [noteText, ...p.notes],
          timeline: [
            {
              id: `t-${Date.now()}`,
              date: '2026-10-11 10:00',
              type: 'email' as const,
              content: noteText
            },
            ...(p.timeline || [])
          ]
        };
      }
      return p;
    });

    updateDb({
      ...database,
      prospects: updatedProspects
    });
    showToast('Date de dernier contact actualisée à aujourd’hui !');
  };

  const handleUpdateProspectDetails = (updated: Prospect) => {
    const updatedProspects = database.prospects.map((p) => (p.id === updated.id ? updated : p));
    updateDb({
      ...database,
      prospects: updatedProspects
    });
  };

  // 4. Handlers: Tickets
  const handleOpenNewTicket = () => {
    setEditingTicket(null);
    setIsTicketModalOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleSaveTicket = (ticketData: Partial<Ticket>) => {
    const existingIndex = database.tickets.findIndex((t) => t.id === ticketData.id);
    let updatedTickets = [...database.tickets];

    if (existingIndex >= 0) {
      updatedTickets[existingIndex] = {
        ...updatedTickets[existingIndex],
        ...ticketData
      } as Ticket;
      showToast(`Ticket #${ticketData.id} mis à jour.`);
    } else {
      const newTicket: Ticket = {
        id: ticketData.id || `tick-${Date.now().toString().slice(-4)}`,
        title: ticketData.title || 'Nouveau ticket',
        client_id: ticketData.client_id || '',
        client_company: ticketData.client_company || 'Client',
        status: ticketData.status || 'Ouvert',
        priority: ticketData.priority || 'Normal',
        category: ticketData.category || 'Pack Sérénité',
        description: ticketData.description || '',
        created_at: '2026-10-11',
        time_spent_hours: ticketData.time_spent_hours || 0
      };
      updatedTickets = [newTicket, ...updatedTickets];
      showToast(`Ticket #${newTicket.id} ouvert.`);
    }

    updateDb({
      ...database,
      tickets: updatedTickets
    });
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = database.tickets.filter((t) => t.id !== ticketId);
    updateDb({
      ...database,
      tickets: updated
    });
    showToast('Ticket supprimé.');
  };

  const handleChangeTicketStatus = (ticketId: string, status: TicketStatus) => {
    const updated = database.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
    updateDb({
      ...database,
      tickets: updated
    });
    showToast(`Statut ticket passé à : ${status}`);
  };

  // 5. Handlers: Tasks
  const handleToggleTask = (taskId: string) => {
    const updated = database.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateDb({
      ...database,
      tasks: updated
    });
  };

  const handleAddTask = (title: string, priority: 'Haute' | 'Moyenne' | 'Basse') => {
    const newTask: DailyTask = {
      id: `tsk-${Date.now().toString().slice(-4)}`,
      title,
      due_date: '2026-10-11',
      completed: false,
      priority
    };
    updateDb({
      ...database,
      tasks: [newTask, ...database.tasks]
    });
    showToast('Action ajoutée à la to-do du jour.');
  };

  // 6. Backup & Restore
  const handleExport = () => {
    exportDatabaseAsJson(database);
    showToast('Export de la base de données JSON téléchargé !');
  };

  const handleImport = (content: string) => {
    try {
      const imported = parseAndValidateImport(content);
      setDatabase(imported);
      showToast('Base de données locale importée et synchronisée avec succès !');
    } catch (err: any) {
      showToast(`Erreur d'import : ${err.message || 'Fichier JSON invalide'}`);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        'Réinitialiser toutes les données locales avec les données de test par défaut (MP41, Logistique Sologne, Pack Sérénité) ?'
      )
    ) {
      const reset = resetDatabase();
      setDatabase(reset);
      showToast('Données de démo réinitialisées avec succès !');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mk_crm_auth_user');
    sessionStorage.removeItem('mk_crm_auth_user');
    setIsAuthenticated(false);
    showToast('Déconnexion réussie. À bientôt Matt !');
  };

  // If not logged in, show Login view
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          showToast(`Connexion réussie ! Bienvenue ${user}.`);
        }}
        darkMode={darkMode}
      />
    );
  }

  // 7. Global Search Filter results if any
  const displayedProspects = useMemo(() => {
    if (!searchQuery.trim()) return database.prospects;
    const q = searchQuery.toLowerCase();
    return database.prospects.filter(
      (p) =>
        p.company.toLowerCase().includes(q) ||
        p.contact_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.notes.some((n) => n.toLowerCase().includes(q))
    );
  }, [database.prospects, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNewProspect={() => handleOpenNewProspect()}
        onNewTicket={handleOpenNewTicket}
        onExport={handleExport}
        onImport={handleImport}
        onReset={handleReset}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        database={database}
        currentUser="Matt"
        onLogout={handleLogout}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        urgentFollowUpsCount={followUpAlerts.length}
        openTicketsCount={database.tickets.filter((t) => t.status !== 'Résolu').length}
        activeMrrCount={mrrMetrics.activeServicesCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Global Search Banner if filter applied */}
        {searchQuery.trim() && (
          <div className="mb-4 p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-200 font-medium">
              Filtre actif sur "{searchQuery}" : {displayedProspects.length} prospect(s) trouvé(s)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DailyDashboard
            prospects={database.prospects}
            tickets={database.tickets}
            tasks={database.tasks}
            followUpAlerts={followUpAlerts}
            pipelineMetrics={pipelineMetrics}
            mrrMetrics={mrrMetrics}
            onOpenFollowUpModal={(p) => {
              setFollowUpProspect(p);
              setIsFollowUpModalOpen(true);
            }}
            onMarkContactedToday={handleMarkContactedToday}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            prospects={displayedProspects}
            pipelineMetrics={pipelineMetrics}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            onOpenFollowUp={(p) => {
              setFollowUpProspect(p);
              setIsFollowUpModalOpen(true);
            }}
            onMoveStatus={handleMoveProspectStatus}
            onNewProspect={(initialStatus) => handleOpenNewProspect(initialStatus)}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketListView
            tickets={database.tickets}
            prospects={database.prospects}
            onNewTicket={handleOpenNewTicket}
            onEditTicket={handleEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onChangeTicketStatus={handleChangeTicketStatus}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsMrrView
            prospects={database.prospects}
            mrrMetrics={mrrMetrics}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
          />
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      <FollowUpModal
        prospect={followUpProspect}
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onMarkContactedToday={handleMarkContactedToday}
        onShowToast={showToast}
      />

      <ProspectModal
        isOpen={isProspectModalOpen}
        onClose={() => setIsProspectModalOpen(false)}
        onSave={handleSaveProspect}
        editingProspect={editingProspect}
        initialStatus={initialProspectStatus}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
        editingTicket={editingTicket}
        prospects={database.prospects}
      />

      <ClientDetailDrawer
        prospect={selectedProspect}
        isOpen={selectedProspectId !== null}
        onClose={() => setSelectedProspectId(null)}
        onUpdateProspect={handleUpdateProspectDetails}
        onOpenFollowUp={(p) => {
          setFollowUpProspect(p);
          setIsFollowUpModalOpen(true);
        }}
        onDeleteProspect={handleDeleteProspect}
        onShowToast={showToast}
      />

      {/* Non-intrusive Toast feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
