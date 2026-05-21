// CSV Parsing and Normalization Utility for FestRev

// Schema keys list
export const SCHEMA_KEYS = [
  'id', 'typologie', 'categorieFamille', 'tarif', 'codeBarres', 'composte',
  'dateCommande', 'heureCommande', 'datePaiement', 'heurePaiement', 'nCommande',
  'nCommandeAvance', 'nBillet', 'devise', 'supprime', 'origine', 'statutBillet',
  'ticketsNumber', 'origineMarketing', 'createdAt',
  
  'prixPublic', 'totalFrais', 'codeReduction', 'reduction', 'ttcPrixPaye',
  'commission', 'ttcPrixSansCommission', 'htPrixPaye', 'tauxTaxe', 'taxe',
  
  'nomAcheteur', 'prenomAcheteur', 'emailAcheteur', 'mobileAcheteur',
  'consentement', 'langueAcheteur',
  
  'nomParticipant', 'prenomParticipant', 'emailParticipant', 'civiliteParticipant',
  'dateNaissanceParticipant', 'telephoneParticipant', 'villeParticipant', 'paysParticipant',
  'dateNuiteeSupplementaire', 'referenceFullPass',
  
  'factureSociete', 'factureTva', 'factureAdresse', 'factureCodePostal',
  'factureVille', 'facturePays', 'informationsComplementaires'
];

export const PRICING_KEYS = [
  'prixPublic', 'totalFrais', 'reduction', 'ttcPrixPaye', 'commission',
  'ttcPrixSansCommission', 'htPrixPaye', 'taxe'
];

