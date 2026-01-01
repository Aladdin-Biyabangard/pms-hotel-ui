import {PageWrapper} from "@/components/layout/PageWrapper";
import {GroupManagement} from "@/components/opera/GroupManagement";
import {useNavigate} from "react-router-dom";

export default function GroupManagementPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Group Management"
      subtitle="Manage corporate groups, events, and conventions"
    >
      <GroupManagement
        onCreate={() => {
          console.log("Create new group");
        }}
        onEdit={(id) => {
          console.log("Edit group:", id);
        }}
        onDelete={(id) => {
          console.log("Delete group:", id);
        }}
      />
    </PageWrapper>
  );
}

