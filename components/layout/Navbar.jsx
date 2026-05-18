'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, Globe, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from '@/components/SupabaseProvider';

const STAGES = [
  { num: '01', label: 'Strategy',     path: '/stage/01' },
  { num: '02', label: 'Sourcing',     path: '/stage/02' },
  { num: '03', label: 'Design & Build', path: '/stage/03' },
  { num: '04', label: 'Compliance',   path: '/stage/04' },
  { num: '05', label: 'Operations',   path: '/stage/05' },
  { num: '06', label: 'Monetization', path: '/stage/06' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { session, supabase } = useSession() ?? {};

  const isLanding = pathname === '/';
  const userInitial = session?.user?.email?.[0]?.toUpperCase() ?? 'K';

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: isLanding ? 3.5 : 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="bg-[#1A1F36]/95 border-b border-white/[0.08] h-full">
        <div className="max-w-screen-2xl mx-auto px-6 h-full flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#00338D] flex items-center justify-center">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K</span>
            </div>
            <div className="leading-none">
              <div className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>K-Nexus.AI</div>
              <div className="text-white/40 text-xs">Datacenter Lifecycle</div>
            </div>
          </Link>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe size={14} />
              Dashboard
            </Link>

            <Link
              href="/command-center"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/command-center' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={14} />
              Command Center
            </Link>

            {/* Stages dropdown */}
            <div className="relative">
              <button
                onClick={() => setStagesOpen(!stagesOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/stage') ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Lifecycle Stages
                <ChevronDown size={14} className={`transition-transform ${stagesOpen ? 'rotate-180' : ''}`} />
              </button>

              {stagesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-[#1A1F36] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  onMouseLeave={() => setStagesOpen(false)}
                >
                  {STAGES.map((s) => (
                    <Link
                      key={s.num}
                      href={s.path}
                      onClick={() => setStagesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <span className="text-[#0077C8] font-mono text-xs font-bold">{s.num}</span>
                      {s.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className={`flex-1 max-w-sm relative transition-all duration-200 ${searchFocused ? 'max-w-md' : ''}`}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search infrastructure hubs..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0077C8]/60 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <div className="flex-1" />

          {/* CTA */}
          <Link
            href="/stage/01"
            className="flex items-center gap-2 px-4 py-2 bg-[#00338D] hover:bg-[#0044b8] text-white text-sm font-semibold rounded-lg transition-colors shadow-lg"
          >
            <Plus size={15} />
            New Business Case
          </Link>

          {/* Avatar + user menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077C8] to-[#00338D] flex items-center justify-center cursor-pointer"
            >
              <span className="text-white text-xs font-bold">{userInitial}</span>
            </button>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 w-52 bg-[#1A1F36] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                {session?.user?.email && (
                  <div className="px-4 py-2.5 text-xs text-white/40 truncate border-b border-white/10">
                    {session.user.email}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
