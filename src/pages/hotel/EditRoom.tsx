import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {RoomForm} from "@/components/hotel/RoomForm";
import {hotelApi, RoomResponse} from "@/api/hotel";
import {toast} from "sonner";
import {Skeleton} from "@/components/ui/skeleton";

export default function EditRoom() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRoom();
    }
  }, [id]);

  const loadRoom = async () => {
    try {
      setIsLoading(true);
      const roomData = await hotelApi.getRoomById(parseInt(id!));
      setRoom(roomData);
    } catch (error: any) {
      console.error("Failed to load room", error);
      toast.error(error?.response?.data?.message || "Failed to load room");
      navigate("/rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (updatedRoom: RoomResponse) => {
    toast.success("Room updated successfully");
    navigate(`/rooms/${updatedRoom.id}`);
  };

  const handleCancel = () => {
    navigate("/rooms");
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Room" subtitle="Update room information">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (!room) {
    return (
      <PageWrapper title="Edit Room" subtitle="Room not found">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">Room not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Room"
      subtitle={`Editing room ${room.roomNumber}`}
    >
      <div className="max-w-6xl mx-auto">
        <RoomForm room={room} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

