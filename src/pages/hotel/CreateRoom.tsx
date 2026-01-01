import {useNavigate} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {RoomForm} from "@/components/hotel/RoomForm";
import {RoomResponse} from "@/api/hotel";
import {toast} from "sonner";

export default function CreateRoom() {
  const navigate = useNavigate();

  const handleSuccess = (room: RoomResponse) => {
    toast.success("Room created successfully");
    navigate("/rooms");
  };

  const handleCancel = () => {
    navigate("/rooms");
  };

  return (
    <PageWrapper
      title="Create Room"
      subtitle="Add a new room to the hotel"
    >
      <div className="max-w-6xl mx-auto">
        <RoomForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

