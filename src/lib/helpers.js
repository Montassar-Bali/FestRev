// ─────────────────────────────────────────────
// FestRev – Utility / Helper Functions
// ─────────────────────────────────────────────

/**
 * Format an ISO date string as DD/MM/YYYY.
 * Returns '' for falsy input.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a check-in / check-out pair as "DD/MM – DD/MM/YYYY".
 */
export function formatDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '';
  const dIn  = new Date(checkIn);
  const dOut = new Date(checkOut);

  const dayIn    = String(dIn.getDate()).padStart(2, '0');
  const monthIn  = String(dIn.getMonth() + 1).padStart(2, '0');

  const dayOut   = String(dOut.getDate()).padStart(2, '0');
  const monthOut = String(dOut.getMonth() + 1).padStart(2, '0');
  const yearOut  = dOut.getFullYear();

  return `${dayIn}/${monthIn} – ${dayOut}/${monthOut}/${yearOut}`;
}

/**
 * Return the maximum number of participants allowed for a given room type.
 */
export function getRoomTypeMax(roomType) {
  const map = { Single: 1, Double: 2, Triple: 3, Quadruple: 4 };
  return map[roomType] ?? 1;
}

/**
 * Return a CSS class string for a reservation category badge.
 */
export function getCategoryColor(category) {
  const map = {
    Standard:     'bg-gray-100 text-gray-700',
    VIP:          'bg-amber-100 text-amber-800',
    Organisation: 'bg-blue-100 text-blue-700',
    Artiste:      'bg-teal-100 text-teal-700',
  };
  return map[category] ?? 'bg-gray-100 text-gray-700';
}

/**
 * Return the French display label for a category.
 */
export function getCategoryLabel(category) {
  const map = {
    Standard:     'Standard',
    VIP:          'VIP',
    Organisation: 'Organisation',
    Artiste:      'Artiste',
  };
  return map[category] ?? category;
}

/**
 * Return a CSS class string for a reservation status badge.
 */
export function getStatusColor(status) {
  const map = {
    'Confirmée':  'bg-emerald-100 text-emerald-700',
    'En attente': 'bg-yellow-100 text-yellow-700',
    'Annulée':    'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

/**
 * Filter an array of reservations.
 *
 * filters shape:
 *   { hotelId?, roomType?, category?, status?, search? }
 *
 * `search` matches against participant names (nom + prenom), notes,
 *  bandName and teamRole (case-insensitive).
 */
export function filterReservations(reservations, filters = {}) {
  return reservations.filter((r) => {
    if (filters.hotelId && r.hotelId !== filters.hotelId) return false;
    if (filters.roomType && r.roomType !== filters.roomType) return false;
    if (filters.category && r.category !== filters.category) return false;
    if (filters.status && r.status !== filters.status) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        ...(r.participants || []).map((p) => `${p.nom} ${p.prenom}`),
        r.bandName ?? '',
        r.teamRole ?? '',
        r.notes ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Sort reservations by a given field.
 * sortBy: 'checkIn' | 'checkOut' | 'category' | 'roomType' | 'status' | 'createdAt'
 * sortOrder: 'asc' | 'desc'
 */
export function sortReservations(reservations, sortBy = 'createdAt', sortOrder = 'desc') {
  const sorted = [...reservations].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Date fields — compare as timestamps
    if (['checkIn', 'checkOut', 'createdAt'].includes(sortBy)) {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Wrapper around crypto.randomUUID().
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Calculate the number of nights between two ISO date strings.
 */
export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay));
}
