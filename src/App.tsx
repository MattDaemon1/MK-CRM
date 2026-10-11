import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CrmDatabase,
  Prospect,
  Ticket,
  DailyTask,
  ProspectStatus,
  TicketStatus,
  ActiveService,
  DEFAULT_SERVICE_TYPES
} from './types/crm';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  exportDatabaseAsJson,
  parseAndValidateImport,
  calculatePipelineMetrics,
  calculateMrrMetrics,
  syncDatabaseWithServer
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
import { ContractModal } from './components/contracts/ContractModal';
import { ClientDetailDrawer } from './components/contracts/ClientDetailDrawer';
import { Toast } from './components/common/Toast';
import { LoginView } from './components/auth/LoginView';
import { LeadsView } from './components/leads/LeadsView';
import { ConfirmDialog } from './components/common/ConfirmDialog';

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

  // Multi-Device Sync State (PC <-> Mobile)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(new Date());

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

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpProspect, setFollowUpProspect] = useState<Prospect | null>(null);
  const [followUpContract, setFollowUpContract] = useState<ActiveService | null>(null);

  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [prospectToDelete, setProspectToDelete] = useState<Prospect | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Live Multi-Device Synchronization (PC <-> Mobile)
  const handleSyncWithServer = useCallback(async (forceToast = false) => {
    setSyncStatus('syncing');
    const remoteDb = await syncDatabaseWithServer();
    if (remoteDb && Array.isArray(remoteDb.prospects)) {
      setDatabase((prevDb) => {
        // If remote has newer data or previous was default
        if (remoteDb.last_updated !== prevDb.last_updated) {
          return remoteDb;
        }
        return prevDb;
      });
      setSyncStatus('synced');
      setLastSyncedTime(new Date());
      if (forceToast) {
        showToast('🟢 Données synchronisées avec le serveur (PC ↔ Mobile)');
      }
    } else {
      setSyncStatus('offline');
      if (forceToast) {
        showToast('⚠️ Impossible de joindre le serveur de synchro');
      }
    }
  }, []);

  // Initial Sync and background heartbeat polling
  useEffect(() => {
    // 1. Initial immediate sync on mount
    handleSyncWithServer();

    // 2. Poll every 4 seconds for live changes between mobile and PC
    const interval = setInterval(() => {
      handleSyncWithServer();
    }, 4000);

    // 3. Sync immediately when window gets focus or tab becomes visible
    const handleFocus = () => handleSyncWithServer();
    const handleVisibility = () => {
      if (!document.hidden) handleSyncWithServer();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [handleSyncWithServer]);

  // Helper to commit DB changes (local + server sync)
  const updateDb = (newDb: CrmDatabase) => {
    const updated: CrmDatabase = {
      ...newDb,
      last_updated: new Date().toISOString()
    };
    setDatabase(updated);
    saveDatabase(updated);
    setLastSyncedTime(new Date());
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

  const handleDeleteTask = (taskId: string) => {
    const updated = database.tasks.filter((t) => t.id !== taskId);
    updateDb({
      ...database,
      tasks: updated
    });
    showToast('Tâche supprimée de la to-do list.');
  };

  const handleClearCompletedTasks = () => {
    const updated = database.tasks.filter((t) => !t.completed);
    updateDb({
      ...database,
      tasks: updated
    });
    showToast('Toutes les tâches terminées ont été supprimées.');
  };

  // 5b. Handlers: Service Types & Contracts
  const handleAddServiceType = (newType: string) => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    const currentTypes = database.custom_service_types || DEFAULT_SERVICE_TYPES;
    if (currentTypes.includes(trimmed)) return;

    const updatedTypes = [...currentTypes, trimmed];
    updateDb({
      ...database,
      custom_service_types: updatedTypes
    });
    showToast(`Type de prestation "${trimmed}" ajouté avec succès !`);
  };

  const handleOpenNewContract = (defaultClientId?: string) => {
    setSelectedProspectId(defaultClientId || null);
    setIsContractModalOpen(true);
  };

  const handleSaveContract = (clientId: string, contract: ActiveService) => {
    const updatedProspects = database.prospects.map((p) => {
      if (p.id === clientId) {
        const newTimeline: TimelineEntry = {
          id: `t-${Date.now()}`,
          date: '2026-10-11 12:00',
          type: 'note',
          content: `Souscription contrat récurrent : ${contract.name} (${contract.billing_cycle === 'Annuel' ? `${contract.annual_price || contract.monthly_price * 12} €/an` : `${contract.monthly_price} €/m`}) - Échéance le ${contract.renewal_date}`
        };

        return {
          ...p,
          status: p.status === 'Lead entrant' || p.status === 'Contacté' || p.status === 'Proposition envoyée' ? 'Gagné' : p.status,
          active_services: [...(p.active_services || []), contract],
          timeline: [newTimeline, ...(p.timeline || [])]
        };
      }
      return p;
    });

    updateDb({
      ...database,
      prospects: updatedProspects
    });
    showToast(`Contrat "${contract.name}" enregistré avec rappel de renouvellement !`);
  };

  const handleRenewContractOneYear = (clientId: string, contractId: string) => {
    let clientName = '';
    let contractName = '';
    let nextDate = '';

    const updatedProspects = database.prospects.map((p) => {
      if (p.id === clientId) {
        clientName = p.company;
        const updatedServices = (p.active_services || []).map((s) => {
          if (s.id === contractId) {
            contractName = s.name;
            const parts = (s.renewal_date || '2026-10-11').split('-');
            const nextYear = Number(parts[0]) + 1;
            nextDate = `${nextYear}-${parts[1] || '10'}-${parts[2] || '11'}`;

            return {
              ...s,
              renewal_date: nextDate,
              last_renewed_date: '2026-10-11',
              status: 'Actif' as const
            };
          }
          return s;
        });

        const newTimeline: TimelineEntry = {
          id: `t-${Date.now()}`,
          date: '2026-10-11 12:00',
          type: 'note',
          content: `Contrat "${contractName}" renouvelé pour +1 an. Nouvelle date d'échéance : ${nextDate}.`
        };

        return {
          ...p,
          active_services: updatedServices,
          timeline: [newTimeline, ...(p.timeline || [])]
        };
      }
      return p;
    });

    updateDb({
      ...database,
      prospects: updatedProspects
    });
    showToast(`Contrat "${contractName}" de ${clientName} reconduit jusqu'au ${nextDate} !`);
  };

  const handleOpenRenewalEmail = (client: Prospect, contract: ActiveService) => {
    setFollowUpProspect(client);
    setFollowUpContract(contract);
    setIsFollowUpModalOpen(true);
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
    setIsResetConfirmOpen(true);
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
        syncStatus={syncStatus}
        lastSyncedTime={lastSyncedTime}
        onTriggerSync={() => handleSyncWithServer(true)}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        urgentFollowUpsCount={followUpAlerts.length}
        openTicketsCount={database.tickets.filter((t) => t.status !== 'Résolu').length}
        activeMrrCount={mrrMetrics.activeServicesCount}
        leadsCount={database.prospects.filter((p) => p.status !== 'Gagné' && p.status !== 'Perdu').length}
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
              setFollowUpContract(null);
              setIsFollowUpModalOpen(true);
            }}
            onMarkContactedToday={handleMarkContactedToday}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onClearCompletedTasks={handleClearCompletedTasks}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenRenewalEmail={handleOpenRenewalEmail}
            onRenewContractOneYear={handleRenewContractOneYear}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsView
            prospects={displayedProspects}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            onEditProspect={handleEditProspect}
            onDeleteProspect={(p) => setProspectToDelete(p)}
            onOpenFollowUp={(p) => {
              setFollowUpProspect(p);
              setFollowUpContract(null);
              setIsFollowUpModalOpen(true);
            }}
            onMoveStatus={handleMoveProspectStatus}
            onNewLead={() => handleOpenNewProspect('Lead entrant')}
            availableServiceTypes={database.custom_service_types || DEFAULT_SERVICE_TYPES}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineView
            prospects={displayedProspects}
            pipelineMetrics={pipelineMetrics}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            onOpenFollowUp={(p) => {
              setFollowUpProspect(p);
              setFollowUpContract(null);
              setIsFollowUpModalOpen(true);
            }}
            onMoveStatus={handleMoveProspectStatus}
            onNewProspect={(initialStatus) => handleOpenNewProspect(initialStatus)}
            onEditProspect={handleEditProspect}
            onDeleteProspect={(p) => setProspectToDelete(p)}
            availableServiceTypes={database.custom_service_types || DEFAULT_SERVICE_TYPES}
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
            onNewContract={() => handleOpenNewContract()}
            onRenewContractOneYear={handleRenewContractOneYear}
            onOpenRenewalEmail={handleOpenRenewalEmail}
          />
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      <FollowUpModal
        prospect={followUpProspect}
        contract={followUpContract}
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setFollowUpContract(null);
        }}
        onMarkContactedToday={handleMarkContactedToday}
        onShowToast={showToast}
      />

      <ProspectModal
        isOpen={isProspectModalOpen}
        onClose={() => setIsProspectModalOpen(false)}
        onSave={handleSaveProspect}
        editingProspect={editingProspect}
        initialStatus={initialProspectStatus}
        availableServiceTypes={database.custom_service_types || DEFAULT_SERVICE_TYPES}
        onAddServiceType={handleAddServiceType}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
        editingTicket={editingTicket}
        prospects={database.prospects}
      />

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        prospects={database.prospects}
        onSaveContract={handleSaveContract}
        defaultClientId={selectedProspectId || undefined}
      />

      <ClientDetailDrawer
        prospect={selectedProspect}
        isOpen={selectedProspectId !== null}
        onClose={() => setSelectedProspectId(null)}
        onUpdateProspect={handleUpdateProspectDetails}
        onEditProspect={handleEditProspect}
        onOpenFollowUp={(p) => {
          setFollowUpProspect(p);
          setFollowUpContract(null);
          setIsFollowUpModalOpen(true);
        }}
        onDeleteProspect={handleDeleteProspect}
        onShowToast={showToast}
      />

      {/* In-App Delete Confirmation Dialog for Companies */}
      <ConfirmDialog
        isOpen={prospectToDelete !== null}
        title={`Supprimer "${prospectToDelete?.company}" ?`}
        message={`Cette action est irréversible. L'entreprise "${prospectToDelete?.company}", ses coordonnées et son historique seront définitivement supprimés de MK CRM.`}
        confirmLabel="Oui, supprimer définitivement"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={() => {
          if (prospectToDelete) {
            handleDeleteProspect(prospectToDelete.id);
            setProspectToDelete(null);
          }
        }}
        onCancel={() => setProspectToDelete(null)}
      />

      {/* In-App Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Réinitialiser les données de démonstration ?"
        message="Cette action rechargera les données par défaut de MK CRM (MP41, Logistique Sologne, Pack Sérénité). Les modifications actuelles seront écrasées."
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
        onConfirm={async () => {
          const reset = await resetDatabase();
          setDatabase(reset);
          setIsResetConfirmOpen(false);
          showToast('Données de démo réinitialisées avec succès !');
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Non-intrusive Toast feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
