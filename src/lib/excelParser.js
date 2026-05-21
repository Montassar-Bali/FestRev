import ExcelJS from 'exceljs';

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

// Mapping of potential Excel headers (case-insensitive, trimmed) to our schema fields
export const EXCEL_MAPPING = {
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
  "n. de commande": "nCommande",
  "n_ de commande": "nCommande",
  "ndecommande": "nCommande",
  "ncommandeavance": "nCommandeAvance",
  "n. de commande avancé": "nCommandeAvance",
  "n_ de commande avancé": "nCommandeAvance",
  "ndecommandeavance": "nCommandeAvance",
  "nbillet": "nBillet",
  "num billet": "nBillet",
  "numéro billet": "nBillet",
  "n° billet": "nBillet",
  "n. billet": "nBillet",
  "n_ billet": "nBillet",
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
  "commentaire": "informationsComplementaires",
  
  // Singular direct fields (fallback/single ticket holder info)
  "nom": "nomParticipant",
  "prénom": "prenomParticipant",
  "prenom": "prenomParticipant",
  "email": "emailParticipant",
  "e-mail": "emailParticipant",
  "téléphone": "telephoneParticipant",
  "telephone": "telephoneParticipant",
  "tél": "telephoneParticipant",
  "tel": "telephoneParticipant",
  "ville": "villeParticipant",
  "pays": "paysParticipant",
  "date de naissance": "dateNaissanceParticipant",
  "date naissance": "dateNaissanceParticipant",
  
  // Explicit mappings for standard French headers matching the Excel file
  "taxe (pour vos déclarations fiscales)": "taxe",
  "consentement (opt-in rgpd)": "consentement",
  "date de la nuitée supplementaire": "dateNuiteeSupplementaire",
  "référence du full pass": "referenceFullPass",
  "date de naissance participant": "dateNaissanceParticipant",
  "facture - société": "factureSociete",
  "facture - n° tva intracomm": "factureTva",
  "facture - adresse": "factureAdresse",
  "facture - code postal": "factureCodePostal",
  "facture - ville": "factureVille",
  "facture - pays": "facturePays",
  "informations complémentaires": "informationsComplementaires",
  "origine (marketing)": "origineMarketing"
};

export const CSV_MAPPING = EXCEL_MAPPING; // Backward compatibility

