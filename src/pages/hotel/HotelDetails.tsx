import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {hotelApi, HotelResponse} from '@/api/hotel';
import {toast} from 'sonner';
import {ArrowLeft, Building2, Clock, Globe, Mail, MapPin, Pencil, Phone, Star, Upload} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {HotelImageGallery} from '@/components/hotel/HotelImageGallery';
import {useAuth} from '@/context/AuthContext';
import {canManageHotels} from '@/utils/roleUtils';

const HotelDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
    const canManage = canManageHotels(user?.role || []);

    useEffect(() => {
        if (id) {
            loadHotel();
        }
    }, [id]);

    const loadHotel = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await hotelApi.getHotelById(parseInt(id));
            setHotel(data);
            // Initialize main photo as first image (backend convention: first item is main photo)
            if (data.photoUrls && data.photoUrls.length > 0) {
                setMainPhotoUrl(data.photoUrls[0]);
            } else {
                setMainPhotoUrl(null);
            }
        } catch (error: any) {
            console.error("Failed to load hotel", error);
            toast.error("Failed to load hotel details");
            navigate('/hotels');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);
            const updatedHotel = await hotelApi.uploadHotelImage(parseInt(id), file);
            setHotel(updatedHotel);
            
            // If no main photo exists, set the newly uploaded image as main photo
            if (!mainPhotoUrl && updatedHotel.photoUrls && updatedHotel.photoUrls.length > 0) {
                const newImageUrl = updatedHotel.photoUrls[updatedHotel.photoUrls.length - 1];
                setMainPhotoUrl(newImageUrl);
            }
            
            toast.success("Image uploaded successfully");
            // Reset input
            event.target.value = '';
        } catch (error: any) {
            console.error("Failed to upload image", error);
            toast.error(error.response?.data?.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageDelete = async (imageUrl: string) => {
        if (!id) return;
        const isMainPhoto = imageUrl === mainPhotoUrl;
        
        try {
            const updatedHotel = await hotelApi.deleteHotelImage(parseInt(id), imageUrl);
            setHotel(updatedHotel);
            
            // If main photo was deleted, set first remaining image as new main photo
            if (isMainPhoto && updatedHotel.photoUrls && updatedHotel.photoUrls.length > 0) {
                setMainPhotoUrl(updatedHotel.photoUrls[0]);
                toast.success("Image deleted. New main photo selected.");
            } else if (isMainPhoto) {
                // No images left
                setMainPhotoUrl(null);
                toast.success("Image deleted successfully");
            } else {
                toast.success("Image deleted successfully");
            }
        } catch (error: any) {
            console.error("Failed to delete image", error);
            toast.error(error.response?.data?.message || "Failed to delete image");
        }
    };

    const handleSetMainPhoto = async (imageUrl: string) => {
        if (!id || !hotel) return;
        
        setMainPhotoUrl(imageUrl);
        
        // Update hotel with new photo order (main photo first)
        // Reorder photoUrls array to put main photo first
        const currentPhotos = hotel.photoUrls || [];
        const reorderedPhotos = [imageUrl, ...currentPhotos.filter(url => url !== imageUrl)];
        
        try {
            const updatedHotel = await hotelApi.updateHotel(parseInt(id), {
                photoUrls: reorderedPhotos
            });
            setHotel(updatedHotel);
            toast.success("Main photo updated successfully");
        } catch (error: any) {
            console.error("Failed to update main photo", error);
            toast.error(error.response?.data?.message || "Failed to update main photo");
            // Revert on error
            setMainPhotoUrl(mainPhotoUrl);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper title="Hotel Details">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">Loading hotel details...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!hotel) {
        return (
            <PageWrapper title="Hotel Details">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Building2 className="h-16 w-16 text-muted-foreground opacity-50" />
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Hotel not found</h2>
                        <p className="text-muted-foreground mb-4">The hotel you're looking for doesn't exist or has been removed.</p>
                        <Button onClick={() => navigate('/hotels')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Hotels
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Hotel Details" subtitle={hotel.name}>
            <div className="space-y-6">
                {/* Navigation */}
                <Button
                    variant="outline"
                    onClick={() => navigate('/hotels')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Hotels
                </Button>

                {/* Main Hotel Header with Image */}
                <Card className="overflow-hidden">
                    <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary/20 to-primary/5">
                        {hotel.photoUrls && hotel.photoUrls.length > 0 && mainPhotoUrl ? (
                            <img
                                src={mainPhotoUrl}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="h-24 w-24 text-muted-foreground opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {hotel.starRating && (
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                <Star className="h-3 w-3 mr-1 fill-current" />
                                                {hotel.starRating} Star{hotel.starRating > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {hotel.rating && (
                                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                                Rating: {hotel.rating.toFixed(1)}
                                            </Badge>
                                        )}
                                        <span className="text-sm opacity-90">
                                            <MapPin className="h-4 w-4 inline mr-1" />
                                            {hotel.city}, {hotel.country}
                                        </span>
                                    </div>
                                </div>
                                {canManage && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate(`/hotels/${id}/edit`)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Hotel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Hotel Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Images and Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Images Gallery Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Hotel Images</span>
                                    {canManage && (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                                className="hidden"
                                            />
                                            <Label htmlFor="image-upload" className="cursor-pointer">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isUploading}
                                                    asChild
                                                >
                                                    <span>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        {isUploading ? "Uploading..." : "Upload Image"}
                                                    </span>
                                                </Button>
                                            </Label>
                                        </div>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hotel.photoUrls && hotel.photoUrls.length > 0 ? (
                                    <HotelImageGallery
                                        images={hotel.photoUrls}
                                        mainPhotoUrl={mainPhotoUrl}
                                        onSetMainPhoto={handleSetMainPhoto}
                                        onDeleteImage={handleImageDelete}
                                        canEdit={canManage}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Upload className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>No images uploaded yet</p>
                                        {canManage && (
                                            <p className="text-sm mt-2">Click "Upload Image" to add photos</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Description Section - Always show */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Hotel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hotel.description ? (
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {hotel.description}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground italic">No description available.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Facilities Section - Always show */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Facilities & Amenities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hotel.facilities && hotel.facilities.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {hotel.facilities.map((facility, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                                <span className="text-sm">{facility}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">No facilities listed.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Policies Section - Always show */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Policies</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hotel.policies ? (
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Hotel Policies</Label>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {hotel.policies}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Hotel Policies</Label>
                                        <p className="text-sm text-muted-foreground italic">No policies specified.</p>
                                    </div>
                                )}
                                {hotel.cancellationPolicy ? (
                                    <div className="pt-4 border-t">
                                        <Label className="text-sm font-semibold mb-2 block">Cancellation Policy</Label>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {hotel.cancellationPolicy}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t">
                                        <Label className="text-sm font-semibold mb-2 block">Cancellation Policy</Label>
                                        <p className="text-sm text-muted-foreground italic">No cancellation policy specified.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Contact & Details */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium">{hotel.address}</p>
                                        <p className="text-muted-foreground">
                                            {hotel.city}, {hotel.state} {hotel.zipCode}
                                        </p>
                                        <p className="text-muted-foreground">{hotel.country}</p>
                                    </div>
                                </div>

                                {hotel.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <a href={`tel:${hotel.phoneNumber}`} className="text-sm hover:text-primary">
                                            {hotel.phoneNumber}
                                        </a>
                                    </div>
                                )}

                                {hotel.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <a href={`mailto:${hotel.email}`} className="text-sm hover:text-primary break-all">
                                            {hotel.email}
                                        </a>
                                    </div>
                                )}
                                
                                {hotel.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <a 
                                            href={hotel.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-sm text-primary hover:underline break-all"
                                        >
                                            {hotel.website}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Operational Details - Always show */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operational Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {hotel.checkInTime ? (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Check-in Time</p>
                                                <p className="text-sm font-medium">{hotel.checkInTime}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Check-in Time</p>
                                                <p className="text-sm text-muted-foreground italic">Not specified</p>
                                            </div>
                                        </div>
                                    )}
                                    {hotel.checkOutTime ? (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Check-out Time</p>
                                                <p className="text-sm font-medium">{hotel.checkOutTime}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Check-out Time</p>
                                                <p className="text-sm text-muted-foreground italic">Not specified</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    {hotel.totalRooms ? (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Rooms</p>
                                                <p className="text-sm font-medium">{hotel.totalRooms}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Rooms</p>
                                                <p className="text-sm text-muted-foreground italic">Not specified</p>
                                            </div>
                                        </div>
                                    )}
                                    {hotel.totalFloors ? (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Floors</p>
                                                <p className="text-sm font-medium">{hotel.totalFloors}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Floors</p>
                                                <p className="text-sm text-muted-foreground italic">Not specified</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {(hotel.taxRate !== undefined || hotel.serviceChargeRate !== undefined) && (
                                    <div className="pt-4 border-t space-y-2">
                                        {hotel.taxRate !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Tax Rate</span>
                                                <span className="text-sm font-medium">{hotel.taxRate}%</span>
                                            </div>
                                        )}
                                        {hotel.serviceChargeRate !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Service Charge</span>
                                                <span className="text-sm font-medium">{hotel.serviceChargeRate}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hotel.timezone && (
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Timezone</p>
                                                <p className="text-sm font-medium">{hotel.timezone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        {canManage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/hotels/${id}/edit`)}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Hotel Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/rooms?hotel=${id}`)}
                                    >
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Manage Rooms
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HotelDetails;

