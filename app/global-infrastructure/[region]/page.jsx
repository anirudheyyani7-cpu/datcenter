'use client';
import { notFound, useParams } from 'next/navigation';
import CCLayout from '@/components/command-center/CCLayout';
import RegionalIntelligencePage from '@/modules/global-infrastructure/pages/RegionalIntelligencePage';
import { isValidRegion, REGION_LABELS } from '@/modules/global-infrastructure/utils/regions';

export default function RegionPage() {
  const { region } = useParams();

  if (!isValidRegion(region)) {
    notFound();
  }

  return (
    <CCLayout title={`Regional Intelligence — ${REGION_LABELS[region]}`}>
      {({ showToast }) => <RegionalIntelligencePage region={region} showToast={showToast} />}
    </CCLayout>
  );
}
