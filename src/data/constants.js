// ─────────────────────────────────────────────
// FestRev – Application Constants
// ─────────────────────────────────────────────

export const ROOM_TYPES = [
  { value: 'Single',    label: 'Simple',     maxParticipants: 1, icon: '🛏️' },
  { value: 'Double',    label: 'Double',     maxParticipants: 2, icon: '🛏️🛏️' },
  { value: 'Triple',    label: 'Triple',     maxParticipants: 3, icon: '🛏️🛏️🛏️' },
  { value: 'Quadruple', label: 'Quadruple',  maxParticipants: 4, icon: '🛏️🛏️🛏️🛏️' },
];

export const CATEGORIES = [
  { value: 'Standard',     label: 'Standard',      color: 'bg-gray-100 text-gray-700' },
  { value: 'VIP',          label: 'VIP',            color: 'bg-amber-100 text-amber-800' },
  { value: 'Organisation', label: 'Organisation',   color: 'bg-blue-100 text-blue-700' },
  { value: 'Artiste',      label: 'Artiste',        color: 'bg-teal-100 text-teal-700' },
];

export const STATUSES = [
  { value: 'Confirmée',  label: 'Confirmée',   color: 'bg-emerald-100 text-emerald-700' },
  { value: 'En attente', label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Annulée',    label: 'Annulée',     color: 'bg-red-100 text-red-700' },
];

export const DEFAULT_HOTELS = [
  { name: 'Hôtel Rivage',    stars: 4, address: 'Boulevard de la Corniche' },
  { name: 'Hôtel Archipel',  stars: 5, address: 'Avenue des Palmiers' },
  { name: 'Hôtel Shems',     stars: 3, address: 'Rue du Port' },
];

export const EXPORT_OPTIONS = {
  defaultFileName: 'FestRev_Export',
  dateFormat: 'DD/MM/YYYY',
  sheetColors: {
    headerBg: '1F2937',       // dark gray header row
    headerFont: 'FFFFFF',     // white header text
    titleBg: 'D4A843',        // gold hotel-name banner
    titleFont: 'FFFFFF',
    altRowBg: 'F9FAFB',       // light alternating rows
    categoryVIP: 'FEF3C7',    // amber-100
    categoryArtiste: 'CCFBF1', // teal-100
    categoryOrganisation: 'DBEAFE', // blue-100
    categoryStandard: 'F3F4F6', // gray-100
  },
  columnHeaders: [
    'N°',
    'Type Chambre',
    'Catégorie',
    'Nom 1', 'Prénom 1',
    'Nom 2', 'Prénom 2',
    'Nom 3', 'Prénom 3',
    'Nom 4', 'Prénom 4',
    'Check-in',
    'Check-out',
    'Nuitées Supp.',
    'Notes',
  ],
};
