import EAIShell from '@/components/eai/EAIShell';

export const metadata = { title: 'EAI Platform — Enterprise Asset Intelligence' };

export default function EAILayout({ children }) {
  return <EAIShell>{children}</EAIShell>;
}
