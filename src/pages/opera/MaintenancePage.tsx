import {PageWrapper} from "@/components/layout/PageWrapper";
import {MaintenanceManagement} from "@/components/opera/MaintenanceManagement";

export default function MaintenancePage() {
  return (
    <PageWrapper
      title="Maintenance Management"
      subtitle="Track and manage maintenance requests"
    >
      <MaintenanceManagement />
    </PageWrapper>
  );
}