// Helper function to standardize keys by converting to lowercase, removing accents and non-alphanumeric chars
export function standardizeKey(key) {
  if (!key) return '';
  return String(key)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Build standard mapping lookup at runtime
export const STANDARDIZED_MAPPING = {};
Object.keys(EXCEL_MAPPING).forEach(key => {
  STANDARDIZED_MAPPING[standardizeKey(key)] = EXCEL_MAPPING[key];
});

// Sanitizes Firebase Realtime Database keys to remove illegal characters (., $, #, [, ], /)
export function sanitizeFirebaseKey(key) {
  return String(key)
    .replace(/[\.\$\[\]\#\/]/g, '_')
    .trim();
}

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

// Main parsing and normalization function for Excel
export async function parseAndNormalizeExcel(file) {
  if (!file) {
    throw new Error("Aucun fichier fourni.");
  }
  
  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    throw new Error("Impossible de lire le fichier sous forme de mémoire tampon.");
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch (err) {
    console.error("ExcelJS read error:", err);
    if (file.name.endsWith('.xls')) {
      throw new Error("Les fichiers au format Excel 97-2003 (.xls) ne sont pas pris en charge directement. Veuillez réenregistrer le fichier au format Excel moderne (.xlsx) avant de l'importer.");
    }
    throw new Error("Impossible de charger le fichier Excel. Assurez-vous qu'il s'agit d'un fichier .xlsx valide.");
  }

  // Get first worksheet
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Le fichier Excel ne contient aucune feuille de calcul.");
  }

  const rowCount = worksheet.rowCount;
  if (rowCount < 1) {
    throw new Error("La feuille de calcul est vide.");
  }

  const columnCount = worksheet.columnCount;

  // Helper to extract values from a row
  function extractRowValues(row, colCount) {
    const vals = [];
    let isRowEmpty = true;
    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c);
      let cellText = '';
      if (cell.value !== null && cell.value !== undefined) {
        if (cell.value instanceof Date) {
          const d = cell.value;
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          cellText = `${year}-${month}-${day}`;
        } else if (typeof cell.value === 'object') {
          if (cell.value.richText) {
            cellText = cell.value.richText.map(t => t.text).join('');
          } else if (cell.value.result !== undefined) {
            cellText = String(cell.value.result);
          } else if (cell.value.text !== undefined) {
            cellText = String(cell.value.text);
          } else {
            cellText = String(cell.value);
          }
        } else {
          cellText = String(cell.value);
        }
      }
      const trimmed = cellText.trim();
      if (trimmed !== '') {
        isRowEmpty = false;
      }
      vals.push(trimmed);
    }
    return { vals, isRowEmpty };
  }

  // Extract values for Row 1 and Row 2 to determine headers
  const row1Data = extractRowValues(worksheet.getRow(1), columnCount);
  const row2Data = rowCount >= 2 ? extractRowValues(worksheet.getRow(2), columnCount) : { vals: [], isRowEmpty: true };

  // Helper to check if a row looks like a header row
  function looksLikeHeaderRow(rowValues) {
    const keywords = ['typologie', 'commande', 'acheteur', 'participant', 'billet', 'tarif', 'prix', 'code', 'date', 'heure'];
    let score = 0;
    rowValues.forEach(val => {
      if (!val) return;
      const valLower = String(val).toLowerCase();
      if (keywords.some(kw => valLower.includes(kw))) {
        score++;
      }
    });
    return score >= 3;
  }

  let rawHeaders = row1Data.vals;
  let startDataRowIndex = 2;

  if (rowCount >= 2 && !looksLikeHeaderRow(row1Data.vals) && looksLikeHeaderRow(row2Data.vals)) {
    rawHeaders = row2Data.vals;
    startDataRowIndex = 3;
    console.log("Dynamic Header Detection: Row 2 identified as header row.");
  } else {
    console.log("Dynamic Header Detection: Row 1 identified as header row.");
  }

  // Parse row values
  const parsedRows = [];
  for (let r = startDataRowIndex; r <= rowCount; r++) {
    const { vals, isRowEmpty } = extractRowValues(worksheet.getRow(r), columnCount);
    if (!isRowEmpty) {
      parsedRows.push(vals);
    }
  }

  if (parsedRows.length === 0) {
    throw new Error("Le fichier Excel ne contient aucune ligne de données sous l'en-tête.");
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

  // Map row arrays to raw ticket objects matching the Excel exactly
  const tickets = rows.map((row) => {
    const ticket = {};
    let foundId = '';
    
    headers.forEach((header, colIdx) => {
      if (!header) return;

      const rawVal = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : '';
      
      const safeRawKey = sanitizeFirebaseKey(header);
      if (safeRawKey) {
        ticket[safeRawKey] = rawVal;
      }
      
      const normalizedHeader = String(header).toLowerCase();
      const schemaKey = EXCEL_MAPPING[normalizedHeader];
      if (schemaKey === 'id' && rawVal) {
        foundId = rawVal;
      }
    });
    
    ticket.id = foundId || generateUUID();
    
    const hasCreatedAt = Object.keys(ticket).some(k => k.toLowerCase() === 'createdat');
    if (!hasCreatedAt) {
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

// Normalize a raw database ticket object into a clean, fully populated schema-compliant object for UI usage
export function normalizeTicketForUI(ticket) {
  if (!ticket) return null;
  
  const normalized = { ...ticket };
  
  Object.keys(ticket).forEach(key => {
    const stdKey = standardizeKey(key);
    const schemaKey = STANDARDIZED_MAPPING[stdKey];
    if (schemaKey && normalized[schemaKey] === undefined) {
      normalized[schemaKey] = ticket[key];
    }
  });
  
  PRICING_KEYS.forEach(key => {
    if (normalized[key] !== undefined && normalized[key] !== null) {
      normalized[key] = parseEuroFloat(normalized[key]);
    } else {
      normalized[key] = 0;
    }
  });
  
  const rawComposte = normalized.composte;
  if (rawComposte !== undefined && rawComposte !== null) {
    const valStr = String(rawComposte).toLowerCase().trim();
    normalized.composte = (valStr === '1' || valStr === 'oui' || valStr === 'yes' || valStr === 'true') ? 1 : 0;
  } else {
    normalized.composte = 0;
  }
  
  const rawSupprime = normalized.supprime;
  if (rawSupprime !== undefined && rawSupprime !== null) {
    const valStr = String(rawSupprime).toLowerCase().trim();
    normalized.supprime = (valStr === '1' || valStr === 'oui' || valStr === 'yes' || valStr === 'true') ? 1 : 0;
  } else {
    normalized.supprime = 0;
  }
  
  if (normalized.codeBarres !== undefined && normalized.codeBarres !== null && normalized.codeBarres !== '') {
    const valClean = String(normalized.codeBarres).replace(/\s/g, '');
    const intVal = parseInt(valClean, 10);
    normalized.codeBarres = isNaN(intVal) ? 0 : intVal;
  } else {
    normalized.codeBarres = 0;
  }
  
  if (normalized.dateCommande) normalized.dateCommande = normalizeDate(normalized.dateCommande);
  if (normalized.datePaiement) normalized.datePaiement = normalizeDate(normalized.datePaiement);
  
  if (!normalized.nomAcheteur && normalized.nomParticipant) normalized.nomAcheteur = normalized.nomParticipant;
  if (!normalized.prenomAcheteur && normalized.prenomParticipant) normalized.prenomAcheteur = normalized.prenomParticipant;
  if (!normalized.emailAcheteur && normalized.emailParticipant) normalized.emailAcheteur = normalized.emailParticipant;
  if (!normalized.mobileAcheteur && normalized.telephoneParticipant) normalized.mobileAcheteur = normalized.telephoneParticipant;
  
  if (!normalized.nomParticipant && normalized.nomAcheteur) normalized.nomParticipant = normalized.nomAcheteur;
  if (!normalized.prenomParticipant && normalized.prenomAcheteur) normalized.prenomParticipant = normalized.prenomAcheteur;
  if (!normalized.emailParticipant && normalized.emailAcheteur) normalized.emailParticipant = normalized.emailAcheteur;
  if (!normalized.telephoneParticipant && normalized.mobileAcheteur) normalized.telephoneParticipant = normalized.mobileAcheteur;
  
  if (!normalized.devise) normalized.devise = 'EUR';
  if (!normalized.id) normalized.id = ticket.id || generateUUID();
  
  return normalized;
}
