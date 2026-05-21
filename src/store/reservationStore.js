// ─────────────────────────────────────────────
// FestRev – Zustand Reservation Store (persisted)
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { DEFAULT_HOTELS } from '../data/constants';

// ── Seed helpers ──────────────────────────────

function id() {
  return crypto.randomUUID();
}

function buildSeedHotels() {
  return DEFAULT_HOTELS.map((h) => ({ id: id(), ...h }));
}

function buildSeedReservations(hotels) {
  const [rivage, archipel, shems] = hotels;
  const now = new Date().toISOString();

  return [
    // ── Hôtel Rivage (4★) ──────────────────
    {
      id: id(),
      hotelId: rivage.id,
      roomType: 'Double',
      category: 'VIP',
      participants: [
        { nom: 'Mbappé', prenom: 'Kylian' },
        { nom: 'Mbappé', prenom: 'Ethan' },
      ],
      checkIn: '2026-07-10',
      checkOut: '2026-07-14',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: 'Suite présidentielle demandée',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: rivage.id,
      roomType: 'Single',
      category: 'Organisation',
      participants: [{ nom: 'Dupont', prenom: 'Marie' }],
      checkIn: '2026-07-09',
      checkOut: '2026-07-15',
      extraNights: [
        { participantIndex: 0, date: '2026-07-09', type: 'before' },
      ],
      bandName: '',
      teamRole: 'Directrice logistique',
      notes: 'Arrivée la veille pour préparation',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: rivage.id,
      roomType: 'Triple',
      category: 'Artiste',
      participants: [
        { nom: 'Diallo', prenom: 'Amadou' },
        { nom: 'Traoré', prenom: 'Fatou' },
        { nom: 'Koné', prenom: 'Ibrahim' },
      ],
      checkIn: '2026-07-11',
      checkOut: '2026-07-14',
      extraNights: [],
      bandName: 'Les Étoiles du Sahel',
      teamRole: '',
      notes: 'Instruments fragiles – stockage sécurisé nécessaire',
      status: 'Confirmée',
      createdAt: now,
    },

    // ── Hôtel Archipel (5★) ────────────────
    {
      id: id(),
      hotelId: archipel.id,
      roomType: 'Quadruple',
      category: 'Artiste',
      participants: [
        { nom: 'Benali', prenom: 'Yasmine' },
        { nom: 'Cherif', prenom: 'Omar' },
        { nom: 'Haddad', prenom: 'Nadia' },
        { nom: 'Messaoud', prenom: 'Karim' },
      ],
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      extraNights: [
        { participantIndex: 0, date: '2026-07-13', type: 'after' },
        { participantIndex: 1, date: '2026-07-13', type: 'after' },
      ],
      bandName: 'Rai Fusion Collective',
      teamRole: '',
      notes: 'Concert de clôture – sound-check le 10 à 14 h',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: archipel.id,
      roomType: 'Double',
      category: 'VIP',
      participants: [
        { nom: 'Laurent', prenom: 'Philippe' },
        { nom: 'Laurent', prenom: 'Isabelle' },
      ],
      checkIn: '2026-07-11',
      checkOut: '2026-07-14',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: 'Sponsor principal – accueil personnalisé',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: archipel.id,
      roomType: 'Single',
      category: 'VIP',
      participants: [{ nom: 'El Fassi', prenom: 'Amina' }],
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: 'Ministre de la Culture – protocole sécurité',
      status: 'En attente',
      createdAt: now,
    },

    // ── Hôtel Shems (3★) ──────────────────
    {
      id: id(),
      hotelId: shems.id,
      roomType: 'Double',
      category: 'Standard',
      participants: [
        { nom: 'Martin', prenom: 'Jean' },
        { nom: 'Petit', prenom: 'Sophie' },
      ],
      checkIn: '2026-07-11',
      checkOut: '2026-07-13',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: '',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: shems.id,
      roomType: 'Triple',
      category: 'Organisation',
      participants: [
        { nom: 'Bouchard', prenom: 'Luc' },
        { nom: 'Nguyen', prenom: 'Thi' },
        { nom: 'Garcia', prenom: 'Carlos' },
      ],
      checkIn: '2026-07-09',
      checkOut: '2026-07-15',
      extraNights: [
        { participantIndex: 0, date: '2026-07-08', type: 'before' },
        { participantIndex: 2, date: '2026-07-15', type: 'after' },
      ],
      bandName: '',
      teamRole: 'Équipe technique son & lumière',
      notes: 'Accès backstage requis',
      status: 'Confirmée',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: shems.id,
      roomType: 'Single',
      category: 'Standard',
      participants: [{ nom: 'Moreau', prenom: 'Claire' }],
      checkIn: '2026-07-12',
      checkOut: '2026-07-14',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: 'Régime végétarien',
      status: 'En attente',
      createdAt: now,
    },
    {
      id: id(),
      hotelId: shems.id,
      roomType: 'Quadruple',
      category: 'Standard',
      participants: [
        { nom: 'Lefèvre', prenom: 'Antoine' },
        { nom: 'Roux', prenom: 'Émilie' },
        { nom: 'Bernard', prenom: 'Hugo' },
        { nom: 'Fournier', prenom: 'Camille' },
      ],
      checkIn: '2026-07-10',
      checkOut: '2026-07-13',
      extraNights: [],
      bandName: '',
      teamRole: '',
      notes: 'Groupe de bénévoles – badges à préparer',
      status: 'Confirmée',
      createdAt: now,
    },
  ];
}

