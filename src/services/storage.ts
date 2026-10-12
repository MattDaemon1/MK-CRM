import { INITIAL_DATABASE } from '../data/initialData';
import { CrmDatabase, Prospect, Ticket, DailyTask, DEFAULT_SERVICE_TYPES } from '../types/crm';

const STORAGE_KEY = 'mk_crm_database_v2';
const REFERENCE_DATE = new Date('2026-10-11');

// Safe storage wrapper protecting against iframe SecurityError
const inMemoryCache: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // In restricted iframe or private mode
    }
    return inMemoryCache[key] || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // In restricted iframe or private mode
    }
    inMemoryCache[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // In restricted iframe or private mode
    }
    delete inMemoryCache[key];
  }
};

export function getDaysUntilRenewal(renewalDate?: string): number {
  if (!renewalDate) return 999;
  const target = new Date(renewalDate);
  const diffTime = target.getTime() - REFERENCE_DATE.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Guarantee complete data integrity and prevent any undefined property access crashes
export function sanitizeDatabase(raw: any): CrmDatabase {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(INITIAL_DATABASE));
  }

  const prospects: Prospect[] = Array.isArray(raw.prospects)
    ? raw.prospects.map((p: any, idx: number) => ({
        id: String(p?.id || `p-sanitized-${idx}`),
        company: String(p?.company || 'Entreprise sans nom'),
        contact_name: String(p?.contact_name || 'Contact'),
        email: String(p?.email || ''),
        phone: String(p?.phone || ''),
        source: String(p?.source || 'Formulaire web'),
        status: p?.status || 'Lead entrant',
        service_type: String(p?.service_type || 'Refonte & Dev Web'),
        estimated_value: typeof p?.estimated_value === 'number' && !isNaN(p.estimated_value) ? p.estimated_value : (Number(p?.estimated_value) || 0),
        lead_score: typeof p?.lead_score === 'number' && !isNaN(p.lead_score) ? p.lead_score : 70,
        priority: p?.priority || 'Tiède',
        last_contact_date: String(p?.last_contact_date || '2026-10-11'),
        next_follow_up_date: p?.next_follow_up_date ? String(p.next_follow_up_date) : undefined,
        notes: Array.isArray(p?.notes) ? p.notes.map((n: any) => String(n || '')) : [],
        timeline: Array.isArray(p?.timeline) ? p.timeline : [],
        active_services: Array.isArray(p?.active_services)
          ? p.active_services.map((s: any, sIdx: number) => ({
              id: String(s?.id || `srv-${sIdx}`),
              name: String(s?.name || 'Abonnement récurrent'),
              monthly_price: Number(s?.monthly_price) || 0,
              annual_price: s?.annual_price ? Number(s.annual_price) : undefined,
              one_off_price: s?.one_off_price ? Number(s.one_off_price) : undefined,
              billing_cycle: s?.billing_cycle || (s?.one_off_price ? 'Ponctuel' : 'Mensuel'),
              category: s?.category || undefined,
              start_date: String(s?.start_date || '2026-10-11'),
              renewal_date: String(s?.renewal_date || '2027-10-11'),
              status: s?.status || 'Actif',
              reminder_days_before: Number(s?.reminder_days_before) || 30,
              notes: s?.notes ? String(s.notes) : undefined
            }))
          : [],
        created_at: p?.created_at ? String(p.created_at) : undefined,
        won_date: p?.won_date ? String(p.won_date) : undefined
      }))
    : INITIAL_DATABASE.prospects;

  const tickets: Ticket[] = Array.isArray(raw.tickets)
    ? raw.tickets.map((t: any, idx: number) => ({
        id: String(t?.id || `tick-${idx}`),
        title: String(t?.title || 'Ticket support'),
        client_id: String(t?.client_id || ''),
        client_company: String(t?.client_company || 'Client'),
        status: t?.status || 'Ouvert',
        priority: t?.priority || 'Normal',
        category: t?.category || 'Support & Conseil',
        description: String(t?.description || ''),
        created_at: String(t?.created_at || '2026-10-11'),
        due_date: t?.due_date ? String(t.due_date) : undefined,
        time_spent_hours: Number(t?.time_spent_hours) || 0
      }))
    : INITIAL_DATABASE.tickets;

  const tasks: DailyTask[] = Array.isArray(raw.tasks)
    ? raw.tasks.map((task: any, idx: number) => ({
        id: String(task?.id || `task-${idx}`),
        title: String(task?.title || 'Tâche'),
        due_date: String(task?.due_date || '2026-10-11'),
        completed: Boolean(task?.completed),
        priority: task?.priority || 'Moyenne',
        related_to: task?.related_to
      }))
    : INITIAL_DATABASE.tasks;

  const custom_service_types = Array.isArray(raw.custom_service_types) && raw.custom_service_types.length > 0
    ? Array.from(new Set([...DEFAULT_SERVICE_TYPES, ...raw.custom_service_types]))
    : DEFAULT_SERVICE_TYPES;

  return {
    version: Number(raw.version) || 1,
    last_updated: String(raw.last_updated || new Date().toISOString()),
    prospects,
    tickets,
    tasks,
    custom_service_types
  };
}

// 1. Local Cache Loader (instant offline fallback with sanitization)
export function loadDatabase(): CrmDatabase {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabaseLocally(INITIAL_DATABASE);
      return sanitizeDatabase(INITIAL_DATABASE);
    }
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeDatabase(parsed);
    return sanitized;
  } catch (err) {
    console.error('Erreur chargement base locale :', err);
    saveDatabaseLocally(INITIAL_DATABASE);
    return sanitizeDatabase(INITIAL_DATABASE);
  }
}

