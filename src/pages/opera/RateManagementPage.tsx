import {PageWrapper} from "@/components/layout/PageWrapper";
import {RateManagement} from "@/components/opera/RateManagement";
import {useNavigate} from "react-router-dom";

export default function RateManagementPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Rate Management"
      subtitle="Manage room rates and pricing plans"
    >
      <RateManagement
        onAddRate={() => {
          navigate('/rate-plans/new');
        }}
        onEditRate={(rate) => {
          navigate(`/rate-plans/${rate.id}/edit`);
        }}
        onDeleteRate={(rateId) => {
          console.log("Delete rate:", rateId);
        }}
      />
    </PageWrapper>
  );
}

