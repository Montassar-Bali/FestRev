import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Layers,
  Download,
  CalendarDays,
  Filter,
  CheckCircle,
  Ticket
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import { exportToExcel } from '../lib/exportExcel';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

export default function Export() {
  const { tickets, loading } = useTicketStore();

  const [exportMode, setExportMode] = useState('all'); // 'all', 'typology', 'date'
  const [selectedTypology, setSelectedTypology] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  // Dynamic list of typologies from the tickets list
  const typologies = useMemo(() => {
    const set = new Set(tickets.map((t) => t.typologie).filter(Boolean));
    return Array.from(set).sort();
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Filter out deleted unless requested
    if (!includeDeleted) {
      result = result.filter((t) => t.supprime !== 1);
    } else {
      // If including deleted, keep all (both active and deleted)
    }

    if (exportMode === 'typology' && selectedTypology) {
      result = result.filter((t) => t.typologie === selectedTypology);
    }
    
    if (exportMode === 'date') {
      if (dateFrom) {
        result = result.filter((t) => t.dateCommande >= dateFrom);
      }
      if (dateTo) {
        result = result.filter((t) => t.dateCommande <= dateTo);
      }
    }
    return result;
  }, [tickets, exportMode, selectedTypology, dateFrom, dateTo, includeDeleted]);

  const handleExport = async () => {
    setExporting(true);
    setExported(false);
    try {
      await exportToExcel(tickets, {
        mode: exportMode,
        typology: selectedTypology,
        dateFrom,
        dateTo,
        includeDeleted
      });
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const exportModes = [
    {
      id: 'all',
      label: 'Tout exporter',
      description: 'Tous les billets actifs',
      icon: FileSpreadsheet,
    },
    {
      id: 'typology',
      label: 'Par typologie',
      description: 'Filtrer par type de billet',
      icon: Layers,
    },
    {
      id: 'date',
      label: 'Par dates de commande',
      description: 'Plage de dates de commande',
      icon: CalendarDays,
    },
  ];

  if (loading) {
    return (
      <PageWrapper id="export-loading-page">
        <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="loader" style={{ borderTopColor: 'var(--color-primary)' }} />
          <p className="text-secondary">Chargement de la base pour l'export...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper id="export-page">
      <div className="page-grid">
        {/* Header */}
        <div>
          <h2 className="section-title">Exporter les Données</h2>
          <p className="section-subtitle">
            Générer un tableur Excel avec vos billets
          </p>
        </div>

        {/* Export Mode Selection */}
        <div className="export-options">
          {exportModes.map((mode) => (
            <motion.div
              key={mode.id}
              id={`export-mode-${mode.id}`}
              className={`export-option ${exportMode === mode.id ? 'selected' : ''}`}
              onClick={() => setExportMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="export-option-icon">
                <mode.icon size={24} />
              </div>
              <div>
                <p className="font-semibold">{mode.label}</p>
                <p className="text-sm text-secondary">{mode.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mode-specific filters */}
        {exportMode === 'typology' && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-row gap-3" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="export-typology-filter" className="form-label">
                  <Filter size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Sélectionner la typologie
                </label>
                <select
                  id="export-typology-filter"
                  className="form-select"
                  value={selectedTypology}
                  onChange={(e) => setSelectedTypology(e.target.value)}
                >
                  <option value="">Toutes les typologies</option>
                  {typologies.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {exportMode === 'date' && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="export-date-from" className="form-label">
                  Date de commande de début
                </label>
                <input
                  id="export-date-from"
                  type="date"
                  className="form-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="export-date-to" className="form-label">
                  Date de commande de fin
                </label>
                <input
                  id="export-date-to"
                  type="date"
                  className="form-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Global check for deleted tickets */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <input
            id="export-include-deleted"
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
          />
          <label htmlFor="export-include-deleted" className="text-sm select-none" style={{ cursor: 'pointer', fontWeight: 500 }}>
            Inclure les billets supprimés (corbeille) dans l'exportation
          </label>
        </div>

        {/* Preview */}
        <section className="section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Aperçu</h3>
              <p className="section-subtitle">
                {filteredTickets.length} billet{filteredTickets.length !== 1 ? 's' : ''} à exporter
              </p>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <EmptyState
              id="export-empty"
              icon={Ticket}
              title="Aucune donnée à exporter"
              message="Ajoutez des billets ou modifiez vos critères de filtrage."
            />
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table" id="export-preview-table">
                <thead>
                  <tr>
                    <th>Commande / Billet</th>
                    <th>Typologie / Catégorie</th>
                    <th>Acheteur</th>
                    <th>Participant</th>
                    <th>Prix TTC</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, 10).map((t) => (
                    <tr key={t.id} style={{ opacity: t.supprime === 1 ? 0.65 : 1 }}>
                      <td>
                        <div className="flex-col">
                          <span className="font-medium text-xs">{t.nCommande || '—'}</span>
                          <span className="text-xs text-secondary">{t.nBillet || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex-col">
                          <span className="text-xs font-semibold">{t.typologie || '—'}</span>
                          <span className="text-xs text-secondary">{t.categorieFamille || '—'}</span>
                        </div>
                      </td>
                      <td className="text-xs">{t.prenomAcheteur} {t.nomAcheteur}</td>
                      <td className="text-xs">{t.prenomParticipant} {t.nomParticipant}</td>
                      <td className="text-xs font-semibold">
                        {(Number(t.ttcPrixPaye) || 0).toLocaleString('fr-FR', { style: 'currency', currency: t.devise || 'EUR' })}
                      </td>
                      <td>
                        {t.supprime === 1 ? (
                          <Badge category="Supprimé" />
                        ) : (
                          <Badge category={t.statutBillet} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length > 10 && (
                <p
                  className="text-sm text-secondary"
                  style={{ padding: 'var(--space-4)', textAlign: 'center' }}
                >
                  ...et {filteredTickets.length - 10} autres billets
                </p>
              )}
            </div>
          )}
        </section>

        {/* Export Button */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <Button
            id="export-download-btn"
            variant="primary"
            size="lg"
            icon={exported ? CheckCircle : Download}
            onClick={handleExport}
            disabled={exporting || filteredTickets.length === 0}
          >
            {exporting
              ? 'Exportation en cours...'
              : exported
              ? 'Exporté avec succès !'
              : `Exporter ${filteredTickets.length} billet${filteredTickets.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
