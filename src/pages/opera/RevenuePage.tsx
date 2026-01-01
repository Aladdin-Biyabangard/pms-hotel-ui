import {PageWrapper} from "@/components/layout/PageWrapper";
import {RevenueDashboard} from "@/components/opera/RevenueDashboard";

export default function RevenuePage() {
  return (
    <PageWrapper
      title="Revenue Management"
      subtitle="Revenue analytics and performance metrics"
    >
      <RevenueDashboard
        onPeriodChange={(period) => {
          console.log("Period changed:", period);
        }}
      />
    </PageWrapper>
  );
}

