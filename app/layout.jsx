import './globals.css';
import { createClient } from '@/lib/supabase-server';
import SupabaseProvider from '@/components/SupabaseProvider';

export const metadata = {
  title: 'K-Nexus — Datacenter Lifecycle Intelligence',
  description: "KPMG's AI-powered datacenter lifecycle management platform",
  icons: { icon: '/favicon.svg' },
};

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SupabaseProvider initialSession={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
