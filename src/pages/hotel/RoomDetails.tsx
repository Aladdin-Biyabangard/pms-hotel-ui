import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RoomForm} from '@/components/hotel/RoomForm';
import {RoomImageUploader} from '@/components/hotel/RoomImageUploader';
import {RoomStatusBadge} from '@/components/hotel/RoomStatusBadge';
import {EntityStatusBadge} from '@/components/hotel/EntityStatusBadge';
import {ConfirmDialog} from '@/components/staff/ConfirmDialog';
import {hotelApi, HotelResponse, RoomResponse} from '@/api/hotel';
import {toast} from 'sonner';
import {ArrowLeft, BedDouble, Building2, DollarSign, Hash, Pencil, Trash2} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Skeleton} from '@/components/ui/skeleton';

const RoomDetails: React.FC = () => {
    const {id} = useParams<{id: string}>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState<RoomResponse | null>(null);
    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const activeTab = searchParams.get('tab') || 'details';

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            // Load hotels first to get the list
            const hotelsData = await hotelApi.getAllHotels();
            setHotels(hotelsData);

            // Load room by ID directly
            const roomData = await hotelApi.getRoomById(parseInt(id, 10));
            setRoom(roomData);
            
            // Find the hotel for this room
            const hotelData = hotelsData.find(h => h.id === roomData.hotelId);
            if (hotelData) {
                setHotel(hotelData);
            }
        } catch (error: any) {
            console.error("Failed to load room", error);
            const errorMessage = error.response?.data?.message || 
                (error.response?.status === 403 ? "You don't have permission to view this room" :
                 error.response?.status === 401 ? "Please log in again" :
                 error.response?.status === 404 ? "Room not found" :
                 "Failed to load room details");
            toast.error(errorMessage);
            navigate('/rooms');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = (updatedRoom: RoomResponse) => {
        setRoom(updatedRoom);
    };

    const handleFormSuccess = (updatedRoom: RoomResponse) => {
        toast.success("Room updated successfully!");
        setIsFormDialogOpen(false);
        setRoom(updatedRoom);
    };

    const handleDelete = async () => {
        if (!room) return;

        try {
            setIsDeleting(true);
            await hotelApi.deleteRoom(room.id);
            toast.success("Room deleted successfully");
            navigate('/rooms');
        } catch (error: any) {
            console.error("Failed to delete room", error);
            toast.error(error.response?.data?.message || "Failed to delete room");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper title="Room Details">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-32" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    if (!room) {
        return (
            <PageWrapper title="Room Details">
                <div className="p-6 text-center text-muted-foreground">
                    Room not found
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Room Details" subtitle={`Room ${room.roomNumber}`}>
            <div className="space-y-6">
                {/* Navigation */}
                <Button
                    variant="outline"
                    onClick={() => navigate('/rooms')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Rooms
                </Button>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsFormDialogOpen(true)}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Room
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Room
                    </Button>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(value) => setSearchParams({tab: value})}>
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        {/* Room Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Room Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                                            <p className="text-lg font-semibold">{room.roomNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Room Type</p>
                                            <p className="text-lg font-semibold">{room.roomType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Floor</p>
                                            <p className="text-lg font-semibold">{room.floor}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Bed Count</p>
                                            <p className="text-lg font-semibold">{room.bedCount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Max Occupancy</p>
                                            <p className="text-lg font-semibold">{room.occupancy || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {room.area && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Area</p>
                                                <p className="text-lg font-semibold">{room.area} m²</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.maxAdults && (
                                        <div className="flex items-start gap-3">
                                            <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Max Adults</p>
                                                <p className="text-lg font-semibold">{room.maxAdults}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.maxChildren !== undefined && room.maxChildren !== null && (
                                        <div className="flex items-start gap-3">
                                            <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Max Children</p>
                                                <p className="text-lg font-semibold">{room.maxChildren}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.viewType && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">View Type</p>
                                                <p className="text-lg font-semibold">{room.viewType}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Base Price per Night</p>
                                            <p className="text-lg font-semibold">${room.pricePerNight.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {room.weekendPricePerNight && (
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Weekend Price</p>
                                                <p className="text-lg font-semibold">${room.weekendPricePerNight.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.seasonalPricePerNight && (
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Seasonal Price</p>
                                                <p className="text-lg font-semibold">${room.seasonalPricePerNight.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.extraBedAvailable && room.extraBedPrice && (
                                        <div className="flex items-start gap-3">
                                            <BedDouble className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Extra Bed Price</p>
                                                <p className="text-lg font-semibold">${room.extraBedPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.minStayNights && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Min Stay</p>
                                                <p className="text-lg font-semibold">{room.minStayNights} night{room.minStayNights !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}

                                    {room.maxStayNights && (
                                        <div className="flex items-start gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Max Stay</p>
                                                <p className="text-lg font-semibold">{room.maxStayNights} night{room.maxStayNights !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <div className="mt-1">
                                                <EntityStatusBadge status={room.status} />
                                            </div>
                                        </div>
                                    </div>

                                    {room.roomStatus && (
                                        <div className="flex items-start gap-3">
                                            <div className="h-5 w-5 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Room Status</p>
                                                <div className="mt-1">
                                                    <RoomStatusBadge status={room.roomStatus} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 col-span-2">
                                        <div className="h-5 w-5 mt-0.5" />
                                        <div className="flex gap-4">
                                            {room.smokingAllowed && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    Smoking Allowed
                                                </span>
                                            )}
                                            {room.wheelchairAccessible && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Wheelchair Accessible
                                                </span>
                                            )}
                                            {room.extraBedAvailable && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Extra Bed Available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {room.description && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                        <p className="text-sm">{room.description}</p>
                                    </div>
                                )}

                                {room.amenities && room.amenities.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Amenities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {room.amenities.map((amenity, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {room.maintenanceNotes && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Maintenance Notes</p>
                                        <p className="text-sm whitespace-pre-wrap">{room.maintenanceNotes}</p>
                                    </div>
                                )}

                                {hotel && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Hotel</p>
                                        <p className="text-sm">{hotel.name}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Room Images</CardTitle>
                                <CardDescription>Manage room photos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RoomImageUploader
                                    room={room}
                                    onUpdate={handleUpdate}
                                    canEdit={true}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Edit Room Dialog */}
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Room</DialogTitle>
                            <DialogDescription>
                                Update the room details below.
                            </DialogDescription>
                        </DialogHeader>
                        <RoomForm
                            room={room}
                            hotels={hotels}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Room"
                    description={`Are you sure you want to delete room ${room.roomNumber}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    isLoading={isDeleting}
                />
            </div>
        </PageWrapper>
    );
};

export default RoomDetails;

