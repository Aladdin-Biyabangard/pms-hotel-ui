import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {CreateRoomTypeRequest, roomTypeApi, RoomTypeResponse, UpdateRoomTypeRequest} from '@/api/roomType';
import {toast} from 'sonner';
import {Bed, Loader2, Plus, X} from 'lucide-react';

const roomTypeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must not exceed 50 characters'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must not exceed 200 characters'),
  description: z.string().max(2000, 'Description must not exceed 2000 characters').optional().nullable(),
  maxOccupancy: z.number().min(1, 'Min occupancy is 1').max(20, 'Max occupancy is 20').optional().nullable(),
  amenities: z.array(z.string()).optional(),
});

type RoomTypeFormValues = z.infer<typeof roomTypeSchema>;

interface RoomTypeFormProps {
  roomType?: RoomTypeResponse;
  onSuccess?: (roomType: RoomTypeResponse) => void;
  onCancel?: () => void;
}

const COMMON_AMENITIES = [
  'WiFi', 'Air Conditioning', 'Mini Bar', 'Safe', 'TV', 'Balcony',
  'Sea View', 'City View', 'Jacuzzi', 'Kitchen', 'Work Desk', 'Coffee Maker',
  'Iron', 'Hair Dryer', 'Bathtub', 'Shower', 'Room Service', 'Laundry'
];

export function RoomTypeForm({ roomType, onSuccess, onCancel }: RoomTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const isEditMode = !!roomType;

  const form = useForm<RoomTypeFormValues>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      code: roomType?.code || '',
      name: roomType?.name || '',
      description: roomType?.description || '',
      maxOccupancy: roomType?.maxOccupancy || 2,
      amenities: roomType?.amenities || [],
    },
  });

  useEffect(() => {
    if (roomType) {
      form.reset({
        code: roomType.code,
        name: roomType.name,
        description: roomType.description || '',
        maxOccupancy: roomType.maxOccupancy || 2,
        amenities: roomType.amenities || [],
      });
    }
  }, [roomType, form]);

  const amenities = form.watch('amenities') || [];

  const addAmenity = (amenity: string) => {
    const trimmed = amenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      form.setValue('amenities', [...amenities, trimmed]);
    }
    setNewAmenity('');
  };

  const removeAmenity = (amenity: string) => {
    form.setValue('amenities', amenities.filter(a => a !== amenity));
  };

  const onSubmit = async (data: RoomTypeFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRoomTypeRequest | UpdateRoomTypeRequest = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
        maxOccupancy: data.maxOccupancy || undefined,
        amenities: data.amenities || [],
      };

      let result: RoomTypeResponse;
      if (isEditMode && roomType) {
        result = await roomTypeApi.updateRoomType(roomType.id, payload as UpdateRoomTypeRequest);
        toast.success('Room type updated successfully');
      } else {
        result = await roomTypeApi.createRoomType(payload as CreateRoomTypeRequest);
        toast.success('Room type created successfully');
      }
      onSuccess?.(result);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save room type');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bed className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{isEditMode ? 'Edit Room Type' : 'Create Room Type'}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? `Editing room type: ${roomType?.name}` 
                : 'Define a new room category for your hotel'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., DLX, STD, STE" 
                        {...field} 
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>Unique code identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Deluxe Room" {...field} />
                    </FormControl>
                    <FormDescription>Display name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a detailed description of this room type..."
                      {...field}
                      value={field.value || ''}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxOccupancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Occupancy</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="2"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-32"
                    />
                  </FormControl>
                  <FormDescription>Maximum number of guests</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amenities */}
            <div className="space-y-4">
              <div>
                <FormLabel>Amenities</FormLabel>
                <FormDescription className="mb-3">
                  Select common amenities or add custom ones
                </FormDescription>
              </div>

              {/* Common Amenities Quick Add */}
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.filter(a => !amenities.includes(a)).slice(0, 12).map((amenity) => (
                  <Button
                    key={amenity}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAmenity(amenity)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {amenity}
                  </Button>
                ))}
              </div>

              {/* Custom Amenity Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom amenity..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAmenity(newAmenity);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addAmenity(newAmenity)}
                  disabled={!newAmenity.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="gap-1 pr-1">
                      {amenity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        onClick={() => removeAmenity(amenity)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading ? 'Saving...' : isEditMode ? 'Update Room Type' : 'Create Room Type'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

