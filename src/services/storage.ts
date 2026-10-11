import { INITIAL_DATABASE } from '../data/initialData';
import { CrmDatabase, Prospect, Ticket, DailyTask } from '../types/crm';

const STORAGE_KEY = 'kroma_crm_database_v1';

export function loadDatabase(): CrmDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.prospects)) {
      saveDatabase(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
    return parsed as CrmDatabase;
  } catch (err) {
    console.error('Erreur chargement base de données locale :', err);
    saveDatabase(INITIAL_DATABASE);
    return INITIAL_DATABASE;
  }
}

export function saveDatabase(db: CrmDatabase): void {
  try {
    const updated: CrmDatabase = {
      ...db,
      last_updated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated, null, 2));
  } catch (err) {
    console.error('Erreur sauvegarde locale :', err);
  }
}

export function resetDatabase(): CrmDatabase {
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
  downloadAnchor.setAttribute('download', `kroma_crm_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseAndValidateImport(jsonString: string): CrmDatabase {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Le fichier ne contient pas un objet JSON valide.');
  }

  // Si l'utilisateur importe directement l'objet { prospects: [...] } ou le format complet CrmDatabase
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
    tasks
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
      // Affaires en cours dans le pipeline
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
  activeServicesCount: number;
  activeClientsCount: number;
}

export function calculateMrrMetrics(prospects: Prospect[]): MrrMetrics {
  let monthlyMrr = 0;
  let activeServicesCount = 0;
  const clientIdsWithServices = new Set<string>();

  for (const p of prospects) {
    if (!p.active_services || !Array.isArray(p.active_services)) continue;

    for (const s of p.active_services) {
      if (s.status === 'Actif') {
        monthlyMrr += s.monthly_price || 0;
        activeServicesCount++;
        clientIdsWithServices.add(p.id);
      }
    }
  }

  return {
    monthlyMrr,
    annualArr: monthlyMrr * 12,
    activeServicesCount,
    activeClientsCount: clientIdsWithServices.size
  };
}
