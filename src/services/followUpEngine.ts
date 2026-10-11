import { Prospect } from '../types/crm';

export interface FollowUpAlert {
  prospect: Prospect;
  daysSinceContact: number;
  urgency: 'Critique' | 'Haute' | 'Normale';
  reason: string;
  recommendedAction: string;
}

const REFERENCE_DATE = new Date('2026-10-11');

export function getDaysSinceDate(dateString?: string): number {
  if (!dateString) return 999;
  const target = new Date(dateString);
  const diffTime = REFERENCE_DATE.getTime() - target.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function detectFollowUps(prospects: Prospect[]): FollowUpAlert[] {
  const alerts: FollowUpAlert[] = [];

  for (const p of prospects) {
    if (p.status === 'Gagné' || p.status === 'Perdu') {
      continue;
    }

    const days = getDaysSinceDate(p.last_contact_date);

    if (p.status === 'Lead entrant' && days >= 0) {
      alerts.push({
        prospect: p,
        daysSinceContact: days,
        urgency: days >= 2 ? 'Critique' : 'Haute',
        reason: days === 0 ? 'Nouveau lead reçu aujourd’hui' : `Lead entrant sans réponse depuis ${days} jour(s)`,
        recommendedAction: 'Contacter le prospect sous 24h pour cadrer le besoin et planifier un appel'
      });
    } else if (p.status === 'Proposition envoyée' && days >= 3) {
      alerts.push({
        prospect: p,
        daysSinceContact: days,
        urgency: days >= 7 ? 'Critique' : 'Haute',
        reason: `Devis envoyé il y a ${days} jours sans retour`,
        recommendedAction: 'Faire une relance à valeur ajoutée pour lever d’éventuelles objections'
      });
    } else if (p.status === 'En attente de signature' && days >= 3) {
      alerts.push({
        prospect: p,
        daysSinceContact: days,
        urgency: days >= 6 ? 'Critique' : 'Haute',
        reason: `Contrat en cours de signature depuis ${days} jours`,
        recommendedAction: 'Proposer un point rapide de 5 min pour finaliser la signature'
      });
    } else if (p.status === 'Contacté' && days >= 5) {
      alerts.push({
        prospect: p,
        daysSinceContact: days,
        urgency: 'Normale',
        reason: `Échange initial il y a ${days} jours sans suite`,
        recommendedAction: 'Relancer pour vérifier la validation du cahier des charges'
      });
    }
  }

  // Trier par urgence puis par jours décroissants
  const weight = { Critique: 3, Haute: 2, Normale: 1 };
  return alerts.sort((a, b) => {
    if (weight[b.urgency] !== weight[a.urgency]) {
      return weight[b.urgency] - weight[a.urgency];
    }
    return b.daysSinceContact - a.daysSinceContact;
  });
}

export type FollowUpTone = 'professionnel' | 'chaleureux' | 'concis';

export function generateFollowUpEmail(
  prospect: Prospect,
  tone: FollowUpTone = 'professionnel'
): { subject: string; body: string } {
  const contact = prospect.contact_name || 'Bonjour';
  const company = prospect.company || 'votre entreprise';
  const service = prospect.service_type || 'votre projet';
  const amount = prospect.estimated_value ? `${prospect.estimated_value.toLocaleString('fr-FR')} € HT` : '';

  if (prospect.status === 'Lead entrant') {
    if (tone === 'concis') {
      return {
        subject: `Votre projet ${service} - ${company}`,
        body: `Bonjour ${contact},

Merci pour votre message concernant ${service}.
Seriez-vous disponible pour un court échange téléphonique de 15 minutes ce mardi ou jeudi afin de cadrer vos priorités et les délais souhaités ?

Bien cordialement,`
      };
    }
    return {
      subject: `Suite à votre demande de contact - Projet ${service}`,
      body: `Bonjour ${contact},

J'ai bien pris connaissance de votre demande pour ${company} concernant votre projet de ${service}.

Afin de vous proposer une recommandation technique et budgétaire sur-mesure, je vous propose d'échanger 15 à 20 minutes en visio ou par téléphone.

Quelles seraient vos disponibilités dans les prochains jours ?

Bien cordialement,`
    };
  }

  if (prospect.status === 'Proposition envoyée') {
    if (tone === 'concis') {
      return {
        subject: `Suivi proposition ${company} (${service})`,
        body: `Bonjour ${contact},

Je reviens vers vous concernant la proposition transmise pour ${service}${amount ? ` (${amount})` : ''}.
Avez-vous eu l'opportunité d'en discuter en interne ? N'hésitez pas si vous avez la moindre question technique ou d'organisation.

Bien cordialement,`
      };
    }
    if (tone === 'chaleureux') {
      return {
        subject: `Des nouvelles de votre projet ${service} ?`,
        body: `Bonjour ${contact},

J'espère que vous passez une excellente semaine.

Je me permets de prendre de vos nouvelles suite à l'envoi de la proposition pour ${company}. Avez-vous pu la consulter et mesurer l'impact de ces évolutions pour votre activité ?

Je reste entièrement à votre écoute pour ajuster certains points ou caler le planning de démarrage selon vos contraintes.

Très bonne journée,`
      };
    }
    return {
      subject: `Point d'étape : Proposition ${service} - ${company}`,
      body: `Bonjour ${contact},

Je fais suite à notre échange et à l'envoi de la proposition relative à la prestation de ${service}${amount ? ` d'un montant de ${amount}` : ''}.

Avez-vous eu le temps d'étudier ce devis ? Si des questions subsistent sur le périmètre ou les étapes de déploiement, nous pouvons bloquer 10 minutes ensemble cette semaine.

Dans l'attente de votre retour, je vous souhaite une excellente journée.

Bien cordialement,`
    };
  }

  if (prospect.status === 'En attente de signature') {
    return {
      subject: `Finalisation du contrat - Projet ${service}`,
      body: `Bonjour ${contact},

Nous avions validé les grandes lignes pour le projet de ${service} de ${company}.

Afin de pouvoir réserver le créneau de production dans mon planning et garantir le calendrier convenu, pourriez-vous me retourner le contrat signé ou m'indiquer s'il manque un élément administratif ?

Restant à votre disposition,

Bien cordialement,`
    };
  }

  // Par défaut (Contacté)
  return {
    subject: `Suite de notre échange - ${company}`,
    body: `Bonjour ${contact},

Je fais suite à notre dernière discussion concernant vos projets chez ${company}.

Avez-vous pu avancer sur les éléments que nous avions évoqués ? Je me tiens à votre disposition si vous souhaitez que nous approfondissions le sujet.

Bien cordialement,`
  };
}

export interface RenewalAlert {
  id: string;
  contract: import('../types/crm').ActiveService;
  client: Prospect;
  daysRemaining: number;
  urgency: 'Critique' | 'Urgent' | 'À anticiper';
  reason: string;
  suggestedAction: string;
}

export function detectRenewalAlerts(prospects: Prospect[]): RenewalAlert[] {
  const alerts: RenewalAlert[] = [];

  for (const client of prospects) {
    if (!client.active_services || !Array.isArray(client.active_services)) continue;

    for (const srv of client.active_services) {
      if (srv.status !== 'Actif' || !srv.renewal_date) continue;

      const target = new Date(srv.renewal_date);
      const diffTime = target.getTime() - REFERENCE_DATE.getTime();
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Alert if renewal is in less than 45 days or expired
      if (days <= 45) {
        let urgency: 'Critique' | 'Urgent' | 'À anticiper' = 'À anticiper';
        let reason = `Renouvellement dans ${days} jour(s) (${srv.renewal_date})`;

        if (days < 0) {
          urgency = 'Critique';
          reason = `Échéance dépassée depuis ${Math.abs(days)} jour(s) (${srv.renewal_date})`;
        } else if (days <= 15) {
          urgency = 'Urgent';
          reason = `Renouvellement imminent : dans ${days} jour(s) (${srv.renewal_date})`;
        }

        const priceLabel = srv.annual_price
          ? `${srv.annual_price.toLocaleString('fr-FR')} € / an`
          : `${srv.monthly_price.toLocaleString('fr-FR')} € / mois`;

        alerts.push({
          id: `${client.id}-${srv.id}`,
          contract: srv,
          client,
          daysRemaining: days,
          urgency,
          reason,
          suggestedAction: `Contacter ${client.contact_name} pour valider la reconduction de ${srv.name} (${priceLabel})`
        });
      }
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function generateRenewalEmail(
  client: Prospect,
  contract: import('../types/crm').ActiveService,
  tone: FollowUpTone = 'professionnel'
): { subject: string; body: string } {
  const contact = client.contact_name || 'Bonjour';
  const company = client.company || 'votre société';
  const contractName = contract.name;
  const renewalDate = contract.renewal_date;
  const price = contract.annual_price
    ? `${contract.annual_price.toLocaleString('fr-FR')} € HT / an`
    : `${(contract.monthly_price * 12).toLocaleString('fr-FR')} € HT / an (${contract.monthly_price} €/mois)`;

  if (tone === 'concis') {
    return {
      subject: `Renouvellement de votre contrat ${contractName} - ${company}`,
      body: `Bonjour ${contact},

Votre contrat ${contractName} pour ${company} arrive à échéance le ${renewalDate}.

Je vous propose de reconduire la prestation pour une année supplémentaire aux conditions habituelles (${price}).
Souhaitez-vous que je vous fasse parvenir la facture d'acompte ou le bon de renouvellement ?

Bien cordialement,`
    };
  }

  if (tone === 'chaleureux') {
    return {
      subject: `Bilan d'étape & renouvellement annuel de votre formule ${contractName}`,
      body: `Bonjour ${contact},

J'espère que vous allez très bien !

Nous arrivons bientôt au terme de l'année pour votre contrat ${contractName} chez ${company} (date d'échéance : ${renewalDate}).
C'est un plaisir de vous accompagner dans le maintien et l'optimisation de vos outils.

Afin d'assurer la continuité de service sans interruption (mises à jour, support prioritaire et surveillance), je vous propose de renouveler notre engagement pour une nouvelle année (${price}).

Avez-vous quelques minutes cette semaine pour un court échange téléphonique ?

Très belle journée,`
    };
  }

  return {
    subject: `Renouvellement annuel - Contrat ${contractName} (${company})`,
    body: `Bonjour ${contact},

Je me permets de vous contacter car votre abonnement de maintenance et suivi ${contractName} pour ${company} arrive à échéance le ${renewalDate}.

Pour continuer à bénéficier des services associés (maintenance préventive, sauvegardes, support réactif) et garantir la sécurité de vos environnements, je vous invite à confirmer la reconduction pour la période à venir.

Montant de la période annuelle : ${price}.

Je reste à votre disposition si vous avez la moindre question ou souhaitez faire évoluer le périmètre de la prestation.

Bien cordialement,`
  };
}

