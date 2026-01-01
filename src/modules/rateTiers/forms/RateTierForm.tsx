import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
import {CreateRateTierRequest, RateTierResponse, rateTiersApi, UpdateRateTierRequest} from '../api/rateTiers.api';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';

const rateTierSchema = z.object({
    ratePlanId: z.number().min(1, 'Rate plan is required'),
    minNights: z.number().int().min(1, 'Minimum nights must be at least 1'),
    maxNights: z.number().int().min(1).optional().nullable(),
    adjustmentType: z.string().min(1, 'Adjustment type is required'),
    adjustmentValue: z.number().min(0, 'Adjustment value must be positive'),
    priority: z.number().int().min(0).optional(),
}).refine((data) => {
    if (data.maxNights && data.maxNights < data.minNights) return false;
    return true;
}, {
    message: 'Maximum nights must be greater than or equal to minimum nights',
    path: ['maxNights'],
});

type RateTierFormValues = z.infer<typeof rateTierSchema>;

interface RateTierFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: RateTierResponse;
    defaultRatePlanId?: number;
}

const ADJUSTMENT_TYPES = [
    {value: 'PERCENTAGE', label: 'Percentage'},
    {value: 'FIXED', label: 'Fixed Amount'},
    {value: 'MULTIPLIER', label: 'Multiplier'},
];

export function RateTierForm({open, onClose, onSuccess, initialData, defaultRatePlanId}: RateTierFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
    const isEditMode = !!initialData;

    const form = useForm<RateTierFormValues>({
        resolver: zodResolver(rateTierSchema),
        defaultValues: {
            ratePlanId: initialData?.ratePlanId || defaultRatePlanId || 0,
            minNights: initialData?.minNights || 1,
            maxNights: initialData?.maxNights || undefined,
            adjustmentType: initialData?.adjustmentType || 'PERCENTAGE',
            adjustmentValue: initialData?.adjustmentValue || 0,
            priority: initialData?.priority || 0,
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
                    minNights: initialData.minNights,
                    maxNights: initialData.maxNights || undefined,
                    adjustmentType: initialData.adjustmentType,
                    adjustmentValue: initialData.adjustmentValue,
                    priority: initialData.priority || 0,
                });
            } else {
                form.reset({
                    ratePlanId: defaultRatePlanId || 0,
                    minNights: 1,
                    maxNights: undefined,
                    adjustmentType: 'PERCENTAGE',
                    adjustmentValue: 0,
                    priority: 0,
                });
            }
        }
    }, [open, initialData, defaultRatePlanId, form]);

    const loadInitialData = async () => {
        try {
            const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
            setRatePlans(ratePlansData.content);
        } catch (error) {
            toast.error('Failed to load rate plans');
        }
    };

    const onSubmit = async (data: RateTierFormValues) => {
        setIsLoading(true);
        try {
            const payload: CreateRateTierRequest | UpdateRateTierRequest = {
                ratePlanId: data.ratePlanId,
                minNights: data.minNights,
                maxNights: data.maxNights || undefined,
                adjustmentType: data.adjustmentType,
                adjustmentValue: data.adjustmentValue,
                priority: data.priority || 0,
            };

            if (isEditMode && initialData) {
                await rateTiersApi.update(initialData.id, payload as UpdateRateTierRequest);
                toast.success('Rate tier updated successfully');
            } else {
                await rateTiersApi.create(payload as CreateRateTierRequest);
                toast.success('Rate tier created successfully');
            }
            onSuccess?.();
            onClose();
            form.reset();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save rate tier');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Rate Tier' : 'Add Rate Tier'}</DialogTitle>
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
                                            disabled={!!defaultRatePlanId}
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
                                name="adjustmentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adjustment Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select adjustment type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ADJUSTMENT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
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
                                name="minNights"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Minimum Nights *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                                            />
                                        </FormControl>
                                        <FormDescription>Minimum number of nights for this tier</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxNights"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Nights (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                            />
                                        </FormControl>
                                        <FormDescription>Leave empty for unlimited nights</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="adjustmentValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Adjustment Value *</FormLabel>
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
                                            {form.watch('adjustmentType') === 'PERCENTAGE' && 'Percentage (e.g., 10 for 10%)'}
                                            {form.watch('adjustmentType') === 'FIXED' && 'Fixed amount in dollars'}
                                            {form.watch('adjustmentType') === 'MULTIPLIER' && 'Multiplier (e.g., 1.5 for 50% increase)'}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>Lower numbers = higher priority</FormDescription>
                                        <FormMessage />
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
