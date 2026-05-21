import { motion } from 'framer-motion';

const categoryMap = {
  VIP: 'badge-vip',
  Artiste: 'badge-artist',
  Organisation: 'badge-org',
  Standard: 'badge-standard',
};

export default function Badge({ category, className = '', id }) {
  const badgeClass = categoryMap[category] || 'badge-standard';

  return (
    <motion.span
      id={id}
      className={`badge ${badgeClass} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {category}
    </motion.span>
  );
}
