'use client';
import { motion } from 'framer-motion';

import KPIStrip from './KPIStrip';
import PortfolioHealthMap from './PortfolioHealthMap';
import IncidentCommandCenter from './IncidentCommandCenter';
import InfrastructureHealthMatrix from './InfrastructureHealthMatrix';
import CapacityUtilization from './CapacityUtilization';
import SustainabilityIntel from './SustainabilityIntel';
import AIOperationsFeed from './AIOperationsFeed';
import ContextPanel from './ContextPanel';
import CCLayout from './CCLayout';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  return (
    <CCLayout title="Command Center">
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="flex-1 overflow-y-auto">
          <KPIStrip />
          <div className="px-4 pb-6 space-y-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <PortfolioHealthMap />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <IncidentCommandCenter />
            </motion.div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <InfrastructureHealthMatrix />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <CapacityUtilization />
              </motion.div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <SustainabilityIntel />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <AIOperationsFeed />
              </motion.div>
            </div>
          </div>
        </div>
        <ContextPanel />
      </div>
    </CCLayout>
  );
}
