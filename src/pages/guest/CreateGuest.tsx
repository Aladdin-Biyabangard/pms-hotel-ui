import {useNavigate} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {GuestForm} from "@/components/guest/GuestForm";
import {GuestResponse} from "@/api/guests";
import {toast} from "sonner";

export default function CreateGuest() {
  const navigate = useNavigate();

  const handleSuccess = (guest: GuestResponse) => {
    toast.success("Guest created successfully");
    navigate("/guests");
  };

  const handleCancel = () => {
    navigate("/guests");
  };

  return (
    <PageWrapper
      title="Create Guest"
      subtitle="Add a new guest to the system"
    >
      <div className="max-w-6xl mx-auto">
        <GuestForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

