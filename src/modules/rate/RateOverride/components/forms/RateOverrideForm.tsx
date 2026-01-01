import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {format} from 'date-fns';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {CreateRateOverrideRequest, rateOverrideApi, RateOverrideResponse} from '../../api/rateOverride';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';

const rateOverrideSchema = z.object({
  ratePlanId: z.number().min(1, 'Rate plan is required'),
  roomTypeId: z.number().optional(),
  overrideDate: z.string().min(1, 'Date is required'),
  overrideType: z.string().min(1, 'Override type is required'),
  overrideValue: z.number().min(0, 'Override value must be positive'),
  reason: z.string().optional(),
});

type RateOverrideFormValues = z.infer<typeof rateOverrideSchema>;

interface RateOverrideFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateOverrideResponse;
  defaultDate?: string;
  defaultRatePlanId?: number;
  defaultRoomTypeId?: number;
}

const OVERRIDE_TYPES = [
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'SURCHARGE', label: 'Surcharge' },
];

export function RateOverrideForm({
  open,
  onClose,
  onSuccess,
  initialData,
  defaultDate,
  defaultRatePlanId,
  defaultRoomTypeId,
}: RateOverrideFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const isEditMode = !!initialData;

  const form = useForm<RateOverrideFormValues>({
    resolver: zodResolver(rateOverrideSchema),
    defaultValues: {
      ratePlanId: initialData?.ratePlanId || defaultRatePlanId || 0,
      roomTypeId: initialData?.roomTypeId || defaultRoomTypeId,
      overrideDate: initialData?.overrideDate || defaultDate || format(new Date(), 'yyyy-MM-dd'),
      overrideType: initialData?.overrideType || 'FIXED',
      overrideValue: initialData?.overrideValue || 0,
      reason: initialData?.reason || '',
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          ratePlanId: initialData.ratePlanId,
          roomTypeId: initialData.roomTypeId,
          overrideDate: initialData.overrideDate,
          overrideType: initialData.overrideType,
          overrideValue: initialData.overrideValue,
          reason: initialData.reason || '',
        });
      } else {
        form.reset({
          ratePlanId: defaultRatePlanId || 0,
          roomTypeId: defaultRoomTypeId,
          overrideDate: defaultDate || format(new Date(), 'yyyy-MM-dd'),
          overrideType: 'FIXED',
          overrideValue: 0,
          reason: '',
        });
      }
    }
  }, [open, initialData, defaultDate, defaultRatePlanId, defaultRoomTypeId, form]);

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

  const onSubmit = async (data: RateOverrideFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRateOverrideRequest = {
        ratePlanId: data.ratePlanId,
        roomTypeId: data.roomTypeId || undefined,
        overrideDate: data.overrideDate,
        overrideType: data.overrideType,
        overrideValue: data.overrideValue,
        reason: data.reason || undefined,
      };

      if (isEditMode && initialData) {
        await rateOverrideApi.updateRateOverride(initialData.id, payload);
        toast.success('Rate override updated successfully');
      } else {
        // Backend will automatically update if exists
        await rateOverrideApi.createRateOverride(payload);
        toast.success('Rate override saved successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate override');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Rate Override' : 'Create Rate Override'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ratePlanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Plan *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ratePlans.map(rp => (
                          <SelectItem key={rp.id} value={rp.id.toString()}>{rp.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === '_none_' ? undefined : parseInt(value, 10))} 
                      value={field.value?.toString() || '_none_'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none_">None (All Room Types)</SelectItem>
                        {roomTypes.map(rt => (
                          <SelectItem key={rt.id} value={rt.id.toString()}>{rt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Leave empty to apply to all room types</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="overrideDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overrideType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select override type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OVERRIDE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="overrideValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Override Value *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {form.watch('overrideType') === 'PERCENTAGE' 
                        ? 'Percentage value (e.g., 10 for 10%)'
                        : 'Amount value in currency'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter reason for this override..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Optional reason for this rate override</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

