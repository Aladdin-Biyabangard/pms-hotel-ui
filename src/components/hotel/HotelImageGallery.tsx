import React from 'react';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Star, X} from 'lucide-react';
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

export interface HotelImageGalleryProps {
    images: string[];
    mainPhotoUrl: string | null;
    onSetMainPhoto?: (imageUrl: string) => void;
    onDeleteImage?: (imageUrl: string) => void;
    canEdit?: boolean;
    className?: string;
    imageHeight?: string;
}

/**
 * Reusable component for displaying hotel images with main photo selection.
 * The main photo is clearly highlighted with a badge and border.
 */
export const HotelImageGallery: React.FC<HotelImageGalleryProps> = ({
    images,
    mainPhotoUrl,
    onSetMainPhoto,
    onDeleteImage,
    canEdit = false,
    className = "",
    imageHeight = "h-48",
}) => {
    // Determine which image is the main photo (use first image if no main photo is set)
    const currentMainPhoto = mainPhotoUrl || (images.length > 0 ? images[0] : null);

    const handleSetMainPhoto = (imageUrl: string) => {
        if (onSetMainPhoto && imageUrl !== currentMainPhoto) {
            onSetMainPhoto(imageUrl);
        }
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
            {images.map((url, index) => {
                const isMainPhoto = url === currentMainPhoto;
                return (
                    <div
                        key={index}
                        className={`relative group ${isMainPhoto ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                        <img
                            src={url}
                            alt={`Hotel ${index + 1}`}
                            className={`w-full ${imageHeight} object-cover rounded-lg ${isMainPhoto ? 'border-2 border-primary' : ''}`}
                        />
                        
                        {/* Main Photo Badge */}
                        {isMainPhoto && (
                            <Badge
                                className="absolute top-2 left-2 bg-primary text-primary-foreground"
                            >
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Main Photo
                            </Badge>
                        )}

                        {/* Hover Overlay with Actions */}
                        {canEdit && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                {!isMainPhoto && onSetMainPhoto && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleSetMainPhoto(url)}
                                        title="Set as main photo"
                                    >
                                        <Star className="h-4 w-4 mr-1" />
                                        Set Main
                                    </Button>
                                )}
                                {onDeleteImage && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                title="Delete image"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {isMainPhoto && images.length > 1
                                                        ? "This is the main photo. Deleting it will automatically set the first available photo as the new main photo. Are you sure you want to delete this image?"
                                                        : "Are you sure you want to delete this image? This action cannot be undone."}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => onDeleteImage(url)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

