import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  DollarSign,
  QrCode,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useTicketStore } from '../store/ticketStore';
import PageWrapper from '../components/layout/PageWrapper';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { tickets, getStats, loading } = useTicketStore();
  const navigate = useNavigate();
  const stats = getStats();

  const recentTickets = useMemo(() => {
    // Sort active tickets by createdAt desc or dateCommande/heureCommande desc
    return [...tickets]
      .filter(t => t.supprime !== 1)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);
  }, [tickets]);

  // Aggregate category stats
  const categorySummary = useMemo(() => {
    const active = tickets.filter(t => t.supprime !== 1);
    const summary = {};
    active.forEach(t => {
      const cat = t.categorieFamille || 'Standard';
      if (!summary[cat]) {
        summary[cat] = { count: 0, revenue: 0 };
      }
      summary[cat].count++;
      summary[cat].revenue += Number(t.ttcPrixPaye) || 0;
    });
    return Object.entries(summary).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.revenue - a.revenue);
  }, [tickets]);

  const maxRevenue = useMemo(() => {
    if (categorySummary.length === 0) return 1;
    return Math.max(...categorySummary.map(c => c.revenue), 1);
  }, [categorySummary]);

  if (loading) {
    return (
      <PageWrapper id="dashboard-loading-page">
        <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="loader" style={{ borderTopColor: 'var(--color-primary)' }} />
          <p className="text-secondary">Chargement du tableau de bord...</p>
        </div>
      </PageWrapper>
    );
  }

  const formattedRevenue = stats.totalRevenue.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  const formattedCommission = stats.totalCommission.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  return (
    <PageWrapper id="dashboard-page">
      <div className="page-grid">
        
        {/* Stat Cards */}
        <section className="stats-grid" aria-label="Statistiques">
          <StatCard
            id="stat-total-tickets"
            icon={Ticket}
            value={stats.activeTicketsCount}
            label="Billets Actifs"
            accent="info"
            index={0}
          />
          <StatCard
            id="stat-total-revenue"
            icon={DollarSign}
            value={formattedRevenue}
            label="Chiffre d'Affaires"
            accent="gold"
            index={1}
          />
          <StatCard
            id="stat-composted-count"
            icon={QrCode}
            value={stats.compostedCount}
            label={`Compostés (${Math.round(stats.compostRate)}%)`}
            accent="success"
            index={2}
          />
          <StatCard
            id="stat-total-commission"
            icon={ShieldCheck}
            value={formattedCommission}
            label="Total Commission"
            accent="warning"
            index={3}
          />
        </section>

        {/* Categories Overview */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Ventes par Catégorie</h2>
              <p className="section-subtitle">Répartition du chiffre d'affaires par type de billet</p>
            </div>
            <motion.button
              id="dashboard-view-all-categories-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/tickets')}
              whileHover={{ x: 4 }}
            >
              Gérer les billets <ArrowRight size={14} />
            </motion.button>
          </div>

          {categorySummary.length === 0 ? (
            <EmptyState
              id="dashboard-no-categories"
              icon={Ticket}
              title="Aucune vente"
              message="Les statistiques par catégorie s'afficheront dès que des billets actifs seront créés."
              actionLabel="Créer un billet"
              onAction={() => navigate('/tickets')}
            />
          ) : (
            <div className="cards-grid">
              {categorySummary.map((cat, index) => {
                const pct = (cat.revenue / maxRevenue) * 100;
                return (
                  <motion.div
                    key={cat.name}
                    id={`dashboard-category-card-${index}`}
                    className="hotel-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate('/tickets')}
                  >
                    <div className="hotel-card-header">
                      <h3 className="hotel-card-name">{cat.name}</h3>
                      <div className="hotel-card-stars" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        {cat.count} billet{cat.count > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="hotel-card-stats">
                      <div className="hotel-card-stat">
                        <span className="hotel-card-stat-value">
                          {cat.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                        <span className="hotel-card-stat-label">Revenus</span>
                      </div>
                    </div>
                    <div className="hotel-card-bar">
                      <div
                        className="hotel-card-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Tickets */}
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Ventes Récentes</h2>
              <p className="section-subtitle">
                Les 5 derniers billets actifs ajoutés
              </p>
            </div>
            <motion.button
              id="dashboard-view-all-tickets-btn"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/tickets')}
              whileHover={{ x: 4 }}
            >
              Voir tout <ArrowRight size={14} />
            </motion.button>
          </div>

          {recentTickets.length === 0 ? (
            <EmptyState
              id="dashboard-no-tickets"
              icon={Ticket}
              title="Aucun billet"
              message="Les billets apparaîtront ici dès qu'ils seront importés ou créés."
              actionLabel="Créer un billet"
              onAction={() => navigate('/tickets')}
            />
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table" id="dashboard-recent-table">
                <thead>
                  <tr>
                    <th>Commande / Billet</th>
                    <th>Acheteur</th>
                    <th>Participant</th>
                    <th>Catégorie</th>
                    <th>Statut</th>
                    <th>Prix TTC</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <td>
                        <div className="flex-col">
                          <span className="font-medium">{t.nCommande || '—'}</span>
                          <span className="text-xs text-secondary">{t.nBillet || '—'}</span>
                        </div>
                      </td>
                      <td>{t.prenomAcheteur} {t.nomAcheteur}</td>
                      <td>{t.prenomParticipant} {t.nomParticipant}</td>
                      <td>
                        <div className="flex-col">
                          <span className="text-xs">{t.typologie}</span>
                          <span className="text-xs text-secondary">{t.categorieFamille}</span>
                        </div>
                      </td>
                      <td>
                        <Badge category={t.statutBillet} />
                      </td>
                      <td className="font-semibold">
                        {(Number(t.ttcPrixPaye) || 0).toLocaleString('fr-FR', { style: 'currency', currency: t.devise || 'EUR' })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  );
}
