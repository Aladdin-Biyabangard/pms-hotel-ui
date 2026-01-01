import React from 'react';
import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {RoomTypeList} from '@/components/roomType';
import {RoomTypeResponse} from '@/api/roomType';
import {useAuth} from '@/context/AuthContext';

const RoomTypes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user can manage room types (admin or manager roles)
  const canManage = user?.role?.some(r => 
    ['ADMIN', 'HOTEL_ADMIN', 'MANAGER', 'REVENUE_MANAGER'].includes(r)
  ) ?? false;

  const handleCreate = () => {
    navigate('/room-types/new');
  };

  const handleEdit = (roomType: RoomTypeResponse) => {
    navigate(`/room-types/${roomType.id}/edit`);
  };

  const handleView = (roomType: RoomTypeResponse) => {
    navigate(`/room-types/${roomType.id}`);
  };

  const handleDelete = () => {
    // Refresh is handled in the list component
  };

  return (
    <PageWrapper 
      title="Room Type Management" 
      subtitle="Manage room categories and types for your hotel"
    >
      <div className="space-y-6">
        <RoomTypeList
          onCreate={canManage ? handleCreate : undefined}
          onEdit={canManage ? handleEdit : undefined}
          onDelete={canManage ? handleDelete : undefined}
          onView={handleView}
        />
      </div>
    </PageWrapper>
  );
};

export default RoomTypes;

