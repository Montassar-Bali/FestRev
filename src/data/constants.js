// ─────────────────────────────────────────────
// FestRev – Application Constants
// ─────────────────────────────────────────────

export const CIVILITIES = [
  { value: 'M.', label: 'M.' },
  { value: 'Mme', label: 'Mme' },
  { value: 'Autre', label: 'Autre' },
];

export const STATUS_OPTIONS = [
  { value: 'Payé', label: 'Payé', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'En attente', label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Remboursé', label: 'Remboursé', color: 'bg-red-100 text-red-700' },
];

export const EXPORT_OPTIONS = {
  defaultFileName: 'FestRev_Export_Billets',
  dateFormat: 'DD/MM/YYYY',
  sheetColors: {
    headerBg: '1F2937',       // dark gray header row
    headerFont: 'FFFFFF',     // white header text
    titleBg: '3B82F6',        // blue banner
    titleFont: 'FFFFFF',
    altRowBg: 'F9FAFB',       // light alternating rows
    statusPaye: 'D1FAE5',     // green-100
    statusPending: 'FEF3C7',  // amber-100
    statusRefunded: 'FEE2E2', // red-100
    statusStandard: 'F3F4F6', // gray-100
  },
  columnHeaders: [
    'N° Billet',
    'N° Commande',
    'N° Commande Avancé',
    'Typologie',
    'Catégorie Famille',
    'Tarif',
    'Code-barres',
    'Composté',
    'Supprimé',
    'Date Commande',
    'Date Paiement',
    'Origine',
    'Statut Billet',
    'Prix Public (€)',
    'Total Frais (€)',
    'Code Réduction',
    'Réduction (€)',
    'Prix TTC Payé (€)',
    'Commission (€)',
    'Prix TTC Sans Comm. (€)',
    'HT Prix Payé (€)',
    'Taux Taxe',
    'Taxe (€)',
    'Nom Acheteur',
    'Prénom Acheteur',
    'Email Acheteur',
    'Mobile Acheteur',
    'Nom Participant',
    'Prénom Participant',
    'Email Participant',
    'Civilité Participant',
    'Date Naissance Participant',
    'Téléphone Participant',
    'Ville Participant',
    'Pays Participant',
    'Nuitée Supplémentaire',
    'Réf Full Pass',
    'Facture Société',
    'Facture TVA',
    'Facture Adresse',
    'Facture Ville',
    'Facture Pays',
    'Infos Complémentaires'
  ]
};
