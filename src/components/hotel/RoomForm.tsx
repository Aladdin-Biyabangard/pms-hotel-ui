import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {CreateRoomRequest, hotelApi, RoomResponse, UpdateRoomRequest} from '@/api/hotel';
import {RoomStatus} from '@/types/enums';
import {Form} from '@/components/ui/form';
import {FormPanel, FormSection} from '@/components/ui/form-panel';
import {Save, X} from 'lucide-react';
import {BasicInfoSection} from './room/BasicInfoSection';
import {PhysicalAttributesSection} from './room/PhysicalAttributesSection';
import {CapacitySection} from './room/CapacitySection';
import {PricingSection} from './room/PricingSection';
import {RestrictionsSection} from './room/RestrictionsSection';
import {FeaturesSection} from './room/FeaturesSection';
import {StatusSection} from './room/StatusSection';
import {AdditionalInfoSection} from './room/AdditionalInfoSection';

const roomSchema = z.object({
    // Basic Information
    roomNumber: z.string().min(1, "Room number is required").max(20),
    roomType: z.string().min(1, "Room type is required"), // Dynamic code from RoomType entity
    roomCategory: z.string().optional(),
    floor: z.number().int().min(0).max(200),
    wing: z.string().optional(),
    section: z.string().optional(),
    building: z.string().optional(),
    
    // Physical Attributes
    area: z.number().min(0).optional(),
    areaUnit: z.enum(['sqm', 'sqft']).optional(),
    bedCount: z.number().int().min(1).max(10),
    bedType: z.string().optional(),
    bedConfiguration: z.string().optional(),
    viewType: z.string().optional(),
    balcony: z.boolean().optional(),
    terrace: z.boolean().optional(),
    connectingRoom: z.enum(['Connecting', 'Adjoining', 'Adjacent', 'None']).optional(),
    connectingRoomNumber: z.string().optional(),
    
    // Capacity
    occupancy: z.number().int().min(1).max(20),
    maxAdults: z.number().int().min(1).optional(),
    maxChildren: z.number().int().min(0).optional(),
    maxInfants: z.number().int().min(0).optional(),
    extraBedAvailable: z.boolean().optional(),
    extraBedCount: z.number().int().min(0).max(5).optional(),
    extraBedPrice: z.number().min(0).optional(),
    cribAvailable: z.boolean().optional(),
    cribPrice: z.number().min(0).optional(),
    
    // Pricing
    pricePerNight: z.number().min(0),
    weekendPricePerNight: z.number().min(0).optional(),
    seasonalPricePerNight: z.number().min(0).optional(),
    holidayPricePerNight: z.number().min(0).optional(),
    currency: z.string().default('USD'),
    
    // Restrictions
    minStayNights: z.number().int().min(1).optional(),
    maxStayNights: z.number().int().min(1).optional(),
    advanceBookingDays: z.number().int().min(0).optional(),
    cancellationPolicy: z.string().optional(),
    
    // Features & Amenities
    smokingAllowed: z.boolean().optional(),
    petFriendly: z.boolean().optional(),
    wheelchairAccessible: z.boolean().optional(),
    elevatorAccess: z.boolean().optional(),
    amenities: z.array(z.string()).optional(),
    
    // Status & Maintenance
    roomStatus: z.nativeEnum(RoomStatus).optional(),
    housekeepingStatus: z.string().optional(),
    maintenanceNotes: z.string().optional(),
    outOfOrderReason: z.string().optional(),
    outOfOrderUntil: z.string().optional(),
    
    // Additional Information
    description: z.string().optional(),
    internalNotes: z.string().optional(),
    guestNotes: z.string().optional(),
    specialInstructions: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
    room?: RoomResponse;
    onSuccess?: (room: RoomResponse) => void;
    onCancel?: () => void;
}

export const RoomForm: React.FC<RoomFormProps> = ({room, onSuccess, onCancel}) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isEditMode = !!room;

    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            roomNumber: room?.roomNumber || '',
            roomType: room?.roomType || '', // Dynamic room type code
            floor: room?.floor || 0,
            bedCount: room?.bedCount || 1,
            occupancy: room?.occupancy || 1,
            area: room?.area,
            maxAdults: room?.maxAdults,
            maxChildren: room?.maxChildren,
            viewType: room?.viewType || '',
            smokingAllowed: room?.smokingAllowed ?? false,
            extraBedAvailable: room?.extraBedAvailable ?? false,
            extraBedPrice: room?.extraBedPrice,
            minStayNights: room?.minStayNights,
            maxStayNights: room?.maxStayNights,
            weekendPricePerNight: room?.weekendPricePerNight,
            seasonalPricePerNight: room?.seasonalPricePerNight,
            wheelchairAccessible: room?.wheelchairAccessible ?? false,
            description: room?.description || '',
            maintenanceNotes: room?.maintenanceNotes || '',
            amenities: room?.amenities || [],
            roomStatus: (room?.roomStatus as RoomStatus) || undefined,
            currency: 'USD',
            areaUnit: 'sqm',
            pricePerNight: room?.pricePerNight || 0,
        },
    });

    useEffect(() => {
        if (room) {
            form.reset({
                roomNumber: room.roomNumber,
                roomType: room.roomType || '', // Dynamic room type code
                floor: room.floor,
                bedCount: room.bedCount,
                occupancy: room.occupancy || 1,
                area: room.area,
                maxAdults: room.maxAdults,
                maxChildren: room.maxChildren,
                viewType: room.viewType || '',
                smokingAllowed: room.smokingAllowed ?? false,
                extraBedAvailable: room.extraBedAvailable ?? false,
                extraBedPrice: room.extraBedPrice,
                minStayNights: room.minStayNights,
                maxStayNights: room.maxStayNights,
                weekendPricePerNight: room.weekendPricePerNight,
                seasonalPricePerNight: room.seasonalPricePerNight,
                wheelchairAccessible: room.wheelchairAccessible ?? false,
                description: room.description || '',
                maintenanceNotes: room.maintenanceNotes || '',
                amenities: room.amenities || [],
                roomStatus: (room.roomStatus as RoomStatus) || undefined,
                currency: 'USD',
                areaUnit: 'sqm',
                pricePerNight: room.pricePerNight || 0,
            });
        }
    }, [room, form]);

    const onSubmit = async (data: RoomFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            let response: RoomResponse;
            const payload: CreateRoomRequest | UpdateRoomRequest = {
                roomNumber: data.roomNumber,
                roomType: data.roomType,
                pricePerNight: data.pricePerNight,
                floor: data.floor,
                bedCount: data.bedCount,
                occupancy: data.occupancy,
                area: data.area,
                maxAdults: data.maxAdults,
                maxChildren: data.maxChildren,
                viewType: data.viewType || undefined,
                smokingAllowed: data.smokingAllowed,
                extraBedAvailable: data.extraBedAvailable,
                extraBedPrice: data.extraBedPrice,
                minStayNights: data.minStayNights,
                maxStayNights: data.maxStayNights,
                weekendPricePerNight: data.weekendPricePerNight,
                seasonalPricePerNight: data.seasonalPricePerNight,
                wheelchairAccessible: data.wheelchairAccessible,
                description: data.description || undefined,
                maintenanceNotes: data.maintenanceNotes || undefined,
                amenities: data.amenities && data.amenities.length > 0 ? data.amenities : undefined,
                roomStatus: data.roomStatus,
            };
            
            if (isEditMode && room) {
                response = await hotelApi.updateRoom(room.id, payload as UpdateRoomRequest);
            } else {
                response = await hotelApi.createRoom(payload as CreateRoomRequest);
            }

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'create'} room. Please try again.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <FormPanel title="Basic Information" description="Room identification and classification">
                    <FormSection>
                        <BasicInfoSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Physical Attributes" description="Room dimensions, bed configuration, and view">
                    <FormSection>
                        <PhysicalAttributesSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Capacity & Occupancy" description="Guest capacity and occupancy limits">
                    <FormSection>
                        <CapacitySection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Pricing" description="Room rates and pricing structure">
                    <FormSection>
                        <PricingSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Restrictions" description="Booking restrictions and policies">
                    <FormSection>
                        <RestrictionsSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Features & Amenities" description="Room features and available amenities">
                    <FormSection>
                        <FeaturesSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Status & Maintenance" description="Room status and maintenance information">
                    <FormSection>
                        <StatusSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Additional Information" description="Descriptions and notes">
                    <FormSection>
                        <AdditionalInfoSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Room' : 'Create Room')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};