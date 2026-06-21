'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Cpu } from 'lucide-react';
import { DECISION_QUICK_STARTS, CARD_MAPPING } from '@/data/decisionModules';

import HeroCard from '@/components/decision-cockpit/cards/HeroCard';
import TopLocationsCard from '@/components/decision-cockpit/cards/TopLocationsCard';
import PowerCard from '@/components/decision-cockpit/cards/PowerCard';
import RiskCard from '@/components/decision-cockpit/cards/RiskCard';
import CostCard from '@/components/decision-cockpit/cards/CostCard';
import ConnectivityCard from '@/components/decision-cockpit/cards/ConnectivityCard';
import FeasibilityCard from '@/components/decision-cockpit/cards/FeasibilityCard';
import InsightStrip from '@/components/decision-cockpit/cards/InsightStrip';
import DrillDownModal from '@/components/decision-cockpit/cards/DrillDownModal';

const CARD_COMPONENTS = {
  HeroCard, TopLocationsCard, PowerCard, RiskCard, CostCard, ConnectivityCard, FeasibilityCard,
};

export default function DecisionCockpitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [drillDown, setDrillDown] = useState(null); // module key or null

  const decisionType = searchParams.get('decision_type');
  const mode = searchParams.get('mode') || 'exploratory';
  const clientName = searchParams.get('client_name') || '';
  const location = searchParams.get('location') || '';
  const capacity = searchParams.get('capacity') || '';

  useEffect(() => {
    if (!decisionType) { setError('No decision_type specified.'); return; }
    let cancelled = false;
    setResult(null);
    setError(null);
    fetch('/api/decision-engine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision_type: decisionType,
        mode,
        client_name: clientName,
        location,
        capacity,
      }),
    })
      .then(res => res.json())
      .then(data => { if (!cancelled) { if (data.error) setError(data.error); else setResult(data); } })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [decisionType, mode, clientName, location, capacity]);

  const quickStart = DECISION_QUICK_STARTS.find(qs => qs.decision_type === decisionType);
  const heroKey = 'final_recommendation';
  const supportingKeys = result?.priority_order?.filter(k => k !== heroKey) ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex-shrink-0 bg-white border-b border-grey-border px-5 py-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg border border-grey-border flex items-center justify-center hover:bg-grey-bg transition-colors flex-shrink-0"
          >
            <X size={14} className="text-text-secondary" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Cpu size={14} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-text-primary text-sm leading-tight truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {quickStart?.title || 'Decision Cockpit'}
              </p>
              <p className="text-[9px] text-text-muted leading-tight">
                {mode === 'client_specific' ? `Client: ${clientName || '—'} · ${location || '—'}` : `Exploratory · ${location || 'Metro Region'}`}
                {capacity ? ` · ${capacity}MW` : ''}
              </p>
            </div>
          </div>
        </div>
        {result && (
          <div className="px-2.5 py-1.5 bg-grey-bg border border-grey-border rounded-lg flex-shrink-0">
            <span className="text-[9px] text-text-secondary font-medium">{result.selected_modules.length} modules selected</span>
          </div>
        )}
      </motion.div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden px-5 py-4 flex flex-col gap-3">
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-danger font-medium">{error}</p>
          </div>
        )}

        {!error && !result && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-xs text-text-muted">Running decision engine…</p>
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-4 gap-3 flex-shrink-0">
              <HeroCard data={result.modules[heroKey]} reason={result.reasoning[heroKey]} onClick={() => setDrillDown(heroKey)} />
            </div>

            <div
              className="grid gap-3 flex-shrink-0"
              style={{ gridTemplateColumns: `repeat(${Math.max(supportingKeys.length, 1)}, minmax(0, 1fr))` }}
            >
              {supportingKeys.map(key => {
                const Comp = CARD_COMPONENTS[CARD_MAPPING[key]];
                if (!Comp) return null;
                return (
                  <Comp key={key} data={result.modules[key]} reason={result.reasoning[key]} onClick={() => setDrillDown(key)} />
                );
              })}
            </div>

            <InsightStrip insights={result.insights} />
          </>
        )}
      </div>

      <DrillDownModal
        moduleKey={drillDown}
        data={drillDown ? result?.modules[drillDown] : null}
        reason={drillDown ? result?.reasoning[drillDown] : null}
        onClose={() => setDrillDown(null)}
      />
    </div>
  );
}
