import { create } from 'zustand';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { normalizeTicketForUI } from '../lib/excelParser';

// Helper function to generate UUID
function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Seed Data for Tickets ───────────────────────────
function buildSeedTickets() {
  const now = new Date().toISOString();
  return [
    {
      id: generateUUID(),
      typologie: "Adulte",
      categorieFamille: "Pass 3 Jours",
      tarif: "Plein Tarif",
      codeBarres: 3829102938472,
      composte: 0,
      dateCommande: "2026-05-10",
      heureCommande: "14:32",
      datePaiement: "2026-05-10",
      heurePaiement: "14:35",
      nCommande: "CMD-2026-001",
      nCommandeAvance: "CMD-ADV-001",
      nBillet: "TKT-001",
      devise: "EUR",
      supprime: 0,
      origine: "Site Web",
      statutBillet: "Payé",
      ticketsNumber: "1",
      origineMarketing: "Facebook Ads",
      createdAt: now,
      prixPublic: 150.00,
      totalFrais: 4.50,
      codeReduction: "WELCOME10",
      reduction: 15.00,
      ttcPrixPaye: 139.50,
      commission: 5.00,
      ttcPrixSansCommission: 134.50,
      htPrixPaye: 116.25,
      tauxTaxe: "20%",
      taxe: 23.25,
      nomAcheteur: "Dupont",
      prenomAcheteur: "Jean",
      emailAcheteur: "jean.dupont@example.com",
      mobileAcheteur: "+33612345678",
      consentement: "Oui",
      langueAcheteur: "fr_FR",
      nomParticipant: "Dupont",
      prenomParticipant: "Jean",
      emailParticipant: "jean.dupont@example.com",
      civiliteParticipant: "M.",
      dateNaissanceParticipant: "15/08/1990",
      telephoneParticipant: "+33612345678",
      villeParticipant: "Paris",
      paysParticipant: "France",
      dateNuiteeSupplementaire: "",
      referenceFullPass: "FP-DUPONT-001",
      factureSociete: "",
      factureTva: "",
      factureAdresse: "10 Rue de la Paix",
      factureCodePostal: "75002",
      factureVille: "Paris",
      facturePays: "France",
      informationsComplementaires: "Aucune"
    },
    {
      id: generateUUID(),
      typologie: "Adulte",
      categorieFamille: "Pass 1 Jour",
      tarif: "Early Bird",
      codeBarres: 4739201928472,
      composte: 1,
      dateCommande: "2026-05-12",
      heureCommande: "09:15",
      datePaiement: "2026-05-12",
      heurePaiement: "09:17",
      nCommande: "CMD-2026-002",
      nCommandeAvance: "CMD-ADV-002",
      nBillet: "TKT-002",
      devise: "EUR",
      supprime: 0,
      origine: "Site Web",
      statutBillet: "Payé",
      ticketsNumber: "2",
      origineMarketing: "Newsletter",
      createdAt: now,
      prixPublic: 60.00,
      totalFrais: 2.00,
      codeReduction: "",
      reduction: 0.00,
      ttcPrixPaye: 62.00,
      commission: 2.50,
      ttcPrixSansCommission: 59.50,
      htPrixPaye: 51.67,
      tauxTaxe: "20%",
      taxe: 10.33,
      nomAcheteur: "Martin",
      prenomAcheteur: "Sophie",
      emailAcheteur: "sophie.martin@example.com",
      mobileAcheteur: "+33698765432",
      consentement: "Non",
      langueAcheteur: "fr_FR",
      nomParticipant: "Martin",
      prenomParticipant: "Sophie",
      emailParticipant: "sophie.martin@example.com",
      civiliteParticipant: "Mme",
      dateNaissanceParticipant: "22/11/1993",
      telephoneParticipant: "+33698765432",
      villeParticipant: "Lyon",
      paysParticipant: "France",
      dateNuiteeSupplementaire: "2026-07-11",
      referenceFullPass: "",
      factureSociete: "Martin Consulting",
      factureTva: "FR123456789",
      factureAdresse: "45 Avenue des Alpes",
      factureCodePostal: "69003",
      factureVille: "Lyon",
      facturePays: "France",
      informationsComplementaires: "Facture professionnelle"
    },
    {
      id: generateUUID(),
      typologie: "VIP",
      categorieFamille: "Pass 3 Jours",
      tarif: "Plein Tarif",
      codeBarres: 8293810293847,
      composte: 0,
      dateCommande: "2026-05-14",
      heureCommande: "18:22",
      datePaiement: "2026-05-14",
      heurePaiement: "18:25",
      nCommande: "CMD-2026-003",
      nCommandeAvance: "CMD-ADV-003",
      nBillet: "TKT-003",
      devise: "EUR",
      supprime: 0,
      origine: "Partenaire",
      statutBillet: "Payé",
      ticketsNumber: "3",
      origineMarketing: "Direct",
      createdAt: now,
      prixPublic: 300.00,
      totalFrais: 10.00,
      codeReduction: "VIPSPONSOR",
      reduction: 100.00,
      ttcPrixPaye: 210.00,
      commission: 8.00,
      ttcPrixSansCommission: 202.00,
      htPrixPaye: 175.00,
      tauxTaxe: "20%",
      taxe: 35.00,
      nomAcheteur: "Bernard",
      prenomAcheteur: "Thomas",
      emailAcheteur: "t.bernard@corporate.com",
      mobileAcheteur: "+33711223344",
      consentement: "Oui",
      langueAcheteur: "en_US",
      nomParticipant: "Bernard",
      prenomParticipant: "Thomas",
      emailParticipant: "t.bernard@corporate.com",
      civiliteParticipant: "M.",
      dateNaissanceParticipant: "05/04/1985",
      telephoneParticipant: "+33711223344",
      villeParticipant: "Geneva",
      paysParticipant: "Switzerland",
      dateNuiteeSupplementaire: "",
      referenceFullPass: "FP-BERNARD-003",
      factureSociete: "Corporate SA",
      factureTva: "CHE-123.456.789 MWST",
      factureAdresse: "Rue de Lausanne 12",
      factureCodePostal: "1201",
      factureVille: "Geneva",
      facturePays: "Switzerland",
      informationsComplementaires: "Envoi par mail à la comptabilité"
    },
    {
      id: generateUUID(),
      typologie: "Etudiant",
      categorieFamille: "Pass 1 Jour",
      tarif: "Tarif Réduit",
      codeBarres: 9302938472910,
      composte: 0,
      dateCommande: "2026-05-15",
      heureCommande: "11:00",
      datePaiement: "2026-05-15",
      heurePaiement: "11:02",
      nCommande: "CMD-2026-004",
      nCommandeAvance: "CMD-ADV-004",
      nBillet: "TKT-004",
      devise: "EUR",
      supprime: 1,
      origine: "Guichet",
      statutBillet: "Remboursé",
      ticketsNumber: "4",
      origineMarketing: "Affiche",
      createdAt: now,
      prixPublic: 45.00,
      totalFrais: 1.50,
      codeReduction: "",
      reduction: 0.00,
      ttcPrixPaye: 0.00,
      commission: 0.00,
      ttcPrixSansCommission: 0.00,
      htPrixPaye: 0.00,
      tauxTaxe: "20%",
      taxe: 0.00,
      nomAcheteur: "Petit",
      prenomAcheteur: "Lucas",
      emailAcheteur: "lucas.petit@student.univ.fr",
      mobileAcheteur: "+33655443322",
      consentement: "Oui",
      langueAcheteur: "fr_FR",
      nomParticipant: "Petit",
      prenomParticipant: "Lucas",
      emailParticipant: "lucas.petit@student.univ.fr",
      civiliteParticipant: "M.",
      dateNaissanceParticipant: "12/12/2002",
      telephoneParticipant: "+33655443322",
      villeParticipant: "Marseille",
      paysParticipant: "France",
      dateNuiteeSupplementaire: "",
      referenceFullPass: "",
      factureSociete: "",
      factureTva: "",
      factureAdresse: "5 Rue des Écoles",
      factureCodePostal: "13001",
      factureVille: "Marseille",
      facturePays: "France",
      informationsComplementaires: ""
    }
  ];
}

