# MK CRM - CRM Local pour Freelance & Agence

CRM sur-mesure, ultra-rapide, orienté productivité et zéro clic superflu. Conçu pour le pilotage d'activité commerciale, les relances intelligentes, le support et le suivi des revenus récurrents (MRR).

---

## 🔐 Identifiants de Connexion

- **Identifiant :** `Matt`
- **Mot de passe :** `Maboule35!`

---

## 📁 Architecture Technique des Fichiers

```
/
├── src/
│   ├── types/
│   │   └── crm.ts                 # Modèles de données complets (Prospects, Tickets, Contrats, Tâches)
│   ├── data/
│   │   └── initialData.ts         # Jeu de données d'initialisation (MP41, Logistique Sologne, Pack Sérénité)
│   ├── services/
│   │   ├── storage.ts             # Persistance locale (localStorage, exports/imports JSON, calculs KPIs)
│   │   ├── leadScorer.ts          # Moteur de scoring 1-100 & priorisation (Chaud / Tiède / Froid)
│   │   └── followUpEngine.ts      # Détection des relances prioritaires & générateur d'emails personnalisés
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginView.tsx      # Page de connexion sécurisée (Matt / Maboule35!)
│   │   ├── leads/
│   │   │   └── LeadsView.tsx      # Nouvel onglet dédié : Qualification, modification & suppression des Leads
│   │   ├── Header.tsx             # Barre d'en-tête MK CRM, profil, mode sombre, sauvegarde JSON
│   │   ├── Navigation.tsx         # Onglets avec compteurs d'alertes en temps réel (Leads, Relances, etc.)
│   │   ├── dashboard/
│   │   │   ├── DailyDashboard.tsx # Cockpit du jour (Relances prioritaires, To-Do list avec suppression)
│   │   │   ├── StatCard.tsx       # Composant carte KPI réutilisable
│   │   │   └── FollowUpModal.tsx  # Assistant de relance (templates email & mise à jour en 1 clic)
│   │   ├── pipeline/
│   │   │   ├── PipelineView.tsx   # Vue bascule Kanban / Tableau avec filtres multicritères
│   │   │   ├── KanbanBoard.tsx    # Pipeline Kanban avec glisser-déposer, édition & suppression
│   │   │   ├── ProspectTableView.tsx # Tableau interactif avec tri, édition & suppression inline
│   │   │   ├── ProspectCard.tsx   # Carte affaire ergonomique (actions rapides modifier / supprimer)
│   │   │   └── ProspectModal.tsx  # Modale d'ajout/édition avec calcul automatique du lead score
│   │   ├── tickets/
│   │   │   ├── TicketListView.tsx # Gestion des tickets support & interventions Pack Sérénité
│   │   │   └── TicketModal.tsx    # Création/modification de ticket avec client rattaché
│   │   ├── contracts/
│   │   │   ├── ContractsMrrView.tsx  # Pilotage des contrats récurrents & revenus mensuels (MRR/ARR)
│   │   │   └── ClientDetailDrawer.tsx # Tiroir fiche client (bouton Modifier, suppression sécurisée)
│   │   └── common/
│   │       ├── Toast.tsx          # Notifications discrètes d'action
│   │       └── ConfirmDialog.tsx  # Modale in-app de confirmation (remplace window.confirm)
│   ├── App.tsx                    # Orchestration de l'état principal, auth et synchronisation
│   ├── main.tsx                   # Point d'entrée React 19
│   └── index.css                  # Styles Tailwind CSS et Dark/Light mode
├── index.html                     # Point d'entrée HTML
├── package.json                   # Dépendances du projet
└── README.md                      # Guide d'installation et d'utilisation
```

---

## 🚀 Guide d'Installation & Lancement Local

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** (ou pnpm / yarn)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Démarrage de l'application
```bash
npm run dev
```

Ouvrez votre navigateur sur **http://localhost:3000** et connectez-vous avec `Matt` / `Maboule35!`.

### 3. Build pour la production (optionnel)
```bash
npm run build
```

---

## ⚡ Fonctionnalités Clés Intégrées

1. **Pipeline de Prospection (Kanban & Table)** :
   - 6 étapes fluides : *Lead entrant*, *Contacté*, *Proposition envoyée*, *En attente de signature*, *Gagné*, *Perdu*.
   - Calcul automatique du CA en cours, du CA pondéré par probabilité et du montant par colonne.
   - Glisser-déposer (Drag & Drop) natif ou boutons de changement d'étape en 1 clic.

2. **Scoring & Qualification Automatique (Lead Scoring)** :
   - Algorithme calculant un score de 1 à 100 et un statut de priorité (*Chaud*, *Tiède*, *Froid*) basé sur le montant estimé, le type de prestation (IA, n8n, Refonte web, Pack Sérénité) et la fraîcheur du contact.

3. **Moteur Intelligent de Relances & To-Do du Jour** :
   - Détection des opportunités sans nouvelles depuis $X$ jours (ex: MP41 lead du jour, Logistique Sologne proposition envoyée depuis 9 jours).
   - Générateur d'emails de relance (tons Professionnel, Concis ou Chaleureux) avec copie en 1 clic ou ouverture du client mail.
   - Bouton d'action directe "Contacté !" mettant immédiatement à jour la date et l'historique sans changer d'écran.
   - To-Do list du jour avec cases à cocher et ajout rapide.

4. **Support & Maintenance (Tickets & Pack Sérénité)** :
   - Suivi des demandes clients (Bugs, Pack Sérénité, Évolutions, Conseil).
   - Priorités (Bloquant, Normal, Bas) et changement de statut rapide (*En cours*, *Résolu*).

5. **Suivi des Contrats & Revenus Récurrents (MRR)** :
   - Fiche client complète intégrant les abonnements actifs, dates de renouvellement et timeline horodatée des interactions.
   - Tableau de bord MRR / ARR avec métriques de valeur moyenne par client (ARPU).

6. **Données Persistantes & Sauvegarde Zéro Risque** :
   - Stockage local instantané (`localStorage`).
   - Exportation et importation JSON en un clic pour sauvegarder ou transférer votre base (`kroma_crm_backup.json`).
   - Réinitialisation instantanée des données de démonstration avec MP41 et Logistique Sologne.
