import React, {useEffect, useState} from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Hotel as HotelIcon, Pencil, Plus, Trash} from 'lucide-react';
import {hotelApi, HotelResponse} from '@/api/hotel';
import {useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {useAuth} from '@/context/AuthContext';
import {canManageHotels} from '@/utils/roleUtils';

const Hotels: React.FC = () => {
    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const {user} = useAuth();
    const canManage = canManageHotels(user?.role || []);

    useEffect(() => {
        loadHotels();
    }, []);

    const loadHotels = async () => {
        try {
            const data = await hotelApi.getAllHotels();
            setHotels(data);
        } catch (error) {
            console.error("Failed to load hotels", error);
            toast.error("Failed to load hotels");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await hotelApi.deleteHotel(id);
            toast.success("Hotel deleted successfully");
            loadHotels();
        } catch (error) {
            console.error("Failed to delete hotel", error);
            toast.error("Failed to delete hotel");
        }
    };

    if (isLoading) {
        return <PageWrapper title="Hotels"><div className="p-6">Loading...</div></PageWrapper>;
    }

    return (
        <PageWrapper title="Hotels" subtitle="Manage your properties">
            {canManage && (
                <div className="flex justify-end mb-6">
                    <Button onClick={() => navigate('/hotels/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Hotel
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden">
                        <div className="h-48 bg-secondary/30 relative">
                            {hotel.photoUrls && hotel.photoUrls.length > 0 ? (
                                <img
                                    src={hotel.photoUrls[0]}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <HotelIcon className="h-16 w-16 opacity-20" />
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>{hotel.name}</span>
                                <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">{hotel.starRating} ★</span>
                            </CardTitle>
                            <CardDescription>{hotel.city}, {hotel.country}</CardDescription>
                        </CardHeader>
                            <CardContent>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                                    Details
                                </Button>
                                {canManage && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/hotels/${hotel.id}/edit`)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the hotel
                                                        and all associated data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(hotel.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {hotels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No hotels found. Create your first hotel to get started.
                </div>
            )}
        </PageWrapper>
    );
};

export default Hotels;
