'use client';
import { useRouter } from 'next/navigation';
import {
  PackageSearch,
  Send,
  Landmark,
  Repeat2,
  Building2,
  FileBarChart2,
  ClipboardCheck,
  ServerOff,
  Settings2,
} from 'lucide-react';

const STEPS = [
  { label: 'Asset Receiving\n(GRN)',        Icon: PackageSearch,  href: '/asset-portfolio/asset-management/grn' },
  { label: 'Asset Dispatch',                Icon: Send,           href: '/asset-portfolio/asset-management/dispatch' },
  { label: 'FA Capitalization',             Icon: Landmark,       href: '/asset-portfolio/asset-management/capitalization' },
  { label: 'IMAC',                          Icon: Repeat2,        href: '/asset-portfolio/asset-management/imac' },
  { label: 'DC-to-DC\nTransfer',            Icon: Building2,      href: '/asset-portfolio/asset-management/dc-transfer' },
  { label: 'MIS & Reports',                 Icon: FileBarChart2,  href: '/asset-portfolio/asset-management/reports' },
  { label: 'Physical\nVerification (PV)',   Icon: ClipboardCheck, href: '/asset-portfolio/asset-management/pv' },
  { label: 'Decommission\n& Disposal',      Icon: ServerOff,      href: '/asset-portfolio/asset-management/decommission' },
  { label: 'Config & Admin',                Icon: Settings2,      href: '/asset-portfolio/asset-management/admin' },
];

export default function AssetLifecyclePage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%)' }}
    >
      <div className="w-full max-w-2xl px-8">
        <div className="grid grid-cols-3 gap-4">
          {STEPS.map(({ label, Icon, href }, index) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="group relative flex flex-col items-center justify-center gap-4 aspect-square rounded-2xl border border-white/10 transition-all duration-200 hover:scale-105 hover:border-white/30 hover:shadow-2xl"
              style={{
                backgroundImage: `
                  linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.015) 10px,
                    rgba(255,255,255,0.015) 11px
                  )
                `,
              }}
            >
              <span
                className="absolute top-3 left-3 text-[10px] font-bold text-white/30"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <Icon
                size={44}
                strokeWidth={1.4}
                className="text-white/80 group-hover:text-white transition-colors"
              />

              <span
                className="text-white/80 group-hover:text-white text-sm font-semibold text-center leading-tight transition-colors px-2 whitespace-pre-line"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
