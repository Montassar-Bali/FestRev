import { motion } from 'framer-motion';
import {
  CalendarDays,
  Building2,
  Users,
  Crown,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useReservationStore } from '../store/reservationStore';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

const roomTypeLabels = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quadruple',
};

export default function Dashboard() {
  const { hotels, reservations, getStats } = useReservationStore();
  const navigate = useNavigate();
  const stats = getStats();

  const recentReservations = [...reservations]
    .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
    .slice(0, 5);

  return (
    <PageWrapper id="dashboard-page">
      <div className="page-grid">
        {/* Stat Cards */}
        <section className="stats-grid" aria-label="Statistiques">
          <StatCard
            id="stat-total-reservations"
            icon={CalendarDays}
            value={stats.totalReservations}
            label="Réservations"
            accent="gold"
            index={0}
          />
          <StatCard
            id="stat-total-hotels"
            icon={Building2}
            value={stats.totalHotels}
            label="Hôtels"
            accent="teal"
            index={1}
          />
          <StatCard
            id="stat-total-participants"
            icon={Users}
            value={stats.totalParticipants}
            label="Participants"
            accent="info"
            index={2}
          />
          <StatCard
            id="stat-vip-count"
            icon={Crown}
            value={stats.vipCount}
            label="VIP"
            accent="gold"
            index={3}
          />
        </section>

        {/* Hotels Overview */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Aperçu des Hôtels</h2>
              <p className="section-subtitle">Occupation par établissement</p>
            </div>
            <motion.button
              id="dashboard-view-all-hotels-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/hotels')}
              whileHover={{ x: 4 }}
            >
              Voir tout <ArrowRight size={14} />
            </motion.button>
          </div>

          {hotels.length === 0 ? (
            <EmptyState
              id="dashboard-no-hotels"
              icon={Building2}
              title="Aucun hôtel"
              message="Ajoutez des hôtels pour commencer à gérer vos réservations."
              actionLabel="Ajouter un hôtel"
              onAction={() => navigate('/hotels')}
            />
          ) : (
            <div className="cards-grid">
              {hotels.map((hotel, index) => {
                const hotelReservations = reservations.filter(
                  (r) => r.hotelId === hotel.id
                );
                const participantCount = hotelReservations.reduce(
                  (sum, r) => sum + (r.participants?.length || 0),
                  0
                );

                return (
                  <motion.div
                    key={hotel.id}
                    id={`dashboard-hotel-card-${hotel.id}`}
                    className="hotel-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate('/hotels')}
                  >
                    <div className="hotel-card-header">
                      <h3 className="hotel-card-name">{hotel.name}</h3>
                      <div className="hotel-card-stars">
                        {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <div className="hotel-card-stats">
                      <div className="hotel-card-stat">
                        <span className="hotel-card-stat-value">
                          {hotelReservations.length}
                        </span>
                        <span className="hotel-card-stat-label">Réservations</span>
                      </div>
                      <div className="hotel-card-stat">
                        <span className="hotel-card-stat-value">{participantCount}</span>
                        <span className="hotel-card-stat-label">Participants</span>
                      </div>
                    </div>
                    <div className="hotel-card-bar">
                      <div
                        className="hotel-card-bar-fill"
                        style={{
                          width: `${Math.min(
                            (hotelReservations.length / Math.max(reservations.length, 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Reservations */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Réservations Récentes</h2>
              <p className="section-subtitle">
                Les 5 dernières réservations ajoutées
              </p>
            </div>
            <motion.button
              id="dashboard-view-all-reservations-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/reservations')}
              whileHover={{ x: 4 }}
            >
              Voir tout <ArrowRight size={14} />
            </motion.button>
          </div>

          {recentReservations.length === 0 ? (
            <EmptyState
              id="dashboard-no-reservations"
              icon={CalendarDays}
              title="Aucune réservation"
              message="Les réservations apparaîtront ici dès qu'elles seront créées."
              actionLabel="Ajouter une réservation"
              onAction={() => navigate('/reservations')}
            />
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table" id="dashboard-recent-table">
                <thead>
                  <tr>
                    <th>Hôtel</th>
                    <th>Chambre</th>
                    <th>Participants</th>
                    <th>Catégorie</th>
                    <th>Check-in</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res, i) => {
                    const hotel = hotels.find((h) => h.id === res.hotelId);
                    return (
                      <motion.tr
                        key={res.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <td>{hotel?.name || '—'}</td>
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
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}
