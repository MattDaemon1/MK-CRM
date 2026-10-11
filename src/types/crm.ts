export type ProspectStatus =
  | 'Lead entrant'
  | 'Contacté'
  | 'Proposition envoyée'
  | 'En attente de signature'
  | 'Gagné'
  | 'Perdu';

export type PriorityLevel = 'Chaud' | 'Tiède' | 'Froid';

// Type de prestation extensible (ouvert aux ajouts personnalisés)
export type ServiceType = string;

export const DEFAULT_SERVICE_TYPES: string[] = [
  'Refonte & Dev Web',
  'IA & Automatisation',
  'Workflows n8n',
  'Pack Sérénité (Maintenance)',
  'Application sur-mesure',
  'Audit & Conseil',
  'SEO & Référencement',
  'Formation & Coaching',
  'Hébergement & Infogérance'
];

export interface ActiveService {
  id: string;
  name: string;
  monthly_price: number; // Montant mensuel équivalent (MRR en €)
  annual_price?: number; // Montant annuel si facturé à l'année (ex: 1200 € / an)
  billing_cycle: 'Mensuel' | 'Trimestriel' | 'Annuel';
  start_date: string;
  renewal_date: string;
  status: 'Actif' | 'En pause' | 'Résilié';
  notes?: string;
  auto_renew?: boolean;
  reminder_days_before?: number; // Prévenance en jours (ex: 30, 15, 7)
  last_renewed_date?: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change';
  content: string;
  author?: string;
}

export interface Prospect {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  source: string;
  status: ProspectStatus;
  service_type: ServiceType;
  estimated_value: number; // Montant estimé en €
  lead_score: number; // 1 à 100
  priority: PriorityLevel;
  last_contact_date: string; // YYYY-MM-DD
  next_follow_up_date?: string; // YYYY-MM-DD
  notes: string[];
  timeline?: TimelineEntry[];
  active_services: ActiveService[];
  created_at?: string;
  won_date?: string;
}

export type TicketStatus = 'Ouvert' | 'En cours' | 'Résolu';
export type TicketPriority = 'Bloquant' | 'Normal' | 'Bas';
export type TicketCategory = 'Bug' | 'Pack Sérénité' | 'Évolution' | 'Support & Conseil';

export interface Ticket {
  id: string;
  title: string;
  client_id: string;
  client_company: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  description: string;
  created_at: string;
  due_date?: string;
  time_spent_hours?: number;
}

export interface DailyTask {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  related_to?: {
    type: 'prospect' | 'ticket' | 'contract';
    id: string;
    label: string;
  };
}

export interface CrmDatabase {
  version: number;
  last_updated: string;
  prospects: Prospect[];
  tickets: Ticket[];
  tasks: DailyTask[];
  custom_service_types?: string[];
}
