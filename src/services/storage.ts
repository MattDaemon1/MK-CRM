import { INITIAL_DATABASE } from '../data/initialData';
import { CrmDatabase, Prospect, Ticket, DailyTask, DEFAULT_SERVICE_TYPES } from '../types/crm';

const STORAGE_KEY = 'mk_crm_database_v2';
const REFERENCE_DATE = new Date('2026-10-11');

export function getDaysUntilRenewal(renewalDate?: string): number {
  if (!renewalDate) return 999;
  const target = new Date(renewalDate);
  const diffTime = target.getTime() - REFERENCE_DATE.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 1. Local Cache Loader (instant offline fallback)
export function loadDatabase(): CrmDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabaseLocally(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.prospects)) {
      saveDatabaseLocally(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    if (!parsed.custom_service_types || !Array.isArray(parsed.custom_service_types)) {
      parsed.custom_service_types = DEFAULT_SERVICE_TYPES;
    }
    return parsed as CrmDatabase;
  } catch (err) {
    console.error('Erreur chargement base locale :', err);
    saveDatabaseLocally(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }
}

function saveDatabaseLocally(db: CrmDatabase): void {
  try {
    const updated: CrmDatabase = {
      ...db,
      last_updated: new Date().toISOString(),
      custom_service_types: db.custom_service_types || DEFAULT_SERVICE_TYPES
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated, null, 2));
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
      if (!serverDb.custom_service_types || !Array.isArray(serverDb.custom_service_types)) {
        serverDb.custom_service_types = DEFAULT_SERVICE_TYPES;
      }
      saveDatabaseLocally(serverDb);
      return serverDb as CrmDatabase;
    }
  } catch (err) {
    // Offline or server start
    console.warn('Mode hors-ligne / fallback local:', err);
  }
  return null;
}

export function saveDatabase(db: CrmDatabase): void {
  const updated: CrmDatabase = {
    ...db,
    last_updated: new Date().toISOString(),
    custom_service_types: db.custom_service_types || DEFAULT_SERVICE_TYPES
  };

  // 1. Save locally immediately
  saveDatabaseLocally(updated);

  // 2. Push to server for PC <-> Mobile sync
  try {
    fetch('/api/crm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updated)
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

  localStorage.removeItem(STORAGE_KEY);
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
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

  const prospects: Prospect[] = Array.isArray(parsed.prospects) ? parsed.prospects : [];
  const tickets: Ticket[] = Array.isArray(parsed.tickets) ? parsed.tickets : [];
  const tasks: DailyTask[] = Array.isArray(parsed.tasks) ? parsed.tasks : [];

  if (prospects.length === 0 && !parsed.tickets) {
    throw new Error("Aucun prospect n'a été trouvé dans le fichier JSON.");
  }

  const validDb: CrmDatabase = {
    version: parsed.version || 1,
    last_updated: new Date().toISOString(),
    prospects,
    tickets,
    tasks,
    custom_service_types: parsed.custom_service_types || DEFAULT_SERVICE_TYPES
  };

  saveDatabase(validDb);
  return validDb;
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
        monthlyMrr += mPrice;
        activeServicesCount++;
        clientIdsWithServices.add(p.id);

        if (s.billing_cycle === 'Annuel') {
          annualContractsCount++;
          annualContractsTotal += s.annual_price || mPrice * 12;
        } else {
          monthlyContractsCount++;
        }

        const daysToRenew = getDaysUntilRenewal(s.renewal_date);
        if (daysToRenew >= 0 && daysToRenew <= 45) {
          upcomingRenewalsCount++;
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
