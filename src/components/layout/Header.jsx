import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const routeTitles = {
  '/': 'Tableau de Bord',
  '/reservations': 'Réservations',
  '/hotels': 'Hôtels',
  '/export': 'Exporter',
};

export default function Header() {
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
      <motion.h1
        className="header-title"
        key={title}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {title}
      </motion.h1>

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
