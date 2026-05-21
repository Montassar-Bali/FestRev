import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Building2,
  Star,
  Pencil,
  Trash2,
  Users,
  CalendarDays,
  MapPin,
} from 'lucide-react';
import { useReservationStore } from '../store/reservationStore';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const starOptions = [
  { value: '1', label: '★' },
  { value: '2', label: '★★' },
  { value: '3', label: '★★★' },
  { value: '4', label: '★★★★' },
  { value: '5', label: '★★★★★' },
];

export default function Hotels() {
  const {
    hotels,
    reservations,
    addHotel,
    updateHotel,
    deleteHotel,
  } = useReservationStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [form, setForm] = useState({ name: '', stars: '3', address: '' });
  const [errors, setErrors] = useState({});

  const openCreate = () => {
    setEditingHotel(null);
    setForm({ name: '', stars: '3', address: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (hotel) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name,
      stars: String(hotel.stars || 3),
      address: hotel.address || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      name: form.name.trim(),
      stars: parseInt(form.stars, 10),
      address: form.address.trim(),
    };

    if (editingHotel) {
      updateHotel(editingHotel.id, data);
    } else {
      addHotel({ ...data, id: crypto.randomUUID() });
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    deleteHotel(id);
    setDeleteConfirm(null);
    if (selectedHotel?.id === id) setSelectedHotel(null);
  };

  const getHotelReservations = (hotelId) =>
    reservations.filter((r) => r.hotelId === hotelId);

  return (
    <PageWrapper id="hotels-page">
      <div className="page-grid">
        {/* Header */}
        <div className="flex-between">
          <div>
            <h2 className="section-title">Gestion des Hôtels</h2>
            <p className="section-subtitle">
              {hotels.length} hôtel{hotels.length !== 1 ? 's' : ''} enregistré
              {hotels.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button id="hotels-add-btn" icon={Plus} onClick={openCreate}>
            Ajouter un Hôtel
          </Button>
        </div>

        {/* Hotel Grid */}
        {hotels.length === 0 ? (
          <EmptyState
            id="hotels-empty"
            icon={Building2}
            title="Aucun hôtel enregistré"
            message="Ajoutez votre premier hôtel pour démarrer la gestion des réservations."
            actionLabel="Ajouter un hôtel"
            onAction={openCreate}
          />
        ) : (
          <div className="cards-grid">
            <AnimatePresence mode="popLayout">
              {hotels.map((hotel, index) => {
                const hotelRes = getHotelReservations(hotel.id);
                const participantCount = hotelRes.reduce(
                  (sum, r) => sum + (r.participants?.length || 0),
                  0
                );
                const categories = {};
                hotelRes.forEach((r) => {
                  categories[r.category] = (categories[r.category] || 0) + 1;
                });

                return (
                  <motion.div
                    key={hotel.id}
                    id={`hotel-card-${hotel.id}`}
                    className="hotel-card"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    whileHover={{ y: -4 }}
                    onClick={() =>
                      setSelectedHotel(
                        selectedHotel?.id === hotel.id ? null : hotel
                      )
                    }
                  >
                    <div className="hotel-card-header">
                      <div>
                        <h3 className="hotel-card-name">{hotel.name}</h3>
                        {hotel.address && (
                          <p
                            className="text-sm text-secondary"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '4px',
                            }}
                          >
                            <MapPin size={12} />
                            {hotel.address}
                          </p>
                        )}
                      </div>
                      <div className="hotel-card-stars">
                        {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>

                    <div className="hotel-card-stats">
                      <div className="hotel-card-stat">
                        <span className="hotel-card-stat-value">
                          {hotelRes.length}
                        </span>
                        <span className="hotel-card-stat-label">Réservations</span>
                      </div>
                      <div className="hotel-card-stat">
                        <span className="hotel-card-stat-value">
                          {participantCount}
                        </span>
                        <span className="hotel-card-stat-label">Participants</span>
                      </div>
                    </div>

                    {/* Category breakdown */}
                    {Object.keys(categories).length > 0 && (
                      <div
                        className="flex-row gap-2"
                        style={{ flexWrap: 'wrap' }}
                      >
                        {Object.entries(categories).map(([cat, count]) => (
                          <Badge
                            key={cat}
                            category={cat}
                            id={`hotel-${hotel.id}-badge-${cat}`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="hotel-card-bar">
                      <motion.div
                        className="hotel-card-bar-fill"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (hotelRes.length /
                              Math.max(reservations.length, 1)) *
                              100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      />
                    </div>

                    {/* Card actions */}
                    <div
                      className="flex-row gap-2"
                      style={{ justifyContent: 'flex-end' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        id={`hotel-edit-${hotel.id}`}
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                        onClick={() => openEdit(hotel)}
                      >
                        Modifier
                      </Button>
                      <Button
                        id={`hotel-delete-${hotel.id}`}
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteConfirm(hotel.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Detail view */}
        <AnimatePresence>
          {selectedHotel && (
            <motion.section
              id="hotel-detail"
              className="card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="card-header">
                <h3 className="card-title">
                  Réservations — {selectedHotel.name}
                </h3>
              </div>
              {getHotelReservations(selectedHotel.id).length === 0 ? (
                <p className="text-sm text-secondary">
                  Aucune réservation pour cet hôtel.
                </p>
              ) : (
                <div className="data-table-wrapper" style={{ border: 'none' }}>
                  <table className="data-table" id="hotel-detail-table">
                    <thead>
                      <tr>
                        <th>Participants</th>
                        <th>Type</th>
                        <th>Catégorie</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getHotelReservations(selectedHotel.id).map((res) => (
                        <tr key={res.id}>
                          <td>
                            {res.participants
                              ?.map((p) => `${p.prenom} ${p.nom}`)
                              .join(', ')}
                          </td>
                          <td>{res.roomType}</td>
                          <td>
                            <Badge category={res.category} />
                          </td>
                          <td>{res.checkIn}</td>
                          <td>{res.checkOut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Hotel Modal */}
      <Modal
        id="hotel-modal"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHotel ? 'Modifier l\'Hôtel' : 'Nouvel Hôtel'}
        footer={
          <>
            <Button
              id="hotel-modal-cancel-btn"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              id="hotel-modal-submit-btn"
              variant="primary"
              onClick={handleSubmit}
            >
              {editingHotel ? 'Modifier' : 'Ajouter'}
            </Button>
          </>
        }
      >
        <form
          id="hotel-form"
          onSubmit={handleSubmit}
          className="flex-col gap-4"
        >
          <Input
            id="hotel-name-input"
            label="Nom de l'hôtel"
            required
            value={form.name}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            placeholder="Ex: Hôtel Le Majestic"
          />
          <Select
            id="hotel-stars-select"
            label="Étoiles"
            options={starOptions}
            value={form.stars}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, stars: e.target.value }))
            }
          />
          <Input
            id="hotel-address-input"
            label="Adresse"
            value={form.address}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Ex: 123 Rue de la Paix, Paris"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        id="hotel-delete-confirm-modal"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression"
        footer={
          <>
            <Button
              id="hotel-delete-cancel-btn"
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Annuler
            </Button>
            <Button
              id="hotel-delete-ok-btn"
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
          Êtes-vous sûr de vouloir supprimer cet hôtel ? Toutes les réservations
          associées seront également supprimées.
        </p>
      </Modal>
    </PageWrapper>
  );
}
