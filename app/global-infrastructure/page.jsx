'use client';
import CCLayout from '@/components/command-center/CCLayout';
import GlobalInfrastructurePage from '@/modules/global-infrastructure/pages/GlobalInfrastructurePage';

export default function GlobalInfrastructure() {
  return (
    <CCLayout title="Global Infrastructure Intelligence">
      {({ showToast }) => <GlobalInfrastructurePage showToast={showToast} />}
    </CCLayout>
  );
}
