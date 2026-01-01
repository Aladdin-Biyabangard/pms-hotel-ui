import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {hotelApi, HotelResponse} from '@/api/hotel';
import {toast} from 'sonner';
import {AlertCircle, ArrowLeft, Upload} from 'lucide-react';
import {HotelImageGallery} from '@/components/hotel/HotelImageGallery';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {HotelForm} from '@/components/hotel/HotelForm';
import {useAuth} from '@/context/AuthContext';
import {canManageHotels} from '@/utils/roleUtils';
import {Alert, AlertDescription} from '@/components/ui/alert';

const EditHotel: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadHotel();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleSuccess = (updatedHotel: HotelResponse) => {
        setHotel(updatedHotel);
        toast.success("Hotel updated successfully");
        navigate(`/hotels/${id}`);
    };

    const handleCancel = () => {
        navigate(`/hotels/${id}`);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

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

    const handleSetMainPhoto = (imageUrl: string) => {
        setMainPhotoUrl(imageUrl);
        toast.success("Main photo selected. Click 'Update Hotel' to save changes.");
    };

    if (isLoading) {
        return (
            <PageWrapper title="Edit Hotel">
                <div className="p-6">Loading...</div>
            </PageWrapper>
        );
    }

    if (!hotel) {
        return (
            <PageWrapper title="Edit Hotel">
                <div className="p-6 text-center text-muted-foreground">
                    Hotel not found
                </div>
            </PageWrapper>
        );
    }

    if (!canManageHotels(user?.role || [])) {
        return (
            <PageWrapper title="Edit Hotel">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to edit hotels. Only Directors can edit hotels.
                    </AlertDescription>
                </Alert>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Edit Hotel" subtitle={hotel.name}>
            <div className="space-y-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/hotels/${id}`)}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Details
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Information</CardTitle>
                                <CardDescription>
                                    Update the hotel details. All fields are optional - only changed fields will be updated.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HotelForm hotel={hotel} onSuccess={handleSuccess} onCancel={handleCancel} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Images Section */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Hotel Images</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Input
                                        id="image-upload-edit"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                    <Label htmlFor="image-upload-edit" className="cursor-pointer">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploading}
                                            className="w-full"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="mr-2 h-4 w-4" />
                                                {isUploading ? "Uploading..." : "Upload Image"}
                                            </span>
                                        </Button>
                                    </Label>
                                </div>

                                {hotel.photoUrls && hotel.photoUrls.length > 0 ? (
                                    <HotelImageGallery
                                        images={hotel.photoUrls}
                                        mainPhotoUrl={mainPhotoUrl}
                                        onSetMainPhoto={handleSetMainPhoto}
                                        onDeleteImage={handleImageDelete}
                                        canEdit={true}
                                        imageHeight="h-32"
                                    />
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No images uploaded
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default EditHotel;