// Mapping of potential CSV headers (case-insensitive, trimmed) to our schema fields
export const CSV_MAPPING = {
  // Section 1: Order & Ticket Details
  "id": "id",
  "ticket id": "id",
  "uuid": "id",
  "typologie": "typologie",
  "typologie client": "typologie",
  "type client": "typologie",
  "categoriefamille": "categorieFamille",
  "categorie famille": "categorieFamille",
  "catégorie famille": "categorieFamille",
  "categorie": "categorieFamille",
  "catégorie": "categorieFamille",
  "famille": "categorieFamille",
  "tarif": "tarif",
  "nom du tarif": "tarif",
  "codebarres": "codeBarres",
  "code-barres": "codeBarres",
  "code barres": "codeBarres",
  "composte": "composte",
  "scanne": "composte",
  "scanné": "composte",
  "composté": "composte",
  "datecommande": "dateCommande",
  "date de commande": "dateCommande",
  "heurecommande": "heureCommande",
  "heure de commande": "heureCommande",
  "datepaiement": "datePaiement",
  "date de paiement": "datePaiement",
  "heurepaiement": "heurePaiement",
  "heure de paiement": "heurePaiement",
  "ncommande": "nCommande",
  "numcommande": "nCommande",
  "numero de commande": "nCommande",
  "numéro de commande": "nCommande",
  "ncommandeavance": "nCommandeAvance",
  "nbillet": "nBillet",
  "num billet": "nBillet",
  "numéro billet": "nBillet",
  "n° billet": "nBillet",
  "devise": "devise",
  "supprime": "supprime",
  "supprimé": "supprime",
  "origine": "origine",
  "origine de la vente": "origine",
  "statutbillet": "statutBillet",
  "statut du billet": "statutBillet",
  "statut": "statutBillet",
  "ticketsnumber": "ticketsNumber",
  "tickets number": "ticketsNumber",
  "numéro ticket": "ticketsNumber",
  "originemarketing": "origineMarketing",
  "origine marketing": "origineMarketing",

  // Section 2: Pricing & Finance
  "prixpublic": "prixPublic",
  "prix public": "prixPublic",
  "prix": "prixPublic",
  "totalfrais": "totalFrais",
  "total frais": "totalFrais",
  "frais": "totalFrais",
  "frais de billetterie": "totalFrais",
  "codereduction": "codeReduction",
  "code reduction": "codeReduction",
  "code réduction": "codeReduction",
  "code promo": "codeReduction",
  "code de réduction": "codeReduction",
  "reduction": "reduction",
  "réduction": "reduction",
  "ttcprixpaye": "ttcPrixPaye",
  "prix paye": "ttcPrixPaye",
  "prix payé": "ttcPrixPaye",
  "prix payé ttc": "ttcPrixPaye",
  "ttc paye": "ttcPrixPaye",
  "commission": "commission",
  "commission plateforme": "commission",
  "ttcprixsanscommission": "ttcPrixSansCommission",
  "prix hors commission": "ttcPrixSansCommission",
  "htprixpaye": "htPrixPaye",
  "prix ht": "htPrixPaye",
  "montant ht": "htPrixPaye",
  "tauxtaxe": "tauxTaxe",
  "taux de taxe": "tauxTaxe",
  "tva": "tauxTaxe",
  "taux tva": "tauxTaxe",
  "taxe": "taxe",
  "montant taxe": "taxe",

  // Section 3: Buyer Information
  "nomacheteur": "nomAcheteur",
  "nom acheteur": "nomAcheteur",
  "nom de l'acheteur": "nomAcheteur",
  "prenomacheteur": "prenomAcheteur",
  "prénom acheteur": "prenomAcheteur",
  "prenom de l'acheteur": "prenomAcheteur",
  "prénom de l'acheteur": "prenomAcheteur",
  "emailacheteur": "emailAcheteur",
  "email acheteur": "emailAcheteur",
  "email de l'acheteur": "emailAcheteur",
  "mobileacheteur": "mobileAcheteur",
  "mobile acheteur": "mobileAcheteur",
  "téléphone acheteur": "mobileAcheteur",
  "telephone acheteur": "mobileAcheteur",
  "consentement": "consentement",
  "consentement rgpd": "consentement",
  "langueacheteur": "langueAcheteur",
  "langue acheteur": "langueAcheteur",

  // Section 4: Participant Information
  "nomparticipant": "nomParticipant",
  "nom participant": "nomParticipant",
  "prenomparticipant": "prenomParticipant",
  "prénom participant": "prenomParticipant",
  "emailparticipant": "emailParticipant",
  "email participant": "emailParticipant",
  "civiliteparticipant": "civiliteParticipant",
  "civilité participant": "civiliteParticipant",
  "civilité": "civiliteParticipant",
  "civilite": "civiliteParticipant",
  "datenaissanceparticipant": "dateNaissanceParticipant",
  "date naissance participant": "dateNaissanceParticipant",
  "date de naissance participant": "dateNaissanceParticipant",
  "telephoneparticipant": "telephoneParticipant",
  "telephone participant": "telephoneParticipant",
  "téléphone participant": "telephoneParticipant",
  "villeparticipant": "villeParticipant",
  "ville participant": "villeParticipant",
  "paysparticipant": "paysParticipant",
  "pays participant": "paysParticipant",
  "datenuiteesupplementaire": "dateNuiteeSupplementaire",
  "nuitée supplémentaire": "dateNuiteeSupplementaire",
  "date nuitee supplementaire": "dateNuiteeSupplementaire",
  "referencefullpass": "referenceFullPass",
  "référence full pass": "referenceFullPass",
  "ref full pass": "referenceFullPass",

  // Section 5: Invoicing
  "facturesociete": "factureSociete",
  "societe": "factureSociete",
  "société": "factureSociete",
  "facture tva": "factureTva",
  "facturetva": "factureTva",
  "tva intracommunautaire": "factureTva",
  "tva facture": "factureTva",
  "factureadresse": "factureAdresse",
  "facture adresse": "factureAdresse",
  "facturecodepostal": "factureCodePostal",
  "facture code postal": "factureCodePostal",
  "facture cp": "factureCodePostal",
  "factureville": "factureVille",
  "facture ville": "factureVille",
  "facturepays": "facturePays",
  "facture pays": "facturePays",
  "informationscomplementaires": "informationsComplementaires",
  "informations complémentaires": "informationsComplementaires",
  "notes": "informationsComplementaires",
  "commentaire": "informationsComplementaires"
};

// Generates UUID
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