function saveDatabaseLocally(db: CrmDatabase): void {
  try {
    const sanitized = sanitizeDatabase(db);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized, null, 2));
  } catch (err) {
    console.error('Erreur sauvegarde locale :', err);
  }
}

// 2. Multi-Device Server Sync (PC <-> Mobile)
export async function syncDatabaseWithServer(): Promise<CrmDatabase | null> {
  try {
    const res = await fetch(`/api/crm?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const serverDb = await res.json();
    if (serverDb && Array.isArray(serverDb.prospects)) {
      const sanitized = sanitizeDatabase(serverDb);
      saveDatabaseLocally(sanitized);
      return sanitized;
    }
  } catch (err) {
    // Offline or server start
    console.warn('Mode hors-ligne / fallback local:', err);
  }
  return null;
}

export function saveDatabase(db: CrmDatabase): void {
  const sanitized = sanitizeDatabase(db);

  // 1. Save locally immediately
  saveDatabaseLocally(sanitized);

  // 2. Push to server for PC <-> Mobile sync
  try {
    fetch('/api/crm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitized),
      keepalive: true
    }).catch((err) => {
      console.warn('Échec envoi serveur (synchro différée) :', err);
    });
  } catch (e) {
    // Ignore fetch error in pure client mode
  }
}

export async function resetDatabase(): Promise<CrmDatabase> {
  try {
    await fetch('/api/crm/reset', { method: 'POST' }).catch(() => {});
  } catch (e) {}

  safeStorage.removeItem(STORAGE_KEY);
  const sanitized = sanitizeDatabase(INITIAL_DATABASE);
  saveDatabase(sanitized);
  return sanitized;
}

export function exportDatabaseAsJson(db: CrmDatabase): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(

    JSON.stringify(db, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `mk_crm_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseAndValidateImport(jsonString: string): CrmDatabase {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Le fichier ne contient pas un objet JSON valide.');
  }

  const sanitized = sanitizeDatabase(parsed);
  if (sanitized.prospects.length === 0 && sanitized.tickets.length === 0) {
    throw new Error("Aucun prospect ou ticket trouvé dans le fichier JSON.");
  }

  saveDatabase(sanitized);
  return sanitized;
}

export interface PipelineMetrics {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  totalWonValue: number;
  totalLostValue: number;
  activeProspectsCount: number;
  hotCount: number;
  conversionRate: number;
}

export function calculatePipelineMetrics(prospects: Prospect[]): PipelineMetrics {
  const stageWeights: Record<string, number> = {
    'Lead entrant': 0.2,
    'Contacté': 0.35,
    'Proposition envoyée': 0.65,
    'En attente de signature': 0.85,
    'Gagné': 1.0,
    'Perdu': 0.0
  };

  let totalPipelineValue = 0;
  let weightedPipelineValue = 0;
  let totalWonValue = 0;
  let totalLostValue = 0;
  let activeProspectsCount = 0;
  let hotCount = 0;

  let totalClosed = 0;
  let totalWonCount = 0;

  for (const p of prospects) {
    const val = p.estimated_value || 0;
    if (p.priority === 'Chaud' && p.status !== 'Perdu') {
      hotCount++;
    }

    if (p.status === 'Gagné') {
      totalWonValue += val;
      totalClosed++;
      totalWonCount++;
    } else if (p.status === 'Perdu') {
      totalLostValue += val;
      totalClosed++;
    } else {
      totalPipelineValue += val;
      const weight = stageWeights[p.status] || 0.2;
      weightedPipelineValue += Math.round(val * weight);
      activeProspectsCount++;
    }
  }

  const conversionRate = totalClosed > 0 ? Math.round((totalWonCount / totalClosed) * 100) : 0;

  return {
    totalPipelineValue,
    weightedPipelineValue,
    totalWonValue,
    totalLostValue,
    activeProspectsCount,
    hotCount,
    conversionRate
  };
}

export interface MrrMetrics {
  monthlyMrr: number;
  annualArr: number;
  annualContractsCount: number;
  annualContractsTotal: number;
  monthlyContractsCount: number;
  activeServicesCount: number;
  activeClientsCount: number;
  upcomingRenewalsCount: number; // Renouvellements sous 30 jours
}

export function calculateMrrMetrics(prospects: Prospect[]): MrrMetrics {
  let monthlyMrr = 0;
  let activeServicesCount = 0;
  let annualContractsCount = 0;
  let annualContractsTotal = 0;
  let monthlyContractsCount = 0;
  let upcomingRenewalsCount = 0;
  const clientIdsWithServices = new Set<string>();

  for (const p of prospects) {
    if (!p.active_services || !Array.isArray(p.active_services)) continue;

    for (const s of p.active_services) {
      if (s.status === 'Actif') {
        const mPrice = s.monthly_price || 0;
        activeServicesCount++;
        clientIdsWithServices.add(p.id);

        if (s.billing_cycle === 'Annuel') {
          monthlyMrr += mPrice;
          annualContractsCount++;
          annualContractsTotal += s.annual_price || mPrice * 12;
        } else if (s.billing_cycle === 'Mensuel' || s.billing_cycle === 'Trimestriel') {
          monthlyMrr += mPrice;
          monthlyContractsCount++;
        }

        if (s.billing_cycle !== 'Ponctuel') {
          const daysToRenew = getDaysUntilRenewal(s.renewal_date);
          if (daysToRenew >= 0 && daysToRenew <= 45) {
            upcomingRenewalsCount++;
          }
        }
      }
    }
  }

  return {
    monthlyMrr,
    annualArr: monthlyMrr * 12,
    annualContractsCount,
    annualContractsTotal,
    monthlyContractsCount,
    activeServicesCount,
    activeClientsCount: clientIdsWithServices.size,
    upcomingRenewalsCount
  };
}
