'use client';
import { useRouter } from 'next/navigation';
import {
  PackageCheck,
  PackageOpen,
  Landmark,
  ArrowRightLeft,
  Warehouse,
  FileBarChart2,
  ClipboardList,
  Trash2,
  UserCog,
} from 'lucide-react';

const STEPS = [
  { label: 'In Bound',       Icon: PackageCheck,    href: '/asset-portfolio/asset-management/inbound' },
  { label: 'Out Bound',      Icon: PackageOpen,     href: '/asset-portfolio/asset-management/outbound' },
  { label: 'Capitalization', Icon: Landmark,        href: '/asset-portfolio/asset-management/capitalization' },
  { label: 'Asset Movement', Icon: ArrowRightLeft,  href: '/asset-portfolio/asset-management/asset-movement' },
  { label: 'WH to WH',       Icon: Warehouse,       href: '/asset-portfolio/asset-management/wh-to-wh' },
  { label: 'Reports',        Icon: FileBarChart2,   href: '/asset-portfolio/asset-management/reports' },
  { label: 'Physical Audit', Icon: ClipboardList,   href: '/asset-portfolio/asset-management/physical-audit' },
  { label: 'Disposal',       Icon: Trash2,          href: '/asset-portfolio/asset-management/disposal' },
  { label: 'Admin',          Icon: UserCog,         href: '/asset-portfolio/asset-management/admin' },
];

export default function AssetManagementPage() {
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
                background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
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
              {/* Step number badge */}
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
                className="text-white/80 group-hover:text-white text-sm font-semibold text-center leading-tight transition-colors px-2"
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