// Convert European float formatting ("48,00" or "1 200,50") to standard float
export function parseEuroFloat(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  let str = String(val).trim();
  if (!str) return 0;
  
  // Remove spaces
  str = str.replace(/\s/g, '');
  
  const commaIndex = str.indexOf(',');
  const dotIndex = str.indexOf('.');
  
  if (commaIndex !== -1 && dotIndex !== -1) {
    if (commaIndex > dotIndex) {
      // European format: 1.200,50
      str = str.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // US format: 1,200.50
      str = str.replace(/,/g, '');
    }
  } else if (commaIndex !== -1) {
    // Only comma: 48,00
    str = str.replace(/,/g, '.');
  }
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Normalize date format from DD/MM/YYYY to YYYY-MM-DD
export function normalizeDate(str) {
  if (!str) return '';
  const trimmed = String(str).trim();
  
  // Check if DD/MM/YYYY or DD-MM-YYYY
  const dmyRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const match = trimmed.match(dmyRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  return trimmed;
}

// Parse a single CSV line with semicolon delimiter, respecting quote escapes
export function parseCSVLine(line, delimiter = ';') {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Main parsing and normalization function
export function parseAndNormalizeCSV(csvText) {
  // Split lines, filtering out totally empty lines
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l !== '');
  if (lines.length < 2) {
    throw new Error("Le fichier CSV doit contenir une ligne d'en-tête et au moins une ligne de données.");
  }
  
  // Read and clean raw headers (remove quote marks)
  const rawHeaders = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  
  // Parse rows
  const parsedRows = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
    // Pad values to match header length if needed
    while (rowValues.length < rawHeaders.length) {
      rowValues.push('');
    }
    parsedRows.push(rowValues);
  }
  
  // Identify columns that are completely empty in ALL rows
  const emptyColumnIndices = new Set();
  for (let colIndex = 0; colIndex < rawHeaders.length; colIndex++) {
    let isColumnEmpty = true;
    for (let rowIndex = 0; rowIndex < parsedRows.length; rowIndex++) {
      const val = parsedRows[rowIndex][colIndex];
      if (val !== undefined && val !== null && val !== '') {
        isColumnEmpty = false;
        break;
      }
    }
    if (isColumnEmpty) {
      emptyColumnIndices.add(colIndex);
    }
  }
  
  // Filter out empty columns from headers and row data
  const headers = rawHeaders.filter((_, idx) => !emptyColumnIndices.has(idx));
  const rows = parsedRows.map(row => row.filter((_, idx) => !emptyColumnIndices.has(idx)));
  
  // Map row arrays to ticket schema objects
  const tickets = rows.map((row) => {
    const ticket = {};
    
    // Set default schema settings
    ticket.devise = 'EUR';
    ticket.composte = 0;
    ticket.supprime = 0;
    
    headers.forEach((header, colIdx) => {
      const rawVal = row[colIdx];
      const normalizedHeader = String(header).toLowerCase();
      
      // Find corresponding database field
      const schemaKey = CSV_MAPPING[normalizedHeader];
      
      if (schemaKey) {
        if (PRICING_KEYS.includes(schemaKey)) {
          ticket[schemaKey] = parseEuroFloat(rawVal);
        } else if (schemaKey === 'codeBarres') {
          // Clean out spacing for integers like barcodes
          const valClean = String(rawVal).replace(/\s/g, '');
          const intVal = parseInt(valClean, 10);
          ticket[schemaKey] = isNaN(intVal) ? 0 : intVal;
        } else if (schemaKey === 'composte' || schemaKey === 'supprime') {
          const valStr = String(rawVal).toLowerCase();
          ticket[schemaKey] = (valStr === '1' || valStr === 'oui' || valStr === 'yes' || valStr === 'true') ? 1 : 0;
        } else if (['dateCommande', 'datePaiement'].includes(schemaKey)) {
          ticket[schemaKey] = normalizeDate(rawVal);
        } else {
          ticket[schemaKey] = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';
        }
      }
    });
    
    // Ensure vital columns are generated if missing
    if (!ticket.id) {
      ticket.id = generateUUID();
    }
    if (!ticket.createdAt) {
      ticket.createdAt = new Date().toISOString();
    }
    
    return ticket;
  });
  
  return {
    originalCount: parsedRows.length,
    filteredEmptyColumnsCount: emptyColumnIndices.size,
    removedColumns: rawHeaders.filter((_, idx) => emptyColumnIndices.has(idx)),
    tickets
  };
}
