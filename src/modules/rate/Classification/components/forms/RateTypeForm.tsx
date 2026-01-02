import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { RateTypeResponse, CreateRateTypeRequest, UpdateRateTypeRequest, rateTypesApi } from '../../api/rateType.api';
import { EntityStatus } from '@/types/enums';

const rateTypeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
});

type RateTypeFormData = z.infer<typeof rateTypeSchema>;

interface RateTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateTypeResponse;
  defaultValues?: Partial<RateTypeFormData>;
}

export function RateTypeForm({ open, onClose, onSuccess, initialData, defaultValues }: RateTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RateTypeFormData>({
    resolver: zodResolver(rateTypeSchema),
    defaultValues: {
      code: initialData?.code || defaultValues?.code || '',
      name: initialData?.name || defaultValues?.name || '',
      description: initialData?.description || defaultValues?.description || '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: RateTypeFormData) => {
    try {
      if (initialData) {
        // Update existing rate type
        await rateTypesApi.update(initialData.id, data);
        toast.success('Rate type updated successfully');
      } else {
        // Create new rate type
        await rateTypesApi.create(data);
        toast.success('Rate type created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} rate type`;
      toast.error(message);
    }
  };

  if (!open) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="e.g., STD, CORP, PROMO"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Standard Rate, Corporate Rate"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description of this rate type"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? 'Update Rate Type' : 'Create Rate Type'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
