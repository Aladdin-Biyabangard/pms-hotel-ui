import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Upload} from 'lucide-react';
import {hotelApi, RoomResponse} from '@/api/hotel';
import {toast} from 'sonner';
import {HotelImageGallery} from './HotelImageGallery';
import {Alert, AlertDescription} from '@/components/ui/alert';

interface RoomImageUploaderProps {
    room: RoomResponse;
    onUpdate: (updatedRoom: RoomResponse) => void;
    canEdit?: boolean;
}

export const RoomImageUploader: React.FC<RoomImageUploaderProps> = ({
    room,
    onUpdate,
    canEdit = false,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const mainPhotoUrl = room.mainImageUrl || (room.photoUrls && room.photoUrls.length > 0 ? room.photoUrls[0] : null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

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
            const updatedRoom = await hotelApi.uploadRoomImage(room.id, file);
            onUpdate(updatedRoom);
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
        const isMainPhoto = imageUrl === mainPhotoUrl;

        try {
            const updatedRoom = await hotelApi.deleteRoomImage(room.id, imageUrl);
            onUpdate(updatedRoom);
            
            if (isMainPhoto) {
                toast.success("Main image deleted successfully");
            } else {
                toast.success("Image deleted successfully");
            }
        } catch (error: any) {
            console.error("Failed to delete image", error);
            toast.error(error.response?.data?.message || "Failed to delete image");
        }
    };

    const handleSetMainPhoto = async (imageUrl: string) => {
        if (imageUrl === mainPhotoUrl) {
            return; // Already main photo
        }

        try {
            const updatedRoom = await hotelApi.setMainRoomImage(room.id, imageUrl);
            onUpdate(updatedRoom);
            toast.success("Main image set successfully");
        } catch (error: any) {
            console.error("Failed to set main image", error);
            toast.error(error.response?.data?.message || "Failed to set main image");
        }
    };

    const images = room.photoUrls || [];

    return (
        <div className="space-y-4">
            {canEdit && (
                <div className="flex items-center gap-2">
                    <Input
                        id="room-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                    />
                    <Label htmlFor="room-image-upload" className="cursor-pointer">
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

            {images.length > 0 ? (
                <HotelImageGallery
                    images={images}
                    mainPhotoUrl={mainPhotoUrl}
                    onSetMainPhoto={canEdit ? handleSetMainPhoto : undefined}
                    onDeleteImage={canEdit ? handleImageDelete : undefined}
                    canEdit={canEdit}
                    imageHeight="h-32"
                />
            ) : (
                <Alert>
                    <AlertDescription>
                        No images uploaded yet. {canEdit && 'Click "Upload Image" to add photos.'}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

