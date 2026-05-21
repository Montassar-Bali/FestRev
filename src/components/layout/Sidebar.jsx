import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
  { to: '/reservations', label: 'Réservations', icon: CalendarDays },
  { to: '/hotels', label: 'Hôtels', icon: Building2 },
  { to: '/export', label: 'Exporter', icon: FileSpreadsheet },
];

const sidebarVariants = {
  hidden: { x: -260, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const linkVariants = {
  rest: { x: 0 },
  hover: { x: 4 },
};

export default function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      id="sidebar"
      className="sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <NavLink to="/" className="sidebar-logo-link">
          <motion.img
            src="/logo.png"
            alt="FestRev Logo"
            className="sidebar-logo-img"
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          />
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Navigation principale">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.to.replace('/', '') || 'dashboard'}`}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <motion.div
                className="flex-row gap-3"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}
                variants={linkVariants}
                initial="rest"
                whileHover="hover"
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">FestRev v1.0</p>
        <p className="sidebar-footer-text">Gestion Hôtelière</p>
      </div>
    </motion.aside>
  );
}
