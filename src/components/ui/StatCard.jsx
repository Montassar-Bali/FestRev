import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  value,
  label,
  accent = 'gold',
  id,
  index = 0,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      id={id}
      className="stat-card"
      style={{ '--stat-accent': `var(--color-${accent})` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -2 }}
    >
      {Icon && (
        <div className={`stat-card-icon ${accent}`}>
          <Icon size={24} />
        </div>
      )}
      <div className="stat-card-content">
        <div className="stat-card-value">{displayValue}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </motion.div>
  );
}
