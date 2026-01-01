import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Button} from '@/components/ui/button';
import {CreateRoomRateRequest, roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';

const roomRateSchema = z.object({
  ratePlanCode: z.string().min(1, 'Rate plan is required'),
  roomTypeCode: z.string().min(1, 'Room type is required'),
  rateDate: z.string().min(1, 'Date is required'),
  rateAmount: z.number().min(0, 'Rate amount must be positive'),
  currency: z.string().optional(),
  availabilityCount: z.number().int().optional(),
  minGuests: z.number().int().optional(),
  maxGuests: z.number().int().optional(),
  stopSell: z.boolean().optional(),
  closedForArrival: z.boolean().optional(),
  closedForDeparture: z.boolean().optional(),
});

type RoomRateFormValues = z.infer<typeof roomRateSchema>;

interface RoomRateFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RoomRateResponse;
  defaultDate?: string;
  defaultRatePlanId?: number;
  defaultRoomTypeId?: number;
}

export function RoomRateForm({
  open,
  onClose,
  onSuccess,
  initialData,
  defaultDate,
  defaultRatePlanId,
  defaultRoomTypeId,
}: RoomRateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const isEditMode = !!initialData;

  const form = useForm<RoomRateFormValues>({
    resolver: zodResolver(roomRateSchema),
    defaultValues: {
      ratePlanCode: initialData?.ratePlan?.code || '',
      roomTypeCode: initialData?.roomType?.code || '',
      rateDate: initialData?.rateDate || defaultDate || format(new Date(), 'yyyy-MM-dd'),
      rateAmount: initialData?.rateAmount || 0,
      currency: initialData?.currency || 'USD',
      availabilityCount: initialData?.availabilityCount,
      minGuests: initialData?.minGuests,
      maxGuests: initialData?.maxGuests,
      stopSell: initialData?.stopSell || false,
      closedForArrival: initialData?.closedForArrival || false,
      closedForDeparture: initialData?.closedForDeparture || false,
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          ratePlanCode: initialData.ratePlan?.code || '',
          roomTypeCode: initialData.roomType?.code || '',
          rateDate: initialData.rateDate,
          rateAmount: initialData.rateAmount,
          currency: initialData.currency || 'USD',
          availabilityCount: initialData.availabilityCount,
          minGuests: initialData.minGuests,
          maxGuests: initialData.maxGuests,
          stopSell: initialData.stopSell || false,
          closedForArrival: initialData.closedForArrival || false,
          closedForDeparture: initialData.closedForDeparture || false,
        });
      } else {
        form.reset({
          ratePlanCode: defaultRatePlanId 
            ? ratePlans.find(rp => rp.id === defaultRatePlanId)?.code || ''
            : '',
          roomTypeCode: defaultRoomTypeId
            ? roomTypes.find(rt => rt.id === defaultRoomTypeId)?.code || ''
            : '',
          rateDate: defaultDate || format(new Date(), 'yyyy-MM-dd'),
          rateAmount: 0,
          currency: 'USD',
          availabilityCount: undefined,
          minGuests: undefined,
          maxGuests: undefined,
          stopSell: false,
          closedForArrival: false,
          closedForDeparture: false,
        });
      }
    }
  }, [open, initialData, defaultDate, defaultRatePlanId, defaultRoomTypeId, ratePlans, roomTypes, form]);

  const loadInitialData = async () => {
    try {
      const [ratePlansData, roomTypesData] = await Promise.all([
        ratePlanApi.getAllRatePlans(0, 1000),
        roomTypeApi.getAllRoomTypes(0, 1000)
      ]);
      setRatePlans(ratePlansData.content);
      setRoomTypes(roomTypesData.content);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const onSubmit = async (data: RoomRateFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && initialData) {
        // Update existing - backend should handle exists check
        await roomRateApi.updateRoomRate(initialData.id, data);
        toast.success('Rate updated successfully');
      } else {
        // Create new - backend will automatically update if exists
        await roomRateApi.createRoomRate(data as CreateRoomRateRequest);
        toast.success('Rate saved successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Room Rate' : 'Create Room Rate'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ratePlanCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Plan *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ratePlans.map(rp => (
                          <SelectItem key={rp.id} value={rp.code}>{rp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomTypeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomTypes.map(rt => (
                          <SelectItem key={rt.id} value={rt.code}>{rt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rateDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availabilityCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stopSell"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Stop Sell</FormLabel>
                      <FormDescription>Prevent bookings for this date</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closedForArrival"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Closed for Arrival</FormLabel>
                      <FormDescription>No check-ins on this date</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closedForDeparture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Closed for Departure</FormLabel>
                      <FormDescription>No check-outs on this date</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

