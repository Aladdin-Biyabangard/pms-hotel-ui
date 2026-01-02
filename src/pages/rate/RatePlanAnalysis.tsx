import { PageWrapper } from '@/components/layout/PageWrapper';
import { RatePlanAnalysisDashboard } from '@/modules/rate/components/shared';

export default function RatePlanAnalysis() {
  return (
    <PageWrapper
      title="Rate Plan Analysis"
      subtitle="Comprehensive analytics for rate plan pricing strategy and performance"
    >
      <RatePlanAnalysisDashboard />
    </PageWrapper>
  );
}
