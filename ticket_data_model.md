# Ticket Data Model & Schema Definition

This document outlines the data model and schema definition for the `tickets` collection in the FestRev platform.

---

## Schema Structure

### Section 1: Order & Ticket Details

| Field Name | Type | Format / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | UUID | Unique identifier for the ticket |
| `typologie` | String | — | Type of ticket / attendee |
| `categorieFamille` | String | — | Category or Family |
| `tarif` | String | — | Name of the fare / tariff |
| `codeBarres` | Number | Integer | Barcode number |
| `composte` | Number | `0` or `1` (Boolean flag) | Whether the ticket has been scanned/checked in |
| `dateCommande` | String | `YYYY-MM-DD` | Order date |
| `heureCommande` | String | `HH:MM` | Order time |
| `datePaiement` | String | `YYYY-MM-DD` | Payment date |
| `heurePaiement` | String | `HH:MM` | Payment time |
| `nCommande` | String | — | Order number |
| `nCommandeAvance` | String | — | Advanced order number |
| `nBillet` | String | — | Ticket number |
| `devise` | String | Default: `"EUR"` | Currency code |
| `supprime` | Number | `0` or `1` (Boolean flag) | Deletion status flag |
| `origine` | String | — | Origin of the sale |
| `statutBillet` | String | e.g., `"Payé"` | Status of the ticket |
| `ticketsNumber` | String | — | Secondary ticket identifier |
| `origineMarketing` | String | — | Marketing channel/origin |
| `createdAt` | String | ISO 8601 Timestamp | Record creation timestamp |

### Section 2: Pricing & Finance

| Field Name | Type | Format / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `prixPublic` | Number | Float / Decimal | Public price of the ticket |
| `totalFrais` | Number | Float / Decimal | Total ticketing fees |
| `codeReduction` | String | — | Promo/discount code |
| `reduction` | Number \| String | Float or String | Applied discount value or details |
| `ttcPrixPaye` | Number | Float / Decimal | Final paid price (including tax) |
| `commission` | Number | Float / Decimal | Ticket platform commission |
| `ttcPrixSansCommission` | Number | Float / Decimal | Paid price minus commission |
| `htPrixPaye` | Number | Float / Decimal | Pre-tax paid price |
| `tauxTaxe` | String | e.g., `"20%"` | Tax rate percentage |
| `taxe` | Number | Float / Decimal | Tax amount (for financial declarations) |

### Section 3: Buyer Information (Acheteur)

| Field Name | Type | Format / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `nomAcheteur` | String | — | Buyer's last name |
| `prenomAcheteur` | String | — | Buyer's first name |
| `emailAcheteur` | String | Email validation | Buyer's email address |
| `mobileAcheteur` | String | — | Buyer's mobile phone number |
| `consentement` | String | Opt-in RGPD | GDPR marketing consent status |
| `langueAcheteur` | String | e.g., `"fr_FR"` | Language preference of the buyer |

### Section 4: Participant Information

| Field Name | Type | Format / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `nomParticipant` | String | — | Participant's last name |
| `prenomParticipant` | String | — | Participant's first name |
| `emailParticipant` | String | Email validation | Participant's email address |
| `civiliteParticipant` | String | e.g., `"M.", "Mme"` | Honorific / gender title |
| `dateNaissanceParticipant` | String | `DD/MM/YYYY` | Participant's date of birth |
| `telephoneParticipant` | String | — | Participant's phone number |
| `villeParticipant` | String | — | Participant's city |
| `paysParticipant` | String | — | Participant's country |
| `dateNuiteeSupplementaire` | String | — | Dates for extra night bookings |
| `referenceFullPass` | String | — | Full pass package reference |

### Section 5: Invoicing (Facture)

| Field Name | Type | Format / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `factureSociete` | String | — | Invoice company name |
| `factureTva` | String | — | Intra-community VAT number |
| `factureAdresse` | String | — | Invoice street address |
| `factureCodePostal` | String | — | Invoice postal code |
| `factureVille` | String | — | Invoice city |
| `facturePays` | String | — | Invoice country |
| `informationsComplementaires` | String | — | Additional invoicing notes/comments |
