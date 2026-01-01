import {useNavigate} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {RatePlanForm} from "@/components/rate/RatePlanForm";
import {RatePlanResponse} from "@/api/ratePlan";
import {toast} from "sonner";

export default function CreateRatePlan() {
  const navigate = useNavigate();

  const handleSuccess = (ratePlan: RatePlanResponse) => {
    toast.success("Rate plan created successfully");
    navigate("/rate-plans");
  };

  const handleCancel = () => {
    navigate("/rate-plans");
  };

  return (
    <PageWrapper
      title="Create Rate Plan"
      subtitle="Add a new rate plan"
    >
      <div className="max-w-6xl mx-auto">
        <RatePlanForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

