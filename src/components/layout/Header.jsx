import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';

const routeTitles = {
  '/': 'Tableau de Bord',
  '/tickets': 'Billets',
  '/export': 'Exporter',
};

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'FestRev';

  return (
    <motion.header
      id="header"
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="header-left">
        <button
          id="sidebar-toggle-btn"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <motion.h1
          className="header-title"
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h1>
      </div>

      <div className="header-search" id="header-search">
        <div className="header-search-icon">
          <Search size={16} />
        </div>
        <input
          id="header-search-input"
          type="text"
          placeholder="Rechercher..."
          autoComplete="off"
        />
      </div>
    </motion.header>
  );
}