// ── Store ─────────────────────────────────────

const useReservationStore = create((set, get) => ({
  hotels: [],
  reservations: [],

  // ─── Hotel actions ──────────────────
  addHotel: async (hotel) => {
    const newId = crypto.randomUUID();
    await set(ref(db, `hotels/${newId}`), { id: newId, ...hotel });
  },

  updateHotel: async (id, data) => {
    await update(ref(db, `hotels/${id}`), data);
  },

  deleteHotel: async (id) => {
    // Delete the hotel itself
    await remove(ref(db, `hotels/${id}`));
    // Also delete any reservations associated with this hotel
    const reservations = get().reservations;
    const associatedReservations = reservations.filter((r) => r.hotelId === id);
    for (const r of associatedReservations) {
      await remove(ref(db, `reservations/${r.id}`));
    }
  },

  // ─── Reservation actions ────────────
  addReservation: async (reservation) => {
    const newId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await set(ref(db, `reservations/${newId}`), {
      id: newId,
      createdAt,
      ...reservation,
    });
  },

  updateReservation: async (id, data) => {
    await update(ref(db, `reservations/${id}`), data);
  },

  deleteReservation: async (id) => {
    await remove(ref(db, `reservations/${id}`));
  },

  // ─── Selectors / computed ───────────
  getReservationsByHotel: (hotelId) => {
    return get().reservations.filter((r) => r.hotelId === hotelId);
  },

  getStats: () => {
    const { reservations, hotels } = get();
    return {
      totalReservations: reservations.length,
      totalParticipants: reservations.reduce(
        (sum, r) => sum + (r.participants?.length ?? 0),
        0,
      ),
      totalHotels: hotels.length,
      vipCount: reservations.filter((r) => r.category === 'VIP').length,
      confirmedCount: reservations.filter(
        (r) => r.status === 'Confirmée',
      ).length,
      pendingCount: reservations.filter(
        (r) => r.status === 'En attente',
      ).length,
      cancelledCount: reservations.filter(
        (r) => r.status === 'Annulée',
      ).length,
      artisteCount: reservations.filter(
        (r) => r.category === 'Artiste',
      ).length,
      organisationCount: reservations.filter(
        (r) => r.category === 'Organisation',
      ).length,
    };
  },
}));

// Listen to Firebase and sync changes to Zustand
onValue(ref(db), (snapshot) => {
  const data = snapshot.val();
  if (!data || (!data.hotels && !data.reservations)) {
    // Database is empty, seed it!
    const hotels = buildSeedHotels();
    const reservations = buildSeedReservations(hotels);

    const hotelsObj = {};
    hotels.forEach((h) => {
      hotelsObj[h.id] = h;
    });

    const reservationsObj = {};
    reservations.forEach((r) => {
      reservationsObj[r.id] = r;
    });

    set(ref(db), {
      hotels: hotelsObj,
      reservations: reservationsObj,
    });
  } else {
    // Map objects back to arrays
    const hotels = data.hotels ? Object.values(data.hotels) : [];
    const reservations = data.reservations ? Object.values(data.reservations) : [];
    
    useReservationStore.setState({ hotels, reservations });
  }
});

export { useReservationStore };
export default useReservationStore;
