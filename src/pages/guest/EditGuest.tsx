import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {GuestForm} from "@/components/guest/GuestForm";
import {GuestResponse, guestsApi} from "@/api/guests";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";

export default function EditGuest() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [guest, setGuest] = useState<GuestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGuest();
    }
  }, [id]);

  const loadGuest = async () => {
    try {
      setIsLoading(true);
      const guestData = await guestsApi.getGuestById(parseInt(id!));
      setGuest(guestData);
    } catch (error: any) {
      console.error("Failed to load guest", error);
      toast.error(error?.response?.data?.message || "Failed to load guest");
      navigate("/guests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (updatedGuest: GuestResponse) => {
    toast.success("Guest updated successfully");
    navigate(`/guests/${updatedGuest.id}`);
  };

  const handleCancel = () => {
    navigate("/guests");
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Guest" subtitle="Update guest information">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (!guest) {
    return (
      <PageWrapper title="Edit Guest" subtitle="Guest not found">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">Guest not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Guest"
      subtitle={`Editing ${guest.firstName} ${guest.lastName}`}
    >
      <div className="max-w-6xl mx-auto">
        <GuestForm guest={guest} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

