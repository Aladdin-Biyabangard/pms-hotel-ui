import {PageWrapper} from "@/components/layout/PageWrapper";
import {ChannelManagement} from "@/components/opera/ChannelManagement";

export default function ChannelManagementPage() {
  return (
    <PageWrapper
      title="Channel Management"
      subtitle="Manage OTA, GDS, and distribution channels"
    >
      <ChannelManagement />
    </PageWrapper>
  );
}

