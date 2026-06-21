'use client';
import { motion } from 'framer-motion';

export const ACCENTS = {
  navy: '#00338D',
  accent: '#0077C8',
  success: '#00A36C',
  amber: '#D4A017',
  danger: '#DC2626',
};

export default function Card({ children, accent = ACCENTS.accent, onClick, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow overflow-hidden ${className}`}
      style={{ border: '1px solid #E2E8F0', borderLeft: `4px solid ${accent}` }}
    >
      {children}
    </motion.div>
  );
}
