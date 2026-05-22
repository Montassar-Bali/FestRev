import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Ticket,
  ScanLine,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
  { to: '/tickets', label: 'Billets', icon: Ticket },
  { to: '/scanner', label: 'Scanner', icon: ScanLine },
  { to: '/export', label: 'Exporter', icon: FileSpreadsheet },
  { to: '/admin', label: 'Admin (CSV)', icon: ShieldCheck },
];

const linkVariants = {
  rest: { x: 0 },
  hover: { x: 4 },
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <aside
      id="sidebar"
      className={`sidebar ${isOpen ? 'open' : ''}`}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <NavLink to="/" className="sidebar-logo-link" onClick={onClose}>
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
              onClick={onClose}
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
        <p className="sidebar-footer-text">Gestion Billetterie</p>
      </div>
    </aside>
  );
}
