import { CrmDatabase } from '../types/crm';

export const INITIAL_DATABASE: CrmDatabase = {
  version: 1,
  last_updated: '2026-10-11T05:28:00.000Z',
  prospects: [
    {
      id: 'p-001',
      company: 'MP41',
      contact_name: 'Contact MP41',
      email: 'contact@mp41.fr',
      phone: '+33 6 00 00 00 00',
      source: 'Formulaire de contact web',
      status: 'Lead entrant',
      service_type: 'Refonte & Dev Web',
      estimated_value: 3500,
      lead_score: 85,
      priority: 'Chaud',
      last_contact_date: '2026-10-11',
      next_follow_up_date: '2026-10-12',
      created_at: '2026-10-11',
      notes: [
        'Demande reçue via le formulaire de contact pour une prestation de refonte complète du site web.',
        'Souhaite moderniser leur image de marque et améliorer le taux de conversion mobile.'
      ],
      timeline: [
        {
          id: 't-1',
          date: '2026-10-11 09:30',
          type: 'email',
          content: 'Réception du formulaire entrant - Cahier des charges succinct transmis.'
        }
      ],
      active_services: []
    },
    {
      id: 'p-002',
      company: 'Logistique Sologne',
      contact_name: 'Jean Dupont',
      email: 'j.dupont@logistiquesologne.fr',
      phone: '+33 2 54 00 00 00',
      source: 'Prospection LinkedIn',
      status: 'Proposition envoyée',
      service_type: 'Workflows n8n',
      estimated_value: 4800,
      lead_score: 90,
      priority: 'Chaud',
      last_contact_date: '2026-10-02',
      next_follow_up_date: '2026-10-08',
      created_at: '2026-09-25',
      notes: [
        'Audit IA & automatisation réalisé. Devis envoyé pour la mise en place de workflows n8n.',
        'Objectif : automatiser le traitement des bons de livraison et notifications clients.'
      ],
      timeline: [
        {
          id: 't-2',
          date: '2026-09-28 14:00',
          type: 'meeting',
          content: 'Visio de restitution du diagnostic de flux de données.'
        },
        {
          id: 't-3',
          date: '2026-10-02 11:15',
          type: 'email',
          content: 'Envoi du devis n° DEV-2026-042 (4 800 € HT).'
        }
      ],
      active_services: []
    },
    {
      id: 'p-003',
      company: 'Cabinet Val de Loire Avocats',
      contact_name: 'Maître Hélène Garnier',
      email: 'h.garnier@vdla-avocats.fr',
      phone: '+33 2 47 12 34 56',
      source: 'Recommandation client',
      status: 'Gagné',
      service_type: 'Pack Sérénité (Maintenance)',
      estimated_value: 5200,
      lead_score: 95,
      priority: 'Chaud',
      last_contact_date: '2026-10-05',
      created_at: '2026-08-10',
      won_date: '2026-08-28',
      notes: [
        'Client signé ! Refonte du portail client livrée en septembre.',
        'Souscription au Pack Sérénité annuelle avec maintenance et support réactif.'
      ],
      timeline: [
        {
          id: 't-4',
          date: '2026-08-28 16:00',
          type: 'status_change',
          content: 'Contrat signé et acompte réglé.'
        },
        {
          id: 't-5',
          date: '2026-09-01 09:00',
          type: 'note',
          content: 'Activation du contrat Pack Sérénité récurrent (320 € / mois).'
        }
      ],
      active_services: [
        {
          id: 'srv-1',
          name: 'Pack Sérénité Web & Sécurité',
          monthly_price: 320,
          billing_cycle: 'Mensuel',
          start_date: '2026-09-01',
          renewal_date: '2027-09-01',
          status: 'Actif',
          notes: 'Mises à jour CMS, sauvegardes journalières, monitoring 99.9%'
        },
        {
          id: 'srv-2',
          name: 'Hébergement Cloud Dédié Infogéré',
          monthly_price: 49,
          billing_cycle: 'Mensuel',
          start_date: '2026-09-01',
          renewal_date: '2027-09-01',
          status: 'Actif',
          notes: 'Serveur NVMe localisé en France, certificat SSL auto-renouvelé'
        }
      ]
    },
    {
      id: 'p-004',
      company: 'EcoTech Solutions',
      contact_name: 'Alexandre Roux',
      email: 'a.roux@ecotech-solutions.io',
      phone: '+33 6 78 90 12 34',
      source: 'Événement Tech Nantes',
      status: 'Gagné',
      service_type: 'IA & Automatisation',
      estimated_value: 8500,
      lead_score: 88,
      priority: 'Chaud',
      last_contact_date: '2026-10-09',
      created_at: '2026-07-15',
      won_date: '2026-08-12',
      notes: [
        'Plateforme IA de parsing documentaire en production.',
        'Contrat de maintenance évolutive et supervision des pipelines LLM.'
      ],
      timeline: [
        {
          id: 't-6',
          date: '2026-08-12 10:00',
          type: 'status_change',
          content: 'Signature contrat de maintenance applicative IA.'
        }
      ],
      active_services: [
        {
          id: 'srv-3',
          name: 'Maintenance & Supervision Workflows IA',
          monthly_price: 450,
          billing_cycle: 'Mensuel',
          start_date: '2026-08-15',
          renewal_date: '2026-11-15',
          status: 'Actif',
          notes: 'Surveillance des quotas API OpenAI/Gemini, optimisations prompts & scripts'
        }
      ]
    },
    {
      id: 'p-005',
      company: 'Atelier Bois & Design',
      contact_name: 'Clara Delorme',
      email: 'clara@atelierboisdesign.com',
      phone: '+33 6 11 22 33 44',
      source: 'Réseau pro',
      status: 'En attente de signature',
      service_type: 'Application sur-mesure',
      estimated_value: 6200,
      lead_score: 82,
      priority: 'Chaud',
      last_contact_date: '2026-10-06',
      next_follow_up_date: '2026-10-12',
      created_at: '2026-09-18',
      notes: [
        'Devis finalisé après ajustement du module de configuration 3D de meubles.',
        'En attente de validation par l’associé technique avant signature.'
      ],
      timeline: [
        {
          id: 't-7',
          date: '2026-10-06 17:00',
          type: 'email',
          content: 'Envoi contrat dématérialisé pour signature électronique.'
        }
      ],
      active_services: []
    },
    {
      id: 'p-006',
      company: 'Clinique Vétérinaire du Parc',
      contact_name: 'Dr. Marc Leroy',
      email: 'contact@vetoduparc.fr',
      phone: '+33 2 41 88 99 00',
      source: 'Appel direct',
      status: 'Contacté',
      service_type: 'Refonte & Dev Web',
      estimated_value: 2400,
      lead_score: 60,
      priority: 'Tiède',
      last_contact_date: '2026-10-04',
      next_follow_up_date: '2026-10-13',
      created_at: '2026-10-01',
      notes: [
        'Premier échange téléphonique de 20 min. Recherche une prise de rendez-vous en ligne simplifiée.',
        'Doit m’envoyer des exemples de sites concurrents qui lui plaisent.'
      ],
      timeline: [
        {
          id: 't-8',
          date: '2026-10-04 11:30',
          type: 'call',
          content: 'Échange téléphonique de qualification des besoins.'
        }
      ],
      active_services: []
    },
    {
      id: 'p-007',
      company: 'Boulangerie Tradition Bio',
      contact_name: 'Sophie Martin',
      email: 'contact@traditionbio.fr',
      phone: '+33 6 45 67 89 01',
      source: 'Instagram',
      status: 'Perdu',
      service_type: 'Refonte & Dev Web',
      estimated_value: 1800,
      lead_score: 35,
      priority: 'Froid',
      last_contact_date: '2026-09-15',
      created_at: '2026-09-02',
      notes: [
        'Budget trop serré (< 800 € souhaité). Partiront probablement sur une solution Wix ou Shopify clé en main.'
      ],
      timeline: [
        {
          id: 't-9',
          date: '2026-09-15 15:00',
          type: 'status_change',
          content: 'Affaire clôturée en perdu (hors budget).'
        }
      ],
      active_services: []
    }
  ],
  tickets: [
    {
      id: 'tick-001',
      title: 'Erreur de webhook n8n sur les fiches expéditions',
      client_id: 'p-002',
      client_company: 'Logistique Sologne',
      status: 'Ouvert',
      priority: 'Bloquant',
      category: 'Bug',
      description: 'Le webhook entrant de test n8n renvoie une erreur 502 lors de réceptions de gros volumes JSON.',
      created_at: '2026-10-10',
      due_date: '2026-10-12',
      time_spent_hours: 1.5
    },
    {
      id: 'tick-002',
      title: 'Pack Sérénité : Mises à jour de sécurité et backup trimestriel',
      client_id: 'p-003',
      client_company: 'Cabinet Val de Loire Avocats',
      status: 'En cours',
      priority: 'Normal',
      category: 'Pack Sérénité',
      description: 'Audit semestriel de sécurité, vérification de la restauration des sauvegardes chiffrées.',
      created_at: '2026-10-08',
      due_date: '2026-10-15',
      time_spent_hours: 2.0
    },
    {
      id: 'tick-003',
      title: 'Ajout de champ Siret & validation automatique formulaire MP41',
      client_id: 'p-001',
      client_company: 'MP41',
      status: 'Ouvert',
      priority: 'Normal',
      category: 'Évolution',
      description: 'Prévoir dans la proposition l’intégration de l’API Entreprise/INSEE pour valider les formulaires.',
      created_at: '2026-10-11',
      due_date: '2026-10-14',
      time_spent_hours: 0.5
    },
    {
      id: 'tick-004',
      title: 'Alerte latence sur pipeline embeddings EcoTech',
      client_id: 'p-004',
      client_company: 'EcoTech Solutions',
      status: 'En cours',
      priority: 'Normal',
      category: 'Pack Sérénité',
      description: 'Temps de réponse supérieur à 1200ms sur certaines requêtes de vectorisation.',
      created_at: '2026-10-09',
      due_date: '2026-10-13',
      time_spent_hours: 1.0
    },
    {
      id: 'tick-005',
      title: 'Mise en conformité mentions légales et RGPD',
      client_id: 'p-003',
      client_company: 'Cabinet Val de Loire Avocats',
      status: 'Résolu',
      priority: 'Bas',
      category: 'Support & Conseil',
      description: 'Mise à jour du bandeau de consentement cookies et registre de traitement des données.',
      created_at: '2026-09-20',
      due_date: '2026-09-25',
      time_spent_hours: 3.0
    }
  ],
  tasks: [
    {
      id: 'tsk-001',
      title: 'Relancer Jean Dupont (Logistique Sologne) : devis n8n envoyé il y a 9 jours',
      due_date: '2026-10-11',
      completed: false,
      priority: 'Haute',
      related_to: {
        type: 'prospect',
        id: 'p-002',
        label: 'Logistique Sologne'
      }
    },
    {
      id: 'tsk-002',
      title: 'Appeler Contact MP41 suite à la demande entrante de refonte web',
      due_date: '2026-10-11',
      completed: false,
      priority: 'Haute',
      related_to: {
        type: 'prospect',
        id: 'p-001',
        label: 'MP41'
      }
    },
    {
      id: 'tsk-003',
      title: 'Résoudre le bug bloquant n8n sur les fiches expéditions',
      due_date: '2026-10-11',
      completed: false,
      priority: 'Haute',
      related_to: {
        type: 'ticket',
        id: 'tick-001',
        label: 'Ticket #tick-001'
      }
    },
    {
      id: 'tsk-004',
      title: 'Vérifier la signature électronique pour Atelier Bois & Design',
      due_date: '2026-10-12',
      completed: false,
      priority: 'Moyenne',
      related_to: {
        type: 'prospect',
        id: 'p-005',
        label: 'Atelier Bois & Design'
      }
    },
    {
      id: 'tsk-005',
      title: 'Générer la facture mensuelle Pack Sérénité pour Cabinet Val de Loire',
      due_date: '2026-10-15',
      completed: false,
      priority: 'Moyenne',
      related_to: {
        type: 'prospect',
        id: 'p-003',
        label: 'Cabinet Val de Loire Avocats'
      }
    }
  ]
};
