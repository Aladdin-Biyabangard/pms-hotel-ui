import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {RatePlanForm} from "@/components/rate/RatePlanForm";
import {ratePlanApi, RatePlanResponse} from "@/api/ratePlan";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";

export default function EditRatePlan() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [ratePlan, setRatePlan] = useState<RatePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRatePlan();
    }
  }, [id]);

  const loadRatePlan = async () => {
    try {
      setIsLoading(true);
      const ratePlanData = await ratePlanApi.getRatePlan(parseInt(id!));
      setRatePlan(ratePlanData);
    } catch (error: any) {
      console.error("Failed to load rate plan", error);
      toast.error(error?.response?.data?.message || "Failed to load rate plan");
      navigate("/rate-plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (updatedRatePlan: RatePlanResponse) => {
    toast.success("Rate plan updated successfully");
    navigate(`/rate-plans/${updatedRatePlan.id}`);
  };

  const handleCancel = () => {
    navigate("/rate-plans");
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Rate Plan" subtitle="Update rate plan information">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (!ratePlan) {
    return (
      <PageWrapper title="Edit Rate Plan" subtitle="Rate plan not found">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">Rate plan not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Rate Plan"
      subtitle={`Editing ${ratePlan.name}`}
    >
      <div className="max-w-6xl mx-auto">
        <RatePlanForm ratePlan={ratePlan} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

