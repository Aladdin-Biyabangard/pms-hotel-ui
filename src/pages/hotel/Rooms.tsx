import React, {useEffect, useState} from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {RoomTable} from '@/components/hotel/RoomTable';
import {ConfirmDialog} from '@/components/staff/ConfirmDialog';
import {hotelApi, RoomCriteria, RoomResponse} from '@/api/hotel';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {useNavigate} from 'react-router-dom';
import {Plus, Search, X} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import {canManageRooms} from '@/utils/roleUtils';
import {Pagination} from '@/components/ui/pagination';

const ROOM_STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'VACANT_CLEAN', label: 'Vacant Clean' },
    { value: 'VACANT_DIRTY', label: 'Vacant Dirty' },
    { value: 'OCCUPIED_CLEAN', label: 'Occupied Clean' },
    { value: 'OCCUPIED_DIRTY', label: 'Occupied Dirty' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
    { value: 'OUT_OF_ORDER', label: 'Out of Order' },
];

const Rooms: React.FC = () => {
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<RoomResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination and filters
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [criteria, setCriteria] = useState<RoomCriteria>({});
    
    // Filter states
    const [searchRoomNumber, setSearchRoomNumber] = useState('');
    const [filterRoomType, setFilterRoomType] = useState<string>('all');
    const [filterRoomStatus, setFilterRoomStatus] = useState<string>('all');

    const navigate = useNavigate();
    const {user} = useAuth();
    const canManage = canManageRooms(user?.role || []);

    // Load room types for filter dropdown
    useEffect(() => {
        const loadRoomTypes = async () => {
            try {
                const data = await roomTypeApi.getAllRoomTypes(0, 100);
                setRoomTypes(data.content);
            } catch (error) {
                console.error('Failed to load room types', error);
            }
        };
        loadRoomTypes();
    }, []);

    useEffect(() => {
        loadRooms();
    }, [currentPage, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newCriteria: RoomCriteria = {};
            if (searchRoomNumber) newCriteria.roomNumber = searchRoomNumber;
            if (filterRoomType && filterRoomType !== 'all') {
                newCriteria.roomType = filterRoomType; // Dynamic room type code
            }
            if (filterRoomStatus && filterRoomStatus !== 'all') {
                newCriteria.roomStatus = filterRoomStatus;
            }
            
            setCriteria(newCriteria);
            setCurrentPage(0);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchRoomNumber, filterRoomType, filterRoomStatus]);

    useEffect(() => {
        loadRooms();
    }, [criteria]);

    const loadRooms = async () => {
        try {
            setIsLoading(true);
            const data = await hotelApi.getAllRoomsWithCriteria(currentPage, pageSize, criteria);
            setRooms(data.content);
            const estimatedTotal = data.content.length === pageSize ? (currentPage + 1) * pageSize + 1 : (currentPage * pageSize) + data.content.length;
            setTotalPages(Math.ceil(estimatedTotal / pageSize));
        } catch (error: any) {
            console.error("Failed to load rooms", error);
            const errorMessage = error.response?.data?.message || 
                (error.response?.status === 403 ? "You don't have permission to view rooms" :
                 error.response?.status === 401 ? "Please log in again" :
                 "Failed to load rooms");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchRoomNumber('');
        setFilterRoomType('all');
        setFilterRoomStatus('all');
        setCriteria({});
        setCurrentPage(0);
    };

    const handleCreateRoom = () => {
        navigate('/rooms/new');
    };

    const handleEditRoom = (room: RoomResponse) => {
        navigate(`/rooms/${room.id}/edit`);
    };

    const handleDeleteRoom = (room: RoomResponse) => {
        setRoomToDelete(room);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!roomToDelete) return;

        try {
            setIsDeleting(true);
            await hotelApi.deleteRoom(roomToDelete.id);
            toast.success("Room deleted successfully");
            loadRooms();
            setIsDeleteDialogOpen(false);
            setRoomToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete room", error);
            toast.error(error.response?.data?.message || "Failed to delete room");
        } finally {
            setIsDeleting(false);
        }
    };


    const handleViewRoom = (room: RoomResponse) => {
        navigate(`/rooms/${room.id}`);
    };

    const handleManageImages = (room: RoomResponse) => {
        navigate(`/rooms/${room.id}?tab=images`);
    };

    return (
        <PageWrapper title="Room Management" subtitle="Manage rooms for your hotel">
            <div className="space-y-6">
                {/* Header Actions and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    {canManage && (
                        <Button onClick={handleCreateRoom}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Room
                        </Button>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by room number..."
                                value={searchRoomNumber}
                                onChange={(e) => setSearchRoomNumber(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Room Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {roomTypes.map((rt) => (
                                    <SelectItem key={rt.id} value={rt.code}>
                                        {rt.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterRoomStatus} onValueChange={setFilterRoomStatus}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Room Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROOM_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(searchRoomNumber || filterRoomType !== 'all' || filterRoomStatus !== 'all') && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearFilters}
                                title="Clear filters"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Rooms Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Rooms</CardTitle>
                                <CardDescription>
                                    {rooms.length} room{rooms.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <RoomTable
                            rooms={rooms}
                            isLoading={isLoading}
                            onEdit={handleEditRoom}
                            onDelete={handleDeleteRoom}
                            onView={handleViewRoom}
                            onManageImages={handleManageImages}
                            canEdit={canManage}
                        />
                    </CardContent>
                </Card>

                {/* Pagination */}
                {!isLoading && rooms.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        showPageNumbers={false}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setRoomToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Room"
                    description={
                        roomToDelete
                            ? `Are you sure you want to delete room ${roomToDelete.roomNumber}? This action cannot be undone.`
                            : ''
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    isLoading={isDeleting}
                />
            </div>
        </PageWrapper>
    );
};

export default Rooms;

