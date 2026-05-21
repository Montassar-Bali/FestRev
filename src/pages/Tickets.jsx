import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Ticket,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Trash
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import TicketForm from '../components/tickets/TicketForm';

export default function Tickets() {
  const {
    tickets,
    loading,
    addTicket,
    updateTicket,
    softDeleteTicket,
    restoreTicket,
    deleteTicket,
    toggleCompost
  } = useTicketStore();

  const [search, setSearch] = useState('');
  const [filterTypology, setFilterTypology] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterComposted, setFilterComposted] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [permDeleteConfirm, setPermDeleteConfirm] = useState(null);

  // Dynamic filter options aggregated from actual data
  const typologyOptions = useMemo(() => {
    const set = new Set(tickets.map(t => t.typologie).filter(Boolean));
    return Array.from(set).sort();
  }, [tickets]);

  const categoryOptions = useMemo(() => {
    const set = new Set(tickets.map(t => t.categorieFamille).filter(Boolean));
    return Array.from(set).sort();
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      // Deletion filter
      if (!showDeleted && t.supprime === 1) return false;
      if (showDeleted && t.supprime !== 1) {
        // If showing deleted, we filter to show only deleted
        // Or we can show both. Showing both is better when the checkbox is "Afficher les billets supprimés"
        // Let's make "showDeleted" an inclusion filter: if false, exclude deleted. If true, include them.
      }

      // Dropdown filters
      if (filterTypology && t.typologie !== filterTypology) return false;
      if (filterCategory && t.categorieFamille !== filterCategory) return false;
      if (filterStatus && t.statutBillet !== filterStatus) return false;
      
      if (filterComposted !== '') {
        const isComposted = Number(t.composte) === 1;
        if (filterComposted === '1' && !isComposted) return false;
        if (filterComposted === '0' && isComposted) return false;
      }

      // Search filter
      if (search) {
        const term = search.toLowerCase();
        const buyerName = `${t.prenomAcheteur} ${t.nomAcheteur}`.toLowerCase();
        const participantName = `${t.prenomParticipant} ${t.nomParticipant}`.toLowerCase();
        const emailA = (t.emailAcheteur || '').toLowerCase();
        const emailP = (t.emailParticipant || '').toLowerCase();
        const cmdNum = (t.nCommande || '').toLowerCase();
        const tktNum = (t.nBillet || '').toLowerCase();
        const barcode = String(t.codeBarres || '');

        const matchesSearch =
          buyerName.includes(term) ||
          participantName.includes(term) ||
          emailA.includes(term) ||
          emailP.includes(term) ||
          cmdNum.includes(term) ||
          tktNum.includes(term) ||
          barcode.includes(term) ||
          (t.tarif || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [tickets, search, filterTypology, filterCategory, filterStatus, filterComposted, showDeleted]);

  const handleCreate = () => {
    setEditingTicket(null);
    setModalOpen(true);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingTicket) {
      updateTicket(editingTicket.id, formData);
    } else {
      addTicket(formData);
    }
    setModalOpen(false);
    setEditingTicket(null);
  };

  const handleSoftDelete = (id) => {
    softDeleteTicket(id);
    setDeleteConfirm(null);
  };

  const handlePermanentDelete = (id) => {
    deleteTicket(id);
    setPermDeleteConfirm(null);
  };

  const handleRestore = (id) => {
    restoreTicket(id);
  };

  const handleToggleCompost = (id, currentVal) => {
    toggleCompost(id, currentVal);
  };

  if (loading) {
    return (
      <PageWrapper id="tickets-loading-page">
        <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="loader" style={{ borderTopColor: 'var(--color-primary)' }} />
          <p className="text-secondary">Chargement de la base de données de billets...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper id="tickets-page">
      <div className="page-grid">
        
        {/* Toolbar & Filters */}
        <div className="flex-col gap-4">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <h2 className="text-xl font-bold flex-row items-center gap-2">
              <Ticket size={24} className="text-primary" />
              Gestion des Billets
            </h2>
            <Button id="tickets-add-btn" icon={Plus} onClick={handleCreate}>
              Nouveau Billet
            </Button>
          </div>

          <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div className="search-input-wrapper" style={{ flex: '1 1 250px' }}>
              <Search size={16} className="search-icon" />
              <input
                id="tickets-search"
                className="form-input"
                type="text"
                placeholder="Rechercher par nom, email, commande, code-barres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              id="tickets-filter-typology"
              className="form-select"
              value={filterTypology}
              onChange={(e) => setFilterTypology(e.target.value)}
            >
              <option value="">Toutes typologies</option>
              {typologyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              id="tickets-filter-category"
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Toutes catégories</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              id="tickets-filter-status"
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="Payé">Payé</option>
              <option value="Remboursé">Remboursé</option>
              <option value="En attente">En attente</option>
            </select>

            <select
              id="tickets-filter-composted"
              className="form-select"
              value={filterComposted}
              onChange={(e) => setFilterComposted(e.target.value)}
            >
              <option value="">Compostage (Tous)</option>
              <option value="1">Compostés</option>
              <option value="0">Non compostés</option>
            </select>

            <label className="flex-row items-center gap-2 text-sm select-none" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="tickets-show-deleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              Afficher supprimés
            </label>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState
            id="tickets-empty"
            icon={Ticket}
            title="Aucun billet trouvé"
            message={
              tickets.length === 0
                ? 'Commencez par ajouter votre premier billet.'
                : 'Essayez de modifier ou vider vos filtres de recherche.'
            }
            actionLabel={tickets.length === 0 ? 'Créer un billet' : undefined}
            onAction={tickets.length === 0 ? handleCreate : undefined}
          />
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" id="tickets-table">
              <thead>
                <tr>
                  <th>N° Commande / Billet</th>
                  <th>Typologie & Catégorie</th>
                  <th>Acheteur</th>
                  <th>Participant</th>
                  <th>Prix TTC</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'center' }}>Composté</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((t) => {
                    const isComposted = Number(t.composte) === 1;
                    const isDeleted = Number(t.supprime) === 1;

                    return (
                      <motion.tr
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isDeleted ? 0.65 : 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className={isDeleted ? 'row-deleted' : ''}
                      >
                        {/* Order & Ticket No */}
                        <td>
                          <div className="flex-col">
                            <span className="font-medium text-sm">{t.nCommande || '—'}</span>
                            <span className="text-xs text-secondary">{t.nBillet || '—'}</span>
                          </div>
                        </td>

                        {/* Typology & Cat */}
                        <td>
                          <div className="flex-col">
                            <span className="text-sm font-medium">{t.typologie || '—'}</span>
                            <span className="text-xs text-secondary">{t.categorieFamille} ({t.tarif || '—'})</span>
                          </div>
                        </td>

                        {/* Buyer */}
                        <td>
                          <div className="flex-col">
                            <span className="text-sm font-medium">{t.prenomAcheteur} {t.nomAcheteur}</span>
                            <span className="text-xs text-secondary">{t.emailAcheteur || '—'}</span>
                          </div>
                        </td>

                        {/* Participant */}
                        <td>
                          <div className="flex-col">
                            <span className="text-sm font-medium">{t.prenomParticipant} {t.nomParticipant}</span>
                            <span className="text-xs text-secondary">{t.emailParticipant || '—'}</span>
                          </div>
                        </td>

                        {/* Paid Price */}
                        <td>
                          <span className="font-semibold text-sm">
                            {(Number(t.ttcPrixPaye) || 0).toLocaleString('fr-FR', { style: 'currency', currency: t.devise || 'EUR' })}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          {isDeleted ? (
                            <Badge category="Supprimé" />
                          ) : (
                            <Badge category={t.statutBillet} />
                          )}
                        </td>

                        {/* Composted (Instant toggle) */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            id={`ticket-compost-toggle-${t.id}`}
                            type="button"
                            onClick={() => handleToggleCompost(t.id, t.composte)}
                            className={`compost-toggle-btn ${isComposted ? 'composted' : 'not-composted'}`}
                            title={isComposted ? "Marquer comme non composté" : "Marquer comme composté"}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.2s, background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                          >
                            {isComposted ? (
                              <CheckCircle size={20} className="text-success-icon" style={{ color: 'var(--color-success)' }} />
                            ) : (
                              <Clock size={20} className="text-warning-icon" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions">
                            <Button
                              id={`ticket-edit-${t.id}`}
                              variant="ghost"
                              size="sm"
                              iconOnly
                              icon={Pencil}
                              onClick={() => handleEdit(t)}
                              aria-label="Modifier"
                              disabled={isDeleted}
                            />
                            {isDeleted ? (
                              <>
                                <Button
                                  id={`ticket-restore-${t.id}`}
                                  variant="ghost"
                                  size="sm"
                                  iconOnly
                                  icon={RefreshCw}
                                  onClick={() => handleRestore(t.id)}
                                  aria-label="Restaurer"
                                  title="Restaurer le billet"
                                />
                                <Button
                                  id={`ticket-permdelete-${t.id}`}
                                  variant="ghost"
                                  size="sm"
                                  iconOnly
                                  icon={Trash}
                                  onClick={() => setPermDeleteConfirm(t.id)}
                                  aria-label="Supprimer Définitivement"
                                  title="Supprimer définitivement"
                                  style={{ color: 'var(--color-danger)' }}
                                />
                              </>
                            ) : (
                              <Button
                                id={`ticket-delete-${t.id}`}
                                variant="ghost"
                                size="sm"
                                iconOnly
                                icon={Trash2}
                                onClick={() => setDeleteConfirm(t.id)}
                                aria-label="Supprimer (Corbeille)"
                                title="Supprimer"
                              />
                            )}
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
            {filtered.length} billet{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        id="ticket-modal"
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTicket(null);
        }}
        title={editingTicket ? 'Modifier le Billet' : 'Créer un Nouveau Billet'}
        large
      >
        <TicketForm
          ticket={editingTicket}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingTicket(null);
          }}
        />
      </Modal>

      {/* Soft Delete Confirmation */}
      <Modal
        id="delete-confirm-modal"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmer la suppression (Corbeille)"
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
              onClick={() => handleSoftDelete(deleteConfirm)}
            >
              Supprimer
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Êtes-vous sûr de vouloir envoyer ce billet à la corbeille ? Il sera masqué mais pourra être restauré plus tard.
        </p>
      </Modal>

      {/* Permanent Delete Confirmation */}
      <Modal
        id="permdelete-confirm-modal"
        isOpen={!!permDeleteConfirm}
        onClose={() => setPermDeleteConfirm(null)}
        title="Suppression DÉFINITIVE"
        footer={
          <>
            <Button
              id="permdelete-confirm-cancel-btn"
              variant="secondary"
              onClick={() => setPermDeleteConfirm(null)}
            >
              Annuler
            </Button>
            <Button
              id="permdelete-confirm-ok-btn"
              variant="danger"
              icon={Trash}
              onClick={() => handlePermanentDelete(permDeleteConfirm)}
            >
              Supprimer Définitivement
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>
          Attention : Cette action supprimera définitivement le billet de la base de données. Cette opération est irréversible.
        </p>
      </Modal>

    </PageWrapper>
  );
}
