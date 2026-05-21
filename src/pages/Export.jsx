import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Building2,
  Download,
  CalendarDays,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { useReservationStore } from '../store/reservationStore';
import { exportToExcel } from '../lib/exportExcel';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

const roomTypeLabels = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quadruple',
};

export default function Export() {
  const { hotels, reservations } = useReservationStore();

  const [exportMode, setExportMode] = useState('all'); // 'all', 'hotel', 'date'
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const filteredReservations = useMemo(() => {
    let result = [...reservations];
    if (exportMode === 'hotel' && selectedHotelId) {
      result = result.filter((r) => r.hotelId === selectedHotelId);
    }
    if (exportMode === 'date') {
      if (dateFrom) {
        result = result.filter((r) => r.checkIn >= dateFrom);
      }
      if (dateTo) {
        result = result.filter((r) => r.checkOut <= dateTo);
      }
    }
    return result;
  }, [reservations, exportMode, selectedHotelId, dateFrom, dateTo]);

  const handleExport = async () => {
    setExporting(true);
    setExported(false);
    try {
      await exportToExcel(filteredReservations, hotels, {
        mode: exportMode,
        hotelId: selectedHotelId,
        dateFrom,
        dateTo,
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
      description: 'Toutes les réservations',
      icon: FileSpreadsheet,
    },
    {
      id: 'hotel',
      label: 'Par hôtel',
      description: 'Filtrer par établissement',
      icon: Building2,
    },
    {
      id: 'date',
      label: 'Par dates',
      description: 'Plage de dates',
      icon: CalendarDays,
    },
  ];

  return (
    <PageWrapper id="export-page">
      <div className="page-grid">
        {/* Header */}
        <div>
          <h2 className="section-title">Exporter les Données</h2>
          <p className="section-subtitle">
            Générer un fichier Excel avec vos réservations
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
        {exportMode === 'hotel' && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-row gap-3" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="export-hotel-filter" className="form-label">
                  <Filter size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Sélectionner un hôtel
                </label>
                <select
                  id="export-hotel-filter"
                  className="form-select"
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                >
                  <option value="">Tous les hôtels</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
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
                  Date de début
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
                  Date de fin
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

        {/* Preview */}
        <section className="section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Aperçu</h3>
              <p className="section-subtitle">
                {filteredReservations.length} réservation
                {filteredReservations.length !== 1 ? 's' : ''} à exporter
              </p>
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <EmptyState
              id="export-empty"
              icon={FileSpreadsheet}
              title="Aucune donnée à exporter"
              message="Ajoutez des réservations ou modifiez vos filtres."
            />
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table" id="export-preview-table">
                <thead>
                  <tr>
                    <th>Hôtel</th>
                    <th>Participants</th>
                    <th>Type</th>
                    <th>Catégorie</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.slice(0, 10).map((res) => {
                    const hotel = hotels.find((h) => h.id === res.hotelId);
                    return (
                      <tr key={res.id}>
                        <td>{hotel?.name || '—'}</td>
                        <td>
                          {res.participants
                            ?.map((p) => `${p.prenom} ${p.nom}`)
                            .join(', ') || '—'}
                        </td>
                        <td>{roomTypeLabels[res.roomType] || res.roomType}</td>
                        <td>
                          <Badge category={res.category} />
                        </td>
                        <td>{res.checkIn || '—'}</td>
                        <td>{res.checkOut || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredReservations.length > 10 && (
                <p
                  className="text-sm text-secondary"
                  style={{ padding: 'var(--space-4)', textAlign: 'center' }}
                >
                  ...et {filteredReservations.length - 10} autres réservations
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
            disabled={exporting || filteredReservations.length === 0}
          >
            {exporting
              ? 'Exportation en cours...'
              : exported
              ? 'Exporté avec succès !'
              : `Exporter ${filteredReservations.length} réservation${filteredReservations.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
