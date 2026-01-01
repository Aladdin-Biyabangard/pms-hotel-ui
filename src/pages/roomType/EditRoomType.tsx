import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {RoomTypeForm} from '@/components/roomType';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent} from '@/components/ui/card';

export default function EditRoomType() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRoomType();
    }
  }, [id]);

  const loadRoomType = async () => {
    try {
      setIsLoading(true);
      const data = await roomTypeApi.getRoomType(parseInt(id!));
      setRoomType(data);
    } catch (error: any) {
      console.error('Failed to load room type', error);
      toast.error(error?.response?.data?.message || 'Failed to load room type');
      navigate('/room-types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (updatedRoomType: RoomTypeResponse) => {
    navigate('/room-types');
  };

  const handleCancel = () => {
    navigate('/room-types');
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Room Type" subtitle="Update room type information">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-32" />
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (!roomType) {
    return (
      <PageWrapper title="Edit Room Type" subtitle="Room type not found">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Room type not found</p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Room Type"
      subtitle={`Editing: ${roomType.name}`}
    >
      <div className="max-w-4xl mx-auto">
        <RoomTypeForm roomType={roomType} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

