import { Suspense } from 'react';
import ClientCockpit from '@/components/pages/ClientCockpit';

export default function ClientCockpitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <ClientCockpit />
    </Suspense>
  );
}
