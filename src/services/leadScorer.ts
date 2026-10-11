import { PriorityLevel, ServiceType } from '../types/crm';

export interface ScoreBreakdown {
  label: string;
  points: number;
}

export interface ScoreResult {
  score: number;
  priority: PriorityLevel;
  breakdown: ScoreBreakdown[];
}

export function computeLeadScore(params: {
  estimatedValue: number;
  serviceType: ServiceType;
  source: string;
  lastContactDate?: string;
  status?: string;
}): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  let score = 0;

  // 1. Budget estimé (jusqu'à 45 pts)
  const val = params.estimatedValue || 0;
  if (val >= 8000) {
    score += 45;
    breakdown.push({ label: 'Budget élevé (> 8k€)', points: 45 });
  } else if (val >= 5000) {
    score += 40;
    breakdown.push({ label: 'Budget cible premium (5k€ - 8k€)', points: 40 });
  } else if (val >= 3000) {
    score += 30;
    breakdown.push({ label: 'Budget intermédiaire (3k€ - 5k€)', points: 30 });
  } else if (val >= 1500) {
    score += 20;
    breakdown.push({ label: 'Budget standard (1.5k€ - 3k€)', points: 20 });
  } else if (val > 0) {
    score += 10;
    breakdown.push({ label: 'Petit budget (< 1.5k€)', points: 10 });
  }

  // 2. Type de prestation & valeur stratégique (jusqu'à 30 pts)
  const stLower = (params.serviceType || '').toLowerCase();
  if (stLower.includes('ia') || stLower.includes('intelligence') || stLower.includes('llm') || stLower.includes('gpt')) {
    score += 30;
    breakdown.push({ label: 'Prestation IA haute valeur', points: 30 });
  } else if (stLower.includes('n8n') || stLower.includes('automatisation') || stLower.includes('workflow')) {
    score += 28;
    breakdown.push({ label: 'Automatisation scalable', points: 28 });
  } else if (stLower.includes('sérénité') || stLower.includes('maintenance') || stLower.includes('infogérance') || stLower.includes('support')) {
    score += 25;
    breakdown.push({ label: 'Potentiel MRR récurrent', points: 25 });
  } else if (stLower.includes('sur-mesure') || stLower.includes('application') || stLower.includes('logiciel')) {
    score += 25;
    breakdown.push({ label: 'Développement sur-mesure', points: 25 });
  } else if (stLower.includes('web') || stLower.includes('site') || stLower.includes('refonte') || stLower.includes('shopify') || stLower.includes('wordpress')) {
    score += 22;
    breakdown.push({ label: 'Développement & Refonte Web', points: 22 });
  } else if (stLower.includes('audit') || stLower.includes('conseil') || stLower.includes('stratégie')) {
    score += 20;
    breakdown.push({ label: 'Mission conseil/audit', points: 20 });
  } else if (stLower.includes('seo') || stLower.includes('marketing') || stLower.includes('design') || stLower.includes('branding')) {
    score += 20;
    breakdown.push({ label: 'Prestation Marketing/Design', points: 20 });
  } else {
    score += 20;
    breakdown.push({ label: `Prestation sur-mesure (${params.serviceType || 'Standard'})`, points: 20 });
  }

  // 3. Source du lead (jusqu'à 15 pts)
  const src = (params.source || '').toLowerCase();
  if (src.includes('recommandation') || src.includes('client récurrent') || src.includes('réseau')) {
    score += 15;
    breakdown.push({ label: 'Source qualifiée (Recommandation/Réseau)', points: 15 });
  } else if (src.includes('web') || src.includes('formulaire') || src.includes('entrant')) {
    score += 12;
    breakdown.push({ label: 'Lead entrant qualifié (Site web)', points: 12 });
  } else if (src.includes('linkedin') || src.includes('événement')) {
    score += 10;
    breakdown.push({ label: 'Prospection ciblée / Salon', points: 10 });
  } else {
    score += 5;
    breakdown.push({ label: 'Source générique', points: 5 });
  }

  // 4. Fraîcheur du contact (jusqu'à 10 pts)
  if (params.lastContactDate) {
    const today = new Date('2026-10-11'); // Ancre date de référence
    const last = new Date(params.lastContactDate);
    const diffDays = Math.max(0, Math.floor((today.getTime() - last.getTime()) / (1000 * 3600 * 24)));
    if (diffDays <= 3) {
      score += 10;
      breakdown.push({ label: 'Contact récent (≤ 3j)', points: 10 });
    } else if (diffDays <= 7) {
      score += 5;
      breakdown.push({ label: 'Contact actif (≤ 7j)', points: 5 });
    }
  }

  // Cap à 100 max
  score = Math.min(100, Math.max(1, score));

  // Qualification de la priorité
  let priority: PriorityLevel = 'Froid';
  if (score >= 75) {
    priority = 'Chaud';
  } else if (score >= 50) {
    priority = 'Tiède';
  } else {
    priority = 'Froid';
  }

  return { score, priority, breakdown };
}
