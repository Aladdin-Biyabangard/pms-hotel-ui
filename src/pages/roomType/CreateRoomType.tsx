import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {RoomTypeForm} from '@/components/roomType';
import {RoomTypeResponse} from '@/api/roomType';

export default function CreateRoomType() {
  const navigate = useNavigate();

  const handleSuccess = (roomType: RoomTypeResponse) => {
    navigate('/room-types');
  };

  const handleCancel = () => {
    navigate('/room-types');
  };

  return (
    <PageWrapper
      title="Create Room Type"
      subtitle="Add a new room category to your hotel"
    >
      <div className="max-w-4xl mx-auto">
        <RoomTypeForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  );
}

