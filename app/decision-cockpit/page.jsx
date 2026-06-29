import { Suspense } from 'react';
import DecisionCockpitClient from './DecisionCockpitClient';

export default function DecisionCockpitPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <DecisionCockpitClient />
    </Suspense>
  );
}
