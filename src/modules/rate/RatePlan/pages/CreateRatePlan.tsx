import {useNavigate} from "react-router-dom";
import {RatePlanForm} from "../components/forms/RatePlanForm";
import {RatePlanResponse, RatePlanPageLayout} from "../..";
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
    <RatePlanPageLayout
      title="Create Rate Plan"
      subtitle="Add a new rate plan"
    >
      <RatePlanForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </RatePlanPageLayout>
  );
}

