import {useNavigate, useParams} from "react-router-dom";
import {RatePlanForm} from "../components/forms/RatePlanForm";
import {RatePlanResponse, RatePlanPageLayout, useRatePlan} from "../..";
import {toast} from "sonner";

export default function EditRatePlan() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {ratePlan, isLoading, error, notFound} = useRatePlan(id);

  const handleSuccess = (updatedRatePlan: RatePlanResponse) => {
    toast.success("Rate plan updated successfully");
    navigate(`/rate-plans/${updatedRatePlan.id}`);
  };

  const handleCancel = () => {
    navigate("/rate-plans");
  };

  return (
    <RatePlanPageLayout
      title="Edit Rate Plan"
      subtitle={ratePlan ? `Editing ${ratePlan.name}` : "Update rate plan information"}
      isLoading={isLoading}
      error={error}
      notFound={notFound}
      notFoundMessage="Rate plan not found"
      loadingTitle="Loading rate plan..."
    >
      {ratePlan && (
        <RatePlanForm ratePlan={ratePlan} onSuccess={handleSuccess} onCancel={handleCancel} />
      )}
    </RatePlanPageLayout>
  );
}

