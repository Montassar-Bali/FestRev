import { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Copy, Sparkles } from 'lucide-react';

const BOOT_COMP_OPTIONS = [
  { value: '0', label: 'Non (0)' },
  { value: '1', label: 'Oui (1)' }
];

const STATUT_BILLET_OPTIONS = [
  { value: 'Payé', label: 'Payé' },
  { value: 'Remboursé', label: 'Remboursé' },
  { value: 'En attente', label: 'En attente' }
];

const ORIGIN_OPTIONS = [
  { value: 'Site Web', label: 'Site Web' },
  { value: 'Guichet', label: 'Guichet' },
  { value: 'Partenaire', label: 'Partenaire' }
];

const CIVILITY_OPTIONS = [
  { value: 'M.', label: 'Monsieur (M.)' },
  { value: 'Mme', label: 'Madame (Mme)' },
  { value: 'Autre', label: 'Autre' }
];

export default function TicketForm({ ticket, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    // Section 1: Order & Ticket Details
    typologie: 'Adulte',
    categorieFamille: 'Pass 3 Jours',
    tarif: 'Plein Tarif',
    codeBarres: '',
    composte: 0,
    dateCommande: new Date().toISOString().split('T')[0],
    heureCommande: new Date().toTimeString().split(' ')[0].substring(0, 5),
    datePaiement: new Date().toISOString().split('T')[0],
    heurePaiement: new Date().toTimeString().split(' ')[0].substring(0, 5),
    nCommande: '',
    nCommandeAvance: '',
    nBillet: '',
    devise: 'EUR',
    supprime: 0,
    origine: 'Site Web',
    statutBillet: 'Payé',
    ticketsNumber: '',
    origineMarketing: '',

    // Section 2: Pricing & Finance
    prixPublic: 0,
    totalFrais: 0,
    codeReduction: '',
    reduction: 0,
    ttcPrixPaye: 0,
    commission: 0,
    ttcPrixSansCommission: 0,
    htPrixPaye: 0,
    tauxTaxe: '20%',
    taxe: 0,

    // Section 3: Buyer Info
    nomAcheteur: '',
    prenomAcheteur: '',
    emailAcheteur: '',
    mobileAcheteur: '',
    consentement: 'Oui',
    langueAcheteur: 'fr_FR',

    // Section 4: Participant Info
    nomParticipant: '',
    prenomParticipant: '',
    emailParticipant: '',
    civiliteParticipant: 'M.',
    dateNaissanceParticipant: '',
    telephoneParticipant: '',
    villeParticipant: '',
    paysParticipant: '',
    dateNuiteeSupplementaire: '',
    referenceFullPass: '',

    // Section 5: Invoicing
    factureSociete: '',
    factureTva: '',
    factureAdresse: '',
    factureCodePostal: '',
    factureVille: '',
    facturePays: '',
    informationsComplementaires: '',

    ...ticket
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculations for Pricing section if relevant fields change
      if (['prixPublic', 'totalFrais', 'reduction', 'commission'].includes(field)) {
        const prixPublic = Number(updated.prixPublic) || 0;
        const totalFrais = Number(updated.totalFrais) || 0;
        const reduction = Number(updated.reduction) || 0;
        const commission = Number(updated.commission) || 0;

        // Auto compute paid price
        const ttcPrixPaye = Math.max(0, prixPublic + totalFrais - reduction);
        updated.ttcPrixPaye = parseFloat(ttcPrixPaye.toFixed(2));
        
        // Auto compute price sans commission
        updated.ttcPrixSansCommission = parseFloat(Math.max(0, ttcPrixPaye - commission).toFixed(2));

        // Auto compute tax details (assuming standard 20% for auto-fills, editable later)
        const taxRate = parseFloat(updated.tauxTaxe) || 20;
        const htPrixPaye = ttcPrixPaye / (1 + taxRate / 100);
        updated.htPrixPaye = parseFloat(htPrixPaye.toFixed(2));
        updated.taxe = parseFloat((ttcPrixPaye - htPrixPaye).toFixed(2));
      }
      return updated;
    });

    // Clear error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const copyBuyerToParticipant = () => {
    setForm((prev) => ({
      ...prev,
      nomParticipant: prev.nomAcheteur,
      prenomParticipant: prev.prenomAcheteur,
      emailParticipant: prev.emailAcheteur,
      telephoneParticipant: prev.mobileAcheteur,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email Acheteur
    if (!form.emailAcheteur) {
      newErrors.emailAcheteur = "L'adresse email de l'acheteur est requise";
    } else if (!emailRegex.test(form.emailAcheteur)) {
      newErrors.emailAcheteur = "Format d'email invalide";
    }

    // Email Participant
    if (!form.emailParticipant) {
      newErrors.emailParticipant = "L'adresse email du participant est requise";
    } else if (!emailRegex.test(form.emailParticipant)) {
      newErrors.emailParticipant = "Format d'email invalide";
    }

    // Command/Ticket essentials
    if (!form.nCommande) newErrors.nCommande = "Le numéro de commande est requis";
    if (!form.nBillet) newErrors.nBillet = "Le numéro de billet est requis";
    if (!form.codeBarres) newErrors.codeBarres = "Le code-barres est requis";

    // Decimals validations (non-negative)
    const pricingFields = ['prixPublic', 'totalFrais', 'reduction', 'ttcPrixPaye', 'commission', 'ttcPrixSansCommission', 'htPrixPaye', 'taxe'];
    pricingFields.forEach(f => {
      if (Number(form[f]) < 0) {
        newErrors[f] = "Le montant ne peut pas être négatif";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    } else {
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(`ticket-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <form id="ticket-form" onSubmit={handleSubmit} className="ticket-form-container">
      <div className="flex-col gap-8">
        
        {/* SECTION 1: Order & Ticket Details */}
        <div className="form-section-card">
          <div className="section-header-styled">
            <span className="section-number">1</span>
            <h3 className="section-title-styled">Détails de la Commande & du Billet</h3>
          </div>
          <div className="form-grid-3">
            <Input
              id="ticket-nCommande"
              label="Numéro de Commande"
              required
              value={form.nCommande}
              onChange={(e) => updateField('nCommande', e.target.value)}
              error={errors.nCommande}
              placeholder="Ex: CMD-10293"
            />
            <Input
              id="ticket-nCommandeAvance"
              label="Numéro Commande Avancé"
              value={form.nCommandeAvance}
              onChange={(e) => updateField('nCommandeAvance', e.target.value)}
              placeholder="Ex: ADV-10293"
            />
            <Input
              id="ticket-nBillet"
              label="Numéro de Billet"
              required
              value={form.nBillet}
              onChange={(e) => updateField('nBillet', e.target.value)}
              error={errors.nBillet}
              placeholder="Ex: TKT-82931"
            />
          </div>

          <div className="form-grid-3">
            <Input
              id="ticket-typologie"
              label="Typologie"
              required
              value={form.typologie}
              onChange={(e) => updateField('typologie', e.target.value)}
              placeholder="Ex: Adulte, Enfant, VIP"
            />
            <Input
              id="ticket-categorieFamille"
              label="Catégorie / Famille"
              required
              value={form.categorieFamille}
              onChange={(e) => updateField('categorieFamille', e.target.value)}
              placeholder="Ex: Pass 3 Jours"
            />
            <Input
              id="ticket-tarif"
              label="Tarif"
              required
              value={form.tarif}
              onChange={(e) => updateField('tarif', e.target.value)}
              placeholder="Ex: Early Bird, Réduit"
            />
          </div>

          <div className="form-grid-3">
            <Input
              id="ticket-codeBarres"
              label="Code-barres"
              type="number"
              required
              value={form.codeBarres}
              onChange={(e) => updateField('codeBarres', e.target.value)}
              error={errors.codeBarres}
              placeholder="Ex: 382910293"
            />
            <Select
              id="ticket-composte"
              label="Billet Composté / Scanné"
              options={BOOT_COMP_OPTIONS}
              value={String(form.composte)}
              onChange={(e) => updateField('composte', Number(e.target.value))}
            />
            <Select
              id="ticket-supprime"
              label="Billet Supprimé"
              options={BOOT_COMP_OPTIONS}
              value={String(form.supprime)}
              onChange={(e) => updateField('supprime', Number(e.target.value))}
            />
          </div>

          <div className="form-grid-4">
            <Input
              id="ticket-dateCommande"
              label="Date Commande"
              type="date"
              value={form.dateCommande}
              onChange={(e) => updateField('dateCommande', e.target.value)}
            />
            <Input
              id="ticket-heureCommande"
              label="Heure Commande"
              type="time"
              value={form.heureCommande}
              onChange={(e) => updateField('heureCommande', e.target.value)}
            />
            <Input
              id="ticket-datePaiement"
              label="Date Paiement"
              type="date"
              value={form.datePaiement}
              onChange={(e) => updateField('datePaiement', e.target.value)}
            />
            <Input
              id="ticket-heurePaiement"
              label="Heure Paiement"
              type="time"
              value={form.heurePaiement}
              onChange={(e) => updateField('heurePaiement', e.target.value)}
            />
          </div>

          <div className="form-grid-4">
            <Select
              id="ticket-origine"
              label="Origine de la vente"
              options={ORIGIN_OPTIONS}
              value={form.origine}
              onChange={(e) => updateField('origine', e.target.value)}
            />
            <Select
              id="ticket-statutBillet"
              label="Statut du billet"
              options={STATUT_BILLET_OPTIONS}
              value={form.statutBillet}
              onChange={(e) => updateField('statutBillet', e.target.value)}
            />
            <Input
              id="ticket-ticketsNumber"
              label="Tickets Number"
              value={form.ticketsNumber}
              onChange={(e) => updateField('ticketsNumber', e.target.value)}
              placeholder="ID secondaire"
            />
            <Input
              id="ticket-origineMarketing"
              label="Origine Marketing"
              value={form.origineMarketing}
              onChange={(e) => updateField('origineMarketing', e.target.value)}
              placeholder="Ex: Google Ads"
            />
          </div>
        </div>

        {/* SECTION 2: Pricing & Finance */}
        <div className="form-section-card">
          <div className="section-header-styled">
            <span className="section-number">2</span>
            <h3 className="section-title-styled">Tarification & Finance</h3>
          </div>
          
          <div className="form-grid-3">
            <Input
              id="ticket-prixPublic"
              label="Prix Public (EUR)"
              type="number"
              step="0.01"
              value={form.prixPublic}
              onChange={(e) => updateField('prixPublic', e.target.value)}
              error={errors.prixPublic}
            />
            <Input
              id="ticket-totalFrais"
              label="Frais de Billetterie"
              type="number"
              step="0.01"
              value={form.totalFrais}
              onChange={(e) => updateField('totalFrais', e.target.value)}
              error={errors.totalFrais}
            />
            <Input
              id="ticket-commission"
              label="Commission Plateforme"
              type="number"
              step="0.01"
              value={form.commission}
              onChange={(e) => updateField('commission', e.target.value)}
              error={errors.commission}
            />
          </div>

          <div className="form-grid-3">
            <Input
              id="ticket-codeReduction"
              label="Code Promo"
              value={form.codeReduction}
              onChange={(e) => updateField('codeReduction', e.target.value)}
              placeholder="Ex: FEST10"
            />
            <Input
              id="ticket-reduction"
              label="Réduction Appliquée"
              type="number"
              step="0.01"
              value={form.reduction}
              onChange={(e) => updateField('reduction', e.target.value)}
              error={errors.reduction}
            />
            <Input
              id="ticket-ttcPrixPaye"
              label="Prix Payé (TTC) - Calculé"
              type="number"
              step="0.01"
              value={form.ttcPrixPaye}
              onChange={(e) => updateField('ttcPrixPaye', e.target.value)}
              error={errors.ttcPrixPaye}
            />
          </div>

          <div className="form-grid-4">
            <Input
              id="ticket-ttcPrixSansCommission"
              label="Prix TTC Hors Comm."
              type="number"
              step="0.01"
              value={form.ttcPrixSansCommission}
              onChange={(e) => updateField('ttcPrixSansCommission', e.target.value)}
              error={errors.ttcPrixSansCommission}
              disabled
            />
            <Input
              id="ticket-htPrixPaye"
              label="Montant HT"
              type="number"
              step="0.01"
              value={form.htPrixPaye}
              onChange={(e) => updateField('htPrixPaye', e.target.value)}
              error={errors.htPrixPaye}
            />
            <Input
              id="ticket-tauxTaxe"
              label="Taux de Taxe (TVA)"
              value={form.tauxTaxe}
              onChange={(e) => updateField('tauxTaxe', e.target.value)}
              placeholder="Ex: 20%"
            />
            <Input
              id="ticket-taxe"
              label="Montant Taxe"
              type="number"
              step="0.01"
              value={form.taxe}
              onChange={(e) => updateField('taxe', e.target.value)}
              error={errors.taxe}
            />
          </div>
        </div>

        {/* SECTION 3: Buyer Information */}
        <div className="form-section-card">
          <div className="section-header-styled">
            <span className="section-number">3</span>
            <h3 className="section-title-styled">Informations de l'Acheteur</h3>
          </div>
          <div className="form-grid-3">
            <Input
              id="ticket-prenomAcheteur"
              label="Prénom"
              required
              value={form.prenomAcheteur}
              onChange={(e) => updateField('prenomAcheteur', e.target.value)}
              placeholder="Ex: Jean"
            />
            <Input
              id="ticket-nomAcheteur"
              label="Nom de Famille"
              required
              value={form.nomAcheteur}
              onChange={(e) => updateField('nomAcheteur', e.target.value)}
              placeholder="Ex: Dupont"
            />
            <Input
              id="ticket-emailAcheteur"
              label="Email"
              required
              type="email"
              value={form.emailAcheteur}
              onChange={(e) => updateField('emailAcheteur', e.target.value)}
              error={errors.emailAcheteur}
              placeholder="jean.dupont@example.com"
            />
          </div>
          <div className="form-grid-3">
            <Input
              id="ticket-mobileAcheteur"
              label="Téléphone Mobile"
              value={form.mobileAcheteur}
              onChange={(e) => updateField('mobileAcheteur', e.target.value)}
              placeholder="+33612345678"
            />
            <Select
              id="ticket-consentement"
              label="Consentement Marketing"
              options={[{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }]}
              value={form.consentement}
              onChange={(e) => updateField('consentement', e.target.value)}
            />
            <Input
              id="ticket-langueAcheteur"
              label="Langue"
              value={form.langueAcheteur}
              onChange={(e) => updateField('langueAcheteur', e.target.value)}
              placeholder="fr_FR"
            />
          </div>
        </div>

        {/* SECTION 4: Participant Information */}
        <div className="form-section-card">
          <div className="section-header-styled" style={{ justifyContent: 'space-between' }}>
            <div className="flex-row items-center gap-3">
              <span className="section-number">4</span>
              <h3 className="section-title-styled">Informations du Participant</h3>
            </div>
            <Button
              id="ticket-copy-buyer-btn"
              variant="secondary"
              size="sm"
              icon={Copy}
              type="button"
              onClick={copyBuyerToParticipant}
            >
              Copier l'Acheteur
            </Button>
          </div>
          
          <div className="form-grid-4">
            <Select
              id="ticket-civiliteParticipant"
              label="Civilité"
              options={CIVILITY_OPTIONS}
              value={form.civiliteParticipant}
              onChange={(e) => updateField('civiliteParticipant', e.target.value)}
            />
            <Input
              id="ticket-prenomParticipant"
              label="Prénom"
              required
              value={form.prenomParticipant}
              onChange={(e) => updateField('prenomParticipant', e.target.value)}
              placeholder="Ex: Jean"
            />
            <Input
              id="ticket-nomParticipant"
              label="Nom"
              required
              value={form.nomParticipant}
              onChange={(e) => updateField('nomParticipant', e.target.value)}
              placeholder="Ex: Dupont"
            />
            <Input
              id="ticket-emailParticipant"
              label="Email"
              required
              type="email"
              value={form.emailParticipant}
              onChange={(e) => updateField('emailParticipant', e.target.value)}
              error={errors.emailParticipant}
              placeholder="jean.dupont@example.com"
            />
          </div>

          <div className="form-grid-4">
            <Input
              id="ticket-dateNaissanceParticipant"
              label="Date de Naissance"
              value={form.dateNaissanceParticipant}
              onChange={(e) => updateField('dateNaissanceParticipant', e.target.value)}
              placeholder="JJ/MM/AAAA"
            />
            <Input
              id="ticket-telephoneParticipant"
              label="Téléphone"
              value={form.telephoneParticipant}
              onChange={(e) => updateField('telephoneParticipant', e.target.value)}
              placeholder="+33612345678"
            />
            <Input
              id="ticket-villeParticipant"
              label="Ville"
              value={form.villeParticipant}
              onChange={(e) => updateField('villeParticipant', e.target.value)}
              placeholder="Paris"
            />
            <Input
              id="ticket-paysParticipant"
              label="Pays"
              value={form.paysParticipant}
              onChange={(e) => updateField('paysParticipant', e.target.value)}
              placeholder="France"
            />
          </div>

          <div className="form-row">
            <Input
              id="ticket-dateNuiteeSupplementaire"
              label="Dates de Nuitées Supplémentaires"
              value={form.dateNuiteeSupplementaire}
              onChange={(e) => updateField('dateNuiteeSupplementaire', e.target.value)}
              placeholder="Ex: 2026-07-11, 2026-07-15"
            />
            <Input
              id="ticket-referenceFullPass"
              label="Référence Full Pass"
              value={form.referenceFullPass}
              onChange={(e) => updateField('referenceFullPass', e.target.value)}
              placeholder="Ex: FP-1029"
            />
          </div>
        </div>

        {/* SECTION 5: Invoicing */}
        <div className="form-section-card">
          <div className="section-header-styled">
            <span className="section-number">5</span>
            <h3 className="section-title-styled">Informations de Facturation</h3>
          </div>
          
          <div className="form-grid-3">
            <Input
              id="ticket-factureSociete"
              label="Nom de Société"
              value={form.factureSociete}
              onChange={(e) => updateField('factureSociete', e.target.value)}
              placeholder="Ex: Dupont Inc"
            />
            <Input
              id="ticket-factureTva"
              label="N° de TVA Intracommunautaire"
              value={form.factureTva}
              onChange={(e) => updateField('factureTva', e.target.value)}
              placeholder="Ex: FR123456789"
            />
            <Input
              id="ticket-factureCodePostal"
              label="Code Postal"
              value={form.factureCodePostal}
              onChange={(e) => updateField('factureCodePostal', e.target.value)}
              placeholder="75002"
            />
          </div>

          <div className="form-grid-3">
            <Input
              id="ticket-factureAdresse"
              label="Adresse de Facturation"
              value={form.factureAdresse}
              onChange={(e) => updateField('factureAdresse', e.target.value)}
              placeholder="10 Rue de la Paix"
            />
            <Input
              id="ticket-factureVille"
              label="Ville de Facturation"
              value={form.factureVille}
              onChange={(e) => updateField('factureVille', e.target.value)}
              placeholder="Paris"
            />
            <Input
              id="ticket-facturePays"
              label="Pays de Facturation"
              value={form.facturePays}
              onChange={(e) => updateField('facturePays', e.target.value)}
              placeholder="France"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticket-informationsComplementaires" className="form-label">
              Informations Complémentaires / Notes
            </label>
            <textarea
              id="ticket-informationsComplementaires"
              className="form-textarea"
              value={form.informationsComplementaires}
              onChange={(e) => updateField('informationsComplementaires', e.target.value)}
              placeholder="Saisissez des commentaires additionnels ici..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions" style={{ marginTop: '1.5rem' }}>
          <Button
            id="ticket-cancel-btn"
            variant="secondary"
            type="button"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button id="ticket-submit-btn" variant="primary" type="submit" icon={Sparkles}>
            {ticket ? 'Enregistrer les modifications' : 'Créer le billet'}
          </Button>
        </div>

      </div>
    </form>
  );
}
