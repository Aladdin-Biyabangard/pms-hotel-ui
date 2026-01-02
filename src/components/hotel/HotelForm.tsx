import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {CreateHotelRequest, hotelApi, HotelResponse, UpdateHotelRequest} from '@/api/hotel';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

const COMMON_FACILITIES = [
    'WiFi',
    'Swimming Pool',
    'Fitness Center',
    'Spa',
    'Restaurant',
    'Bar',
    'Room Service',
    'Concierge',
    'Parking',
    'Airport Shuttle',
    'Business Center',
    'Meeting Rooms',
    'Laundry Service',
    'Pet Friendly',
    'Beach Access',
    'Golf Course',
    'Tennis Court',
    'Kids Club',
    'Babysitting',
    'Currency Exchange',
];

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
];

const hotelSchema = z.object({
    name: z.string().min(2, "Hotel name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    zipCode: z.string().min(3, "Zip code is required"),
    phoneNumber: z.string().min(5, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    description: z.string().optional(),
    starRating: z.number().min(1).max(5).optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    policies: z.string().optional(),
    facilities: z.array(z.string()).optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    timezone: z.string().optional(),
    totalRooms: z.number().int().min(1, "Total rooms must be at least 1").optional(),
    totalFloors: z.number().int().min(1, "Total floors must be at least 1").optional(),
    cancellationPolicy: z.string().optional(),
    taxRate: z.number().min(0).max(100, "Tax rate_ must be between 0 and 100").optional(),
    serviceChargeRate: z.number().min(0).max(100, "Service charge rate_ must be between 0 and 100").optional(),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

interface HotelFormProps {
    hotel?: HotelResponse;
    onSuccess?: (hotel: HotelResponse) => void;
    onCancel?: () => void;
}

export const HotelForm: React.FC<HotelFormProps> = ({hotel, onSuccess, onCancel}) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isEditMode = !!hotel;

    const form = useForm<HotelFormValues>({
        resolver: zodResolver(hotelSchema),
        defaultValues: {
            name: hotel?.name ?? '',
            address: hotel?.address ?? '',
            city: hotel?.city ?? '',
            state: hotel?.state ?? '',
            country: hotel?.country ?? '',
            zipCode: hotel?.zipCode ?? '',
            phoneNumber: hotel?.phoneNumber ?? '',
            email: hotel?.email ?? '',
            description: hotel?.description ?? '',
            starRating: hotel?.starRating ?? undefined,
            checkInTime: hotel?.checkInTime ?? '14:00',
            checkOutTime: hotel?.checkOutTime ?? '11:00',
            policies: hotel?.policies ?? '',
            facilities: hotel?.facilities ?? [],
            website: hotel?.website ?? '',
            timezone: hotel?.timezone ?? 'UTC',
            totalRooms: hotel?.totalRooms ?? undefined,
            totalFloors: hotel?.totalFloors ?? undefined,
            cancellationPolicy: hotel?.cancellationPolicy ?? '',
            taxRate: hotel?.taxRate ?? undefined,
            serviceChargeRate: hotel?.serviceChargeRate ?? undefined,
        },
    });

    const selectedFacilities = form.watch('facilities') || [];

    const toggleFacility = (facility: string) => {
        const current = selectedFacilities;
        const updated = current.includes(facility)
            ? current.filter(f => f !== facility)
            : [...current, facility];
        form.setValue('facilities', updated);
    };

    const onSubmit = async (data: HotelFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            let response: HotelResponse;
            if (isEditMode && hotel) {
                const payload: UpdateHotelRequest = {
                    ...(data.name && data.name.trim() !== '' && { name: data.name }),
                    ...(data.address && data.address.trim() !== '' && { address: data.address }),
                    ...(data.city && data.city.trim() !== '' && { city: data.city }),
                    ...(data.state && data.state.trim() !== '' && { state: data.state }),
                    ...(data.country && data.country.trim() !== '' && { country: data.country }),
                    ...(data.zipCode && data.zipCode.trim() !== '' && { zipCode: data.zipCode }),
                    ...(data.phoneNumber && data.phoneNumber.trim() !== '' && { phoneNumber: data.phoneNumber }),
                    ...(data.email && data.email.trim() !== '' && { email: data.email }),
                    ...(data.description && data.description.trim() !== '' && { description: data.description }),
                    ...(data.starRating !== undefined && data.starRating !== null && { starRating: data.starRating }),
                    ...(data.checkInTime && data.checkInTime.trim() !== '' && { checkInTime: data.checkInTime }),
                    ...(data.checkOutTime && data.checkOutTime.trim() !== '' && { checkOutTime: data.checkOutTime }),
                    ...(data.policies && data.policies.trim() !== '' && { policies: data.policies }),
                    ...(data.facilities && data.facilities.length > 0 && { facilities: data.facilities }),
                    ...(data.website && data.website.trim() !== '' && { website: data.website }),
                    ...(data.timezone && data.timezone.trim() !== '' && { timezone: data.timezone }),
                    ...(data.totalRooms !== undefined && data.totalRooms !== null && { totalRooms: data.totalRooms }),
                    ...(data.totalFloors !== undefined && data.totalFloors !== null && { totalFloors: data.totalFloors }),
                    ...(data.cancellationPolicy && data.cancellationPolicy.trim() !== '' && { cancellationPolicy: data.cancellationPolicy }),
                    ...(data.taxRate !== undefined && data.taxRate !== null && { taxRate: data.taxRate }),
                    ...(data.serviceChargeRate !== undefined && data.serviceChargeRate !== null && { serviceChargeRate: data.serviceChargeRate }),
                    photoUrls: hotel.photoUrls,
                };
                response = await hotelApi.updateHotel(hotel.id, payload);
            } else {
                // For create, ensure required fields are present
                const payload: CreateHotelRequest = {
                    name: data.name,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    zipCode: data.zipCode,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    description: data.description,
                    starRating: data.starRating,
                    photoUrls: [],
                    checkInTime: data.checkInTime,
                    checkOutTime: data.checkOutTime,
                    policies: data.policies,
                    facilities: data.facilities,
                    website: data.website,
                    timezone: data.timezone,
                    totalRooms: data.totalRooms,
                    totalFloors: data.totalFloors,
                    cancellationPolicy: data.cancellationPolicy,
                    taxRate: data.taxRate,
                    serviceChargeRate: data.serviceChargeRate,
                };
                response = await hotelApi.createHotel(payload);
            }
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'create'} hotel. Please try again.`);
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

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Information</TabsTrigger>
                        <TabsTrigger value="operational">Operational Details</TabsTrigger>
                        <TabsTrigger value="policies">Policies & Facilities</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Hotel Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Grand Hotel" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@hotel.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Phone Number *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({field}) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Address *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>City *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="New York" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="state"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>State/Province *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="NY" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="country"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Country *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="USA" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Zip Code *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="starRating"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Star Rating</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                            value={field.value ? field.value.toString() : undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select rating" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1 Star</SelectItem>
                                                <SelectItem value="2">2 Stars</SelectItem>
                                                <SelectItem value="3">3 Stars</SelectItem>
                                                <SelectItem value="4">4 Stars</SelectItem>
                                                <SelectItem value="5">5 Stars</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input type="url" placeholder="https://www.hotel.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Hotel description..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Brief description of the hotel.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="operational" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="checkInTime"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Check-in Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormDescription>Standard check-in time (e.g., 14:00)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="checkOutTime"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Check-out Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormDescription>Standard check-out time (e.g., 11:00)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timezone"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Timezone</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select timezone" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TIMEZONES.map((tz) => (
                                                    <SelectItem key={tz} value={tz}>
                                                        {tz}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalRooms"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Total Rooms</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="100"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalFloors"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Total Floors</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="10"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Tax Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="10.00"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormDescription>Tax rate percentage</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="serviceChargeRate"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Service Charge Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="5.00"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </FormControl>
                                        <FormDescription>Service charge percentage</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="policies" className="space-y-6">
                        <FormField
                            control={form.control}
                            name="policies"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Hotel Policies</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Hotel policies (cancellation, pet, smoking, etc.)..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>General hotel policies and rules.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cancellationPolicy"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Cancellation Policy</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detailed cancellation policy..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Detailed cancellation and refund policy.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <Label className="mb-4 block">Facilities & Amenities</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {COMMON_FACILITIES.map((facility) => (
                                    <div key={facility} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={facility}
                                            checked={selectedFacilities.includes(facility)}
                                            onCheckedChange={() => toggleFacility(facility)}
                                        />
                                        <label
                                            htmlFor={facility}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {facility}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <FormDescription className="mt-2">
                                Select all facilities and amenities available at this hotel.
                            </FormDescription>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Hotel' : 'Create Hotel')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

