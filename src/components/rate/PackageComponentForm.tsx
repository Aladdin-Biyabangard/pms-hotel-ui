import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {
    COMPONENT_TYPES,
    CreateRatePackageComponentRequest,
    ratePackageComponentApi,
    RatePackageComponentResponse,
    UpdateRatePackageComponentRequest
} from '@/api/ratePackageComponent';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {toast} from 'sonner';

const packageComponentSchema = z.object({
  ratePlanId: z.number().min(1, 'Rate plan is required'),
  componentType: z.string().min(1, 'Component type is required'),
  componentCode: z.string().max(50).optional().nullable(),
  componentName: z.string().min(1, 'Component name is required').max(200),
  quantity: z.number().int().min(1).optional().nullable(),
  unitPrice: z.number().min(0).optional().nullable(),
  priceAdult: z.number().min(0).optional().nullable(),
  priceChild: z.number().min(0).optional().nullable(),
  priceInfant: z.number().min(0).optional().nullable(),
  isIncluded: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
});

type PackageComponentFormValues = z.infer<typeof packageComponentSchema>;

interface PackageComponentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RatePackageComponentResponse;
  defaultRatePlanId?: number;
}

export function PackageComponentForm({
  open,
  onClose,
  onSuccess,
  initialData,
  defaultRatePlanId,
}: PackageComponentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const isEditMode = !!initialData;

  const form = useForm<PackageComponentFormValues>({
    resolver: zodResolver(packageComponentSchema),
    defaultValues: {
      ratePlanId: initialData?.ratePlanId || defaultRatePlanId || 0,
      componentType: initialData?.componentType || 'SERVICE',
      componentCode: initialData?.componentCode || '',
      componentName: initialData?.componentName || '',
      quantity: initialData?.quantity || 1,
      unitPrice: initialData?.unitPrice || undefined,
      priceAdult: initialData?.priceAdult || undefined,
      priceChild: initialData?.priceChild || undefined,
      priceInfant: initialData?.priceInfant || undefined,
      isIncluded: initialData?.isIncluded ?? true,
      description: initialData?.description || '',
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
          componentType: initialData.componentType,
          componentCode: initialData.componentCode || '',
          componentName: initialData.componentName,
          quantity: initialData.quantity || 1,
          unitPrice: initialData.unitPrice || undefined,
          priceAdult: initialData.priceAdult || undefined,
          priceChild: initialData.priceChild || undefined,
          priceInfant: initialData.priceInfant || undefined,
          isIncluded: initialData.isIncluded ?? true,
          description: initialData.description || '',
        });
      } else {
        form.reset({
          ratePlanId: defaultRatePlanId || 0,
          componentType: 'SERVICE',
          componentCode: '',
          componentName: '',
          quantity: 1,
          unitPrice: undefined,
          priceAdult: undefined,
          priceChild: undefined,
          priceInfant: undefined,
          isIncluded: true,
          description: '',
        });
      }
    }
  }, [open, initialData, defaultRatePlanId, form]);

  const loadInitialData = async () => {
    try {
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
      // Filter to show only package rate plans
      setRatePlans(ratePlansData.content.filter(rp => rp.isPackage));
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const onSubmit = async (data: PackageComponentFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRatePackageComponentRequest | UpdateRatePackageComponentRequest = {
        ratePlanId: data.ratePlanId,
        componentType: data.componentType,
        componentCode: data.componentCode || undefined,
        componentName: data.componentName,
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || undefined,
        priceAdult: data.priceAdult || undefined,
        priceChild: data.priceChild || undefined,
        priceInfant: data.priceInfant || undefined,
        isIncluded: data.isIncluded ?? true,
        description: data.description || undefined,
      };

      if (isEditMode && initialData) {
        await ratePackageComponentApi.updateRatePackageComponent(initialData.id, payload as UpdateRatePackageComponentRequest);
        toast.success('Package component updated successfully');
      } else {
        await ratePackageComponentApi.createRatePackageComponent(payload as CreateRatePackageComponentRequest);
        toast.success('Package component created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save package component');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Package Component' : 'Add Package Component'}</DialogTitle>
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
                    <FormDescription>Only package rate plans are shown</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="componentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select component type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPONENT_TYPES.map(type => (
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
                name="componentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Breakfast Buffet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="componentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., BFST" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || 1}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>Leave empty for free/included items</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isIncluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Included in Package</FormLabel>
                      <FormDescription>Is this component included in the package price?</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Age-based Pricing */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Age-Based Pricing (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priceAdult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adult Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Price for adults</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceChild"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Child Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Price for children</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceInfant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Infant Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Price for infants</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter component description..."
                      {...field}
                      value={field.value || ''}
                      rows={3}
                    />
                  </FormControl>
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

