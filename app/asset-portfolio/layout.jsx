'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe2, Table2, Boxes, Building2, LayoutDashboard } from 'lucide-react';
import PortfolioAgentPanel from '@/components/asset-portfolio/PortfolioAgentPanel';

const TABS = [
  { href: '/asset-portfolio', label: 'Globe', Icon: Globe2 },
  { href: '/asset-portfolio/assets', label: 'Assets', Icon: Table2 },
  { href: '/asset-portfolio/asset-management', label: 'Asset Lifecycle', Icon: Boxes },
  { href: '/asset-portfolio/dashboards', label: 'Dashboards', Icon: LayoutDashboard },
];

export default function AssetPortfolioLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-grey-border bg-white px-6 py-3 flex items-center gap-6 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-navy/10 flex items-center justify-center">
            <Building2 size={14} className="text-navy" />
          </div>
          <span className="font-extrabold text-text-primary text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Asset Portfolio
          </span>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(({ href, label, Icon }) => {
            const active = href === '/asset-portfolio' ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? 'bg-navy text-white' : 'text-text-secondary hover:bg-grey-bg'
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}

      <PortfolioAgentPanel />
    </div>
  );
}
