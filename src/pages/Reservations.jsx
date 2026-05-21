import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { useReservationStore } from '../store/reservationStore';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ReservationForm from '../components/reservations/ReservationForm';

const roomTypeLabels = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quadruple',
};

export default function Reservations() {
  const {
    hotels,
    reservations,
    addReservation,
    updateReservation,
    deleteReservation,
  } = useReservationStore();

  const [search, setSearch] = useState('');
  const [filterHotel, setFilterHotel] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (filterHotel && r.hotelId !== filterHotel) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterRoomType && r.roomType !== filterRoomType) return false;
      if (search) {
        const term = search.toLowerCase();
        const hotel = hotels.find((h) => h.id === r.hotelId);
        const hotelName = hotel?.name?.toLowerCase() || '';
        const participantNames = r.participants
          ?.map((p) => `${p.prenom} ${p.nom}`.toLowerCase())
          .join(' ') || '';
        const matchesSearch =
          hotelName.includes(term) ||
          participantNames.includes(term) ||
          r.category?.toLowerCase().includes(term) ||
          r.bandName?.toLowerCase().includes(term) ||
          r.teamRole?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [reservations, search, filterHotel, filterCategory, filterRoomType, hotels]);

  const handleCreate = () => {
    setEditingReservation(null);
    setModalOpen(true);
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, formData);
    } else {
      addReservation({
        ...formData,
        id: crypto.randomUUID(),
        status: 'confirmed',
      });
    }
    setModalOpen(false);
    setEditingReservation(null);
  };

  const handleDelete = (id) => {
    deleteReservation(id);
    setDeleteConfirm(null);
  };

  return (
    <PageWrapper id="reservations-page">
      <div className="page-grid">
        {/* Toolbar */}
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                id="reservations-search"
                className="form-input"
                type="text"
                placeholder="Rechercher par nom, hôtel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              id="reservations-filter-hotel"
              className="form-select"
              value={filterHotel}
              onChange={(e) => setFilterHotel(e.target.value)}
            >
              <option value="">Tous les hôtels</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <select
              id="reservations-filter-category"
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Toutes catégories</option>
              <option value="VIP">VIP</option>
              <option value="Artiste">Artiste</option>
              <option value="Organisation">Organisation</option>
              <option value="Standard">Standard</option>
            </select>

            <select
              id="reservations-filter-room-type"
              className="form-select"
              value={filterRoomType}
              onChange={(e) => setFilterRoomType(e.target.value)}
            >
              <option value="">Tous types</option>
              {Object.entries(roomTypeLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <Button id="reservations-add-btn" icon={Plus} onClick={handleCreate}>
            Nouvelle Réservation
          </Button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            id="reservations-empty"
            icon={CalendarDays}
            title="Aucune réservation trouvée"
            message={
              reservations.length === 0
                ? 'Commencez par créer votre première réservation.'
                : 'Essayez de modifier vos filtres de recherche.'
            }
            actionLabel={reservations.length === 0 ? 'Créer une réservation' : undefined}
            onAction={reservations.length === 0 ? handleCreate : undefined}
          />
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="reservations-table">
              <thead>
                <tr>
                  <th>Hôtel</th>
                  <th>Chambre</th>
                  <th>Type</th>
                  <th>Participants</th>
                  <th>Catégorie</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((res) => {
                    const hotel = hotels.find((h) => h.id === res.hotelId);
                    return (
                      <motion.tr
                        key={res.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <td>{hotel?.name || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {roomTypeLabels[res.roomType]?.[0] || '?'}
                          {res.id?.slice(-4) || ''}
                        </td>
                        <td>{roomTypeLabels[res.roomType] || res.roomType}</td>
                        <td>
                          {res.participants
                            ?.map((p) => `${p.prenom} ${p.nom}`)
                            .join(', ') || '—'}
                        </td>
                        <td>
                          <Badge category={res.category} />
                        </td>
                        <td>{res.checkIn || '—'}</td>
                        <td>{res.checkOut || '—'}</td>
                        <td>
                          <div className="table-actions">
                            <Button
                              id={`reservation-edit-${res.id}`}
                              variant="ghost"
                              size="sm"
                              iconOnly
                              icon={Pencil}
                              onClick={() => handleEdit(res)}
                              aria-label="Modifier"
                            />
                            <Button
                              id={`reservation-delete-${res.id}`}
                              variant="ghost"
                              size="sm"
                              iconOnly
                              icon={Trash2}
                              onClick={() => setDeleteConfirm(res.id)}
                              aria-label="Supprimer"
                            />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Results count */}
        {filtered.length > 0 && (
          <p className="text-sm text-secondary" style={{ textAlign: 'right' }}>
            {filtered.length} réservation{filtered.length > 1 ? 's' : ''} trouvée
            {filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        id="reservation-modal"
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReservation(null);
        }}
        title={editingReservation ? 'Modifier la Réservation' : 'Nouvelle Réservation'}
        large
      >
        <ReservationForm
          reservation={editingReservation}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingReservation(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        id="delete-confirm-modal"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
        footer={
          <>
            <Button
              id="delete-confirm-cancel-btn"
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Annuler
            </Button>
            <Button
              id="delete-confirm-ok-btn"
              variant="danger"
              icon={Trash2}
              onClick={() => handleDelete(deleteConfirm)}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est
          irréversible.
        </p>
      </Modal>
    </PageWrapper>
  );
}
