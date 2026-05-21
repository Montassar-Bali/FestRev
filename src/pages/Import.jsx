import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Shield,
  HelpCircle,
  Play,
  ArrowRight,
  Database
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { parseAndNormalizeCSV } from '../lib/csvParser';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function Import() {
  const { bulkUploadTickets, loading: storeLoading } = useTicketStore();
  const navigate = useNavigate();

  // Mode & Gating State
  const [isAdminMode, setIsAdminMode] = useState(true); // Default to admin for easier flow, togglable on UI

  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null); // { originalCount, tickets, etc. }
  const [parseError, setParseError] = useState('');
  
  // Settings State
  const [deleteExisting, setDeleteExisting] = useState(false);
  
  // Progress & Execution States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // number of uploaded tickets
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const fileInputRef = useRef(null);

  // Drag over handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Click file input handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle parsing logic
  const processFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setParseError('Le fichier doit être au format CSV (.csv uniquement).');
      setFile(null);
      setParsedData(null);
      return;
    }
    
    setFile(selectedFile);
    setParseError('');
    setParsedData(null);
    setUploadCompleted(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const normalized = parseAndNormalizeCSV(text);
        setParsedData(normalized);
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        setParseError(err.message || 'Erreur lors du traitement du fichier CSV.');
        setFile(null);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleUploadSubmit = async () => {
    if (!parsedData || isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await bulkUploadTickets(parsedData.tickets, deleteExisting, (progressCount) => {
        setUploadProgress(progressCount);
      });
      setUploadCompleted(true);
      setFile(null);
      setParsedData(null);
    } catch (err) {
      console.error('Database Upload Error:', err);
      setParseError("Erreur lors de l'enregistrement des données sur Firebase.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setParseError('');
    setUploadProgress(0);
    setUploadCompleted(false);
  };

  // Compute stats details
  const uploadPct = useMemo(() => {
    if (!parsedData) return 0;
    const total = parsedData.tickets.length;
    return total > 0 ? Math.min(100, Math.round((uploadProgress / total) * 100)) : 0;
  }, [uploadProgress, parsedData]);

  return (
    <PageWrapper id="admin-import-page">
      <div className="page-grid">
        
        {/* Header Controls (Restricted Gating Switcher) */}
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 className="section-title">Importation en Masse (CSV)</h2>
            <p className="section-subtitle">
              Intégrer vos listes existantes directement dans la base de données
            </p>
          </div>
          
          {/* Simulation Toggle */}
          <div className="role-switcher-card">
            <span className="text-xs font-semibold text-secondary" style={{ marginRight: 'var(--space-2)' }}>
              Rôle :
            </span>
            <button
              id="role-visitor-btn"
              type="button"
              className={`role-btn ${!isAdminMode ? 'active visitor' : ''}`}
              onClick={() => {
                if (!isUploading) setIsAdminMode(false);
              }}
            >
              Visiteur
            </button>
            <button
              id="role-admin-btn"
              type="button"
              className={`role-btn ${isAdminMode ? 'active admin' : ''}`}
              onClick={() => setIsAdminMode(true)}
            >
              Admin
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isAdminMode ? (
            /* VISITOR / ACCESS DENIED VIEW */
            <motion.div
              key="access-denied"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="card flex-center text-center"
              style={{ padding: 'var(--space-12)', minHeight: '400px', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className="denied-icon-glow">
                <Lock size={44} className="text-danger" />
              </div>
              <h3 className="text-xl font-bold" style={{ marginTop: 'var(--space-2)' }}>
                Accès Administrateur Requis
              </h3>
              <p className="text-secondary" style={{ maxWidth: '480px', lineHeight: 'var(--line-height-relaxed)' }}>
                Cette console contient des fonctions de gestion de base de données en écriture directe. 
                Seuls les comptes administrateurs authentifiés possèdent les permissions requises pour téléverser ou purger des billets.
              </p>
              <div className="alert alert-warning" style={{ maxWidth: '480px', display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <Shield size={20} className="flex-shrink-0" style={{ color: 'var(--color-warning)' }} />
                <span className="text-xs text-left" style={{ color: 'var(--color-warning)' }}>
                  <strong>Note de démo :</strong> Utilisez le sélecteur de rôle en haut à droite pour passer en mode <strong>Admin</strong> et tester cette fonctionnalité.
                </span>
              </div>
            </motion.div>
          ) : (
            /* ADMIN / FULL FUNCTIONALITY VIEW */
            <motion.div
              key="admin-import-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex-col gap-6"
            >
              
              {/* Info panel */}
              <div className="card info-gradient-card">
                <div className="flex-row gap-4" style={{ alignItems: 'flex-start' }}>
                  <div className="info-icon-wrapper">
                    <Database size={24} className="text-primary" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="font-semibold text-base" style={{ marginBottom: 'var(--space-1)' }}>
                      Instructions de formatage CSV
                    </h4>
                    <p className="text-sm text-secondary" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                      Le fichier importé doit utiliser le point-virgule (<strong>;</strong>) comme délimiteur. 
                      Les en-têtes de colonnes seront automatiquement mappés vers notre schéma (ex: <i>nCommande</i>, <i>emailAcheteur</i>, <i>prixPublic</i>). 
                      Les décimales au format européen (ex: <strong>45,50 €</strong>) seront converties en floats standards (<strong>45.50</strong>). 
                      Toutes les colonnes intégralement vides dans le fichier seront automatiquement identifiées et exclues lors du téléversement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Upload and Settings Area */}
              <div className="card flex-col gap-6">
                
                {/* Purge database checkbox */}
                {!isUploading && !uploadCompleted && (
                  <div className="flex-col gap-3">
                    <label className="checkbox-container select-none" style={{ cursor: 'pointer' }}>
                      <input
                        id="import-delete-existing"
                        type="checkbox"
                        checked={deleteExisting}
                        onChange={(e) => setDeleteExisting(e.target.checked)}
                      />
                      <span className="checkbox-text font-semibold text-sm">
                        Supprimer tous les billets existants de la base de données avant l'importation
                      </span>
                    </label>
                    
                    {deleteExisting && (
                      <motion.div
                        className="alert alert-danger"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ display: 'flex', gap: 'var(--space-2)', margin: 0 }}
                      >
                        <AlertTriangle size={18} className="flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
                          <strong>ATTENTION DANGER :</strong> Cette option videra entièrement le noeud <code>/tickets</code> sur Firebase avant l'écriture. Tous les billets de démonstration ou créés manuellement seront <strong>définitivement supprimés</strong>.
                        </span>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* State: Drag & Drop Dropzone */}
                {!file && !isUploading && !uploadCompleted && (
                  <div
                    id="import-dropzone"
                    className={`dropzone-container ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="import-file-input"
                      className="hidden-file-input"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                    <UploadCloud size={48} className="dropzone-icon" />
                    <p className="font-semibold text-base">Glissez-déposez votre fichier CSV ici</p>
                    <p className="text-xs text-secondary">Ou cliquez pour parcourir vos fichiers (.csv délimité par des points-virgules)</p>
                  </div>
                )}

                {/* State: Uploading progress bar */}
                {isUploading && parsedData && (
                  <div className="flex-col gap-4 text-center" style={{ padding: 'var(--space-6)' }}>
                    <div className="loader-container">
                      <div className="loader" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-col gap-1">
                      <p className="font-semibold text-base">Importation en cours...</p>
                      <p className="text-sm text-secondary">
                        Écriture en cours : {uploadProgress} / {parsedData.tickets.length} billets ({uploadPct}%)
                      </p>
                      <p className="text-xs text-tertiary">
                        Envoi par lots de 400 documents sur Firebase Realtime Database
                      </p>
                    </div>
                    
                    {/* Progress Bar Wrapper */}
                    <div className="progress-bar-bg">
                      <motion.div
                        className="progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadPct}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {/* State: Upload complete success view */}
                {uploadCompleted && (
                  <div className="flex-center text-center" style={{ padding: 'var(--space-6)', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="success-icon-glow">
                      <CheckCircle2 size={44} className="text-success" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ marginTop: 'var(--space-2)' }}>
                      Importation Réussie !
                    </h3>
                    <p className="text-secondary" style={{ maxWidth: '450px', lineHeight: 'var(--line-height-relaxed)' }}>
                      Toutes les données ont été formatées et envoyées avec succès. 
                      Les décimales et les structures de billets ont été synchronisées en temps réel.
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex-row gap-3" style={{ marginTop: 'var(--space-4)' }}>
                      <Button variant="secondary" onClick={handleReset}>
                        Importer un autre fichier
                      </Button>
                      <Button variant="primary" icon={ArrowRight} onClick={() => navigate('/tickets')}>
                        Consulter les billets
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {parseError && (
                  <div className="alert alert-danger" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <AlertTriangle size={18} className="flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
                    <span className="text-sm">{parseError}</span>
                  </div>
                )}

                {/* State: Data preview table & validation before upload */}
                {file && parsedData && !isUploading && (
                  <div className="flex-col gap-6">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <div className="flex-col">
                        <span className="font-semibold text-base">{file.name}</span>
                        <span className="text-xs text-secondary">
                          {(file.size / 1024).toFixed(1)} KB • {parsedData.tickets.length} enregistrements trouvés
                        </span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={handleReset}>
                        Retirer le fichier
                      </Button>
                    </div>

                    {/* Columns excluded notification */}
                    {parsedData.filteredEmptyColumnsCount > 0 && (
                      <div className="alert alert-warning" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <div className="flex-row gap-2" style={{ alignItems: 'center' }}>
                          <Shield size={16} className="text-warning-icon" style={{ color: 'var(--color-warning)' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-warning)' }}>
                            {parsedData.filteredEmptyColumnsCount} colonnes vides ignorées
                          </span>
                        </div>
                        <span className="text-xs text-secondary" style={{ paddingLeft: 'var(--space-6)' }}>
                          Ces colonnes ne contenaient aucune valeur sur l'intégralité du tableau : {parsedData.removedColumns.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Data table preview */}
                    <div className="flex-col gap-2">
                      <h5 className="font-semibold text-sm flex-row items-center gap-2">
                        <Eye size={16} className="text-secondary" />
                        Aperçu des 5 premières lignes
                      </h5>
                      <div className="data-table-wrapper">
                        <table className="data-table" style={{ fontSize: 'var(--font-size-xs)' }}>
                          <thead>
                            <tr>
                              <th>N° Commande</th>
                              <th>Billet / Tarif</th>
                              <th>Acheteur</th>
                              <th>Participant</th>
                              <th>Prix Public</th>
                              <th>Frais</th>
                              <th>Prix Payé (TTC)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.tickets.slice(0, 5).map((t, index) => (
                              <tr key={t.id || index}>
                                <td>{t.nCommande || '—'}</td>
                                <td>
                                  <div className="flex-col">
                                    <span>{t.typologie || '—'}</span>
                                    <span className="text-tertiary text-xxs">{t.tarif || '—'}</span>
                                  </div>
                                </td>
                                <td>{t.prenomAcheteur} {t.nomAcheteur}</td>
                                <td>{t.prenomParticipant} {t.nomParticipant}</td>
                                <td>{t.prixPublic ? `${t.prixPublic.toFixed(2)} €` : '—'}</td>
                                <td>{t.totalFrais ? `${t.totalFrais.toFixed(2)} €` : '—'}</td>
                                <td className="font-semibold">{t.ttcPrixPaye ? `${t.ttcPrixPaye.toFixed(2)} €` : '0.00 €'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedData.tickets.length > 5 && (
                        <p className="text-center text-xs text-secondary" style={{ marginTop: 'var(--space-2)' }}>
                          ... et {parsedData.tickets.length - 5} autres billets seront importés.
                        </p>
                      )}
                    </div>

                    {/* Submit Action Block */}
                    <div className="flex-center" style={{ marginTop: 'var(--space-4)' }}>
                      <Button
                        id="import-submit-btn"
                        variant="primary"
                        size="lg"
                        icon={Play}
                        onClick={handleUploadSubmit}
                      >
                        Lancer l'importation de {parsedData.tickets.length} billets
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