// Zustand Ticket Store
const useTicketStore = create((set, get) => ({
  tickets: [],
  loading: true,

  // Add a ticket
  addTicket: async (ticket) => {
    const newId = generateUUID();
    const now = new Date().toISOString();
    const fullTicket = {
      id: newId,
      createdAt: now,
      ...ticket,
      // Ensure pricing fields are floats/decimals
      prixPublic: Number(ticket.prixPublic || 0),
      totalFrais: Number(ticket.totalFrais || 0),
      reduction: Number(ticket.reduction || 0),
      ttcPrixPaye: Number(ticket.ttcPrixPaye || 0),
      commission: Number(ticket.commission || 0),
      ttcPrixSansCommission: Number(ticket.ttcPrixSansCommission || 0),
      htPrixPaye: Number(ticket.htPrixPaye || 0),
      taxe: Number(ticket.taxe || 0),
      // Ensure booleans are stored as 0 or 1
      composte: Number(ticket.composte ?? 0) === 1 ? 1 : 0,
      supprime: Number(ticket.supprime ?? 0) === 1 ? 1 : 0,
      codeBarres: Number(ticket.codeBarres || 0),
    };
    await set(ref(db, `tickets/${newId}`), fullTicket);
  },

  // Update a ticket
  updateTicket: async (id, data) => {
    const formattedData = { ...data };
    // Format pricing fields if they are updated
    if ('prixPublic' in formattedData) formattedData.prixPublic = Number(formattedData.prixPublic || 0);
    if ('totalFrais' in formattedData) formattedData.totalFrais = Number(formattedData.totalFrais || 0);
    if ('reduction' in formattedData) formattedData.reduction = Number(formattedData.reduction || 0);
    if ('ttcPrixPaye' in formattedData) formattedData.ttcPrixPaye = Number(formattedData.ttcPrixPaye || 0);
    if ('commission' in formattedData) formattedData.commission = Number(formattedData.commission || 0);
    if ('ttcPrixSansCommission' in formattedData) formattedData.ttcPrixSansCommission = Number(formattedData.ttcPrixSansCommission || 0);
    if ('htPrixPaye' in formattedData) formattedData.htPrixPaye = Number(formattedData.htPrixPaye || 0);
    if ('taxe' in formattedData) formattedData.taxe = Number(formattedData.taxe || 0);
    
    // Format numbers
    if ('composte' in formattedData) formattedData.composte = Number(formattedData.composte) === 1 ? 1 : 0;
    if ('supprime' in formattedData) formattedData.supprime = Number(formattedData.supprime) === 1 ? 1 : 0;
    if ('codeBarres' in formattedData) formattedData.codeBarres = Number(formattedData.codeBarres || 0);

    await update(ref(db, `tickets/${id}`), formattedData);
  },

  // Delete a ticket completely
  deleteTicket: async (id) => {
    await remove(ref(db, `tickets/${id}`));
  },

  // Soft delete a ticket (mark as supprime = 1)
  softDeleteTicket: async (id) => {
    await update(ref(db, `tickets/${id}`), { supprime: 1 });
  },

  // Restore a soft-deleted ticket (mark as supprime = 0)
  restoreTicket: async (id) => {
    await update(ref(db, `tickets/${id}`), { supprime: 0 });
  },

  // Toggle composte status
  toggleCompost: async (id, currentVal) => {
    await update(ref(db, `tickets/${id}`), { composte: currentVal === 1 ? 0 : 1 });
  },

  // Bulk upload tickets in chunked updates
  bulkUploadTickets: async (ticketsArray, deleteFirst, onProgress) => {
    if (deleteFirst) {
      await remove(ref(db, 'tickets'));
    }

    const CHUNK_SIZE = 400;
    const total = ticketsArray.length;
    let uploadedCount = 0;

    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = ticketsArray.slice(i, i + CHUNK_SIZE);
      const updates = {};

      chunk.forEach((ticket) => {
        updates[`tickets/${ticket.id}`] = ticket;
      });

      await update(ref(db), updates);
      uploadedCount += chunk.length;

      if (onProgress) {
        onProgress(uploadedCount);
      }
    }
  },

  // Stats calculation
  getStats: () => {
    const { tickets } = get();
    const activeTickets = tickets.filter(t => t.supprime !== 1);
    const deletedTickets = tickets.filter(t => t.supprime === 1);
    
    const totalRevenue = activeTickets.reduce((sum, t) => sum + (Number(t.ttcPrixPaye) || 0), 0);
    const totalFees = activeTickets.reduce((sum, t) => sum + (Number(t.totalFrais) || 0), 0);
    const totalCommission = activeTickets.reduce((sum, t) => sum + (Number(t.commission) || 0), 0);
    const totalTax = activeTickets.reduce((sum, t) => sum + (Number(t.taxe) || 0), 0);
    const compostedCount = activeTickets.filter(t => t.composte === 1).length;

    return {
      totalTickets: tickets.length,
      activeTicketsCount: activeTickets.length,
      deletedTicketsCount: deletedTickets.length,
      compostedCount,
      compostRate: activeTickets.length > 0 ? (compostedCount / activeTickets.length) * 100 : 0,
      totalRevenue,
      totalFees,
      totalCommission,
      totalTax
    };
  }
}));

// Listen to Firebase and sync changes to Zustand
const ticketsRef = ref(db, 'tickets');
onValue(ticketsRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    useTicketStore.setState({ tickets: [], loading: false });
  } else {
    // Map objects back to arrays and normalize for UI
    const tickets = Object.values(data).map(normalizeTicketForUI);
    useTicketStore.setState({ tickets, loading: false });
  }
}, (error) => {
  console.error("Firebase subscription error:", error);
  useTicketStore.setState({ loading: false });
});

export { useTicketStore };
export default useTicketStore;
