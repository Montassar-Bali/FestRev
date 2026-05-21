import { useState, useEffect } from 'react';
import { useReservationStore } from '../../store/reservationStore';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

const roomTypes = [
  { value: 'single', label: 'Single (1 personne)' },
  { value: 'double', label: 'Double (2 personnes)' },
  { value: 'triple', label: 'Triple (3 personnes)' },
  { value: 'quad', label: 'Quadruple (4 personnes)' },
];

const categories = [
  { value: 'VIP', label: 'VIP' },
  { value: 'Artiste', label: 'Artiste' },
  { value: 'Organisation', label: 'Organisation' },
  { value: 'Standard', label: 'Standard' },
];

const roomCapacity = {
  single: 1,
  double: 2,
  triple: 3,
  quad: 4,
};

const emptyParticipant = { nom: '', prenom: '' };

export default function ReservationForm({ reservation, onSubmit, onCancel }) {
  const { hotels } = useReservationStore();

  const [form, setForm] = useState({
    hotelId: '',
    roomType: 'single',
    category: 'Standard',
    participants: [{ ...emptyParticipant }],
    checkIn: '',
    checkOut: '',
    extraNights: [],
    bandName: '',
    teamRole: '',
    notes: '',
    ...reservation,
  });

  const [errors, setErrors] = useState({});

  // Adjust participant count based on room type
  useEffect(() => {
    const capacity = roomCapacity[form.roomType] || 1;
    setForm((prev) => {
      const participants = [...prev.participants];
      while (participants.length < capacity) {
        participants.push({ ...emptyParticipant });
      }
      return { ...prev, participants: participants.slice(0, capacity) };
    });
  }, [form.roomType]);

  const hotelOptions = hotels.map((h) => ({
    value: h.id,
    label: `${h.name} ${'★'.repeat(h.stars || 0)}`,
  }));

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateParticipant = (index, field, value) => {
    setForm((prev) => {
      const participants = [...prev.participants];
      participants[index] = { ...participants[index], [field]: value };
      return { ...prev, participants };
    });
  };

  const addExtraNight = () => {
    setForm((prev) => ({
      ...prev,
      extraNights: [...prev.extraNights, { date: '', reason: '' }],
    }));
  };

  const removeExtraNight = (index) => {
    setForm((prev) => ({
      ...prev,
      extraNights: prev.extraNights.filter((_, i) => i !== index),
    }));
  };

  const updateExtraNight = (index, field, value) => {
    setForm((prev) => {
      const extraNights = [...prev.extraNights];
      extraNights[index] = { ...extraNights[index], [field]: value };
      return { ...prev, extraNights };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.hotelId) newErrors.hotelId = 'Veuillez sélectionner un hôtel';
    if (!form.checkIn) newErrors.checkIn = 'Date requise';
    if (!form.checkOut) newErrors.checkOut = 'Date requise';
    if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) {
      newErrors.checkOut = 'Doit être après le check-in';
    }

    const hasEmptyParticipant = form.participants.some(
      (p) => !p.nom.trim() || !p.prenom.trim()
    );
    if (hasEmptyParticipant) {
      newErrors.participants = 'Tous les participants sont requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <form id="reservation-form" onSubmit={handleSubmit}>
      <div className="flex-col gap-6">
        {/* Hotel & Room Type */}
        <div className="form-row">
          <Select
            id="reservation-hotel-select"
            label="Hôtel"
            required
            options={hotelOptions}
            value={form.hotelId}
            onChange={(e) => updateField('hotelId', e.target.value)}
            error={errors.hotelId}
          />
          <Select
            id="reservation-room-type-select"
            label="Type de chambre"
            required
            options={roomTypes}
            value={form.roomType}
            onChange={(e) => updateField('roomType', e.target.value)}
          />
        </div>

        {/* Category */}
        <Select
          id="reservation-category-select"
          label="Catégorie"
          required
          options={categories}
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
        />

        {/* Conditional fields based on category */}
        {form.category === 'Artiste' && (
          <Input
            id="reservation-band-name"
            label="Nom du groupe / artiste"
            value={form.bandName}
            onChange={(e) => updateField('bandName', e.target.value)}
            placeholder="Ex: Les Flammes"
          />
        )}

        {form.category === 'Organisation' && (
          <Input
            id="reservation-team-role"
            label="Rôle / Équipe"
            value={form.teamRole}
            onChange={(e) => updateField('teamRole', e.target.value)}
            placeholder="Ex: Sécurité, Technique, Logistique"
          />
        )}

        {/* Participants */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: 'var(--font-size-base)' }}>
              Participants ({form.participants.length}/{roomCapacity[form.roomType]})
            </h3>
          </div>
          {errors.participants && (
            <span className="form-error">{errors.participants}</span>
          )}
          {form.participants.map((p, i) => (
            <div className="form-row" key={i}>
              <Input
                id={`reservation-participant-${i}-nom`}
                label={`Nom #${i + 1}`}
                required
                value={p.nom}
                onChange={(e) => updateParticipant(i, 'nom', e.target.value)}
                placeholder="Nom de famille"
              />
              <Input
                id={`reservation-participant-${i}-prenom`}
                label={`Prénom #${i + 1}`}
                required
                value={p.prenom}
                onChange={(e) => updateParticipant(i, 'prenom', e.target.value)}
                placeholder="Prénom"
              />
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="form-row">
          <Input
            id="reservation-checkin"
            label="Check-in"
            type="date"
            required
            value={form.checkIn}
            onChange={(e) => updateField('checkIn', e.target.value)}
            error={errors.checkIn}
          />
          <Input
            id="reservation-checkout"
            label="Check-out"
            type="date"
            required
            value={form.checkOut}
            onChange={(e) => updateField('checkOut', e.target.value)}
            error={errors.checkOut}
          />
        </div>

        {/* Extra Nights */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title" style={{ fontSize: 'var(--font-size-base)' }}>
              Nuits supplémentaires
            </h3>
            <Button
              id="reservation-add-extra-night-btn"
              variant="ghost"
              size="sm"
              icon={Plus}
              type="button"
              onClick={addExtraNight}
            >
              Ajouter
            </Button>
          </div>
          {form.extraNights.map((night, i) => (
            <div className="form-row" key={i} style={{ alignItems: 'flex-end' }}>
              <Input
                id={`reservation-extra-night-${i}-date`}
                label={`Date nuit #${i + 1}`}
                type="date"
                value={night.date}
                onChange={(e) => updateExtraNight(i, 'date', e.target.value)}
              />
              <Input
                id={`reservation-extra-night-${i}-reason`}
                label="Raison"
                value={night.reason}
                onChange={(e) => updateExtraNight(i, 'reason', e.target.value)}
                placeholder="Ex: Arrivée anticipée"
              />
              <Button
                id={`reservation-remove-extra-night-${i}-btn`}
                variant="danger"
                size="sm"
                iconOnly
                icon={Trash2}
                type="button"
                onClick={() => removeExtraNight(i)}
              />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="reservation-notes" className="form-label">
            Notes
          </label>
          <textarea
            id="reservation-notes"
            className="form-textarea"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Informations complémentaires..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="form-actions">
          <Button
            id="reservation-cancel-btn"
            variant="secondary"
            type="button"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button id="reservation-submit-btn" variant="primary" type="submit">
            {reservation ? 'Modifier' : 'Créer la réservation'}
          </Button>
        </div>
      </div>
    </form>
  );
}
