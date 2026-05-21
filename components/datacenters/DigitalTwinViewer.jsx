'use client';
import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Server } from 'lucide-react';
import HotspotCard from './HotspotCard';

const ExteriorModel3D = dynamic(() => import('./ExteriorModel3D'), { ssr: false });
const InteriorModel3D = dynamic(() => import('./InteriorModel3D'), { ssr: false });

export default function DigitalTwinViewer({ dc, zoneHealth, onHotspotChange }) {
  const [view, setView] = useState('exterior');
  const [activeHotspot, setActiveHotspot] = useState(null);
  const containerRef = useRef(null);

  const handleHotspotClick = useCallback((zoneId, canvasPos) => {
    setActiveHotspot({ zoneId, position: canvasPos });
    onHotspotChange?.(zoneId);
  }, [onHotspotChange]);

  const handleClose = useCallback(() => {
    setActiveHotspot(null);
    onHotspotChange?.(null);
  }, [onHotspotChange]);

  const handleToggle = (newView) => {
    setActiveHotspot(null);
    onHotspotChange?.(null);
    setView(newView);
  };

  const zoneData = activeHotspot ? zoneHealth?.[activeHotspot.zoneId] : null;

  return (
    <div ref={containerRef} className="w-full h-full relative flex flex-col">
      {/* Toggle bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1 p-0.5 bg-[#F4F6F9] rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => handleToggle('exterior')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === 'exterior'
                ? 'bg-[#0077C8] text-white shadow'
                : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            <Building2 size={13} />
            Outside View
          </button>
          <button
            onClick={() => handleToggle('interior')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              view === 'interior'
                ? 'bg-[#0077C8] text-white shadow'
                : 'text-[#64748b] hover:text-[#94a3b8]'
            }`}
          >
            <Server size={13} />
            Inside View
          </button>
        </div>

        {/* DC name tag */}
        <div className="text-right">
          <div className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-widest">Digital Twin</div>
          <div className="text-xs font-semibold text-[#0077C8]">{dc?.name}</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative overflow-hidden" onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}>
        <AnimatePresence mode="wait">
          {view === 'exterior' ? (
            <motion.div
              key="exterior"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <ExteriorModel3D dc={dc} zoneHealth={zoneHealth} onHotspotClick={handleHotspotClick} />
            </motion.div>
          ) : (
            <motion.div
              key="interior"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <InteriorModel3D dc={dc} zoneHealth={zoneHealth} onHotspotClick={handleHotspotClick} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hotspot card overlay */}
        {activeHotspot && zoneData && (
          <HotspotCard
            zoneId={activeHotspot.zoneId}
            zoneData={zoneData}
            position={activeHotspot.position}
            onClose={handleClose}
          />
        )}

        {/* View label pill */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
            view === 'exterior'
              ? 'bg-[#060e1a]/80 border-[#1e3050] text-[#60a5fa]'
              : 'bg-[#0a1220]/80 border-[#1e3050] text-[#34d399]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
              background: view === 'exterior' ? '#60a5fa' : '#34d399'
            }} />
            {view === 'exterior' ? 'EXTERIOR — SECURITY VIEW' : 'INTERIOR — OPERATIONAL VIEW'}
          </div>
        </div>

        {/* Hotspot hint */}
        {!activeHotspot && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="text-[10px] text-[#6B7280] font-mono bg-white/70 px-3 py-1 rounded-full border border-[#E2E8F0]">
              Click glowing markers to inspect zones
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
