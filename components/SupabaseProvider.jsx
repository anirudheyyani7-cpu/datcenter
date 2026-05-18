'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import useAppStore from '@/store/appStore';

const SessionContext = createContext(null);

export function useSession() {
  return useContext(SessionContext);
}

export default function SupabaseProvider({ children, initialSession }) {
  const [session, setSession] = useState(initialSession ?? null);
  const supabase = createClient();
  const loadStageProgress = useAppStore((s) => s.loadStageProgress);

  useEffect(() => {
    if (initialSession) loadStageProgress();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) loadStageProgress();
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, supabase }}>
      {children}
    </SessionContext.Provider>
  );
}
