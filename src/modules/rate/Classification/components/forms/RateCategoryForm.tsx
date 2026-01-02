import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { RateCategoryResponse, CreateRateCategoryRequest, UpdateRateCategoryRequest, rateCategoriesApi } from '../../api/rateCategory.api';

const rateCategorySchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
});

type RateCategoryFormData = z.infer<typeof rateCategorySchema>;

interface RateCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateCategoryResponse;
  defaultValues?: Partial<RateCategoryFormData>;
}

export function RateCategoryForm({ open, onClose, onSuccess, initialData, defaultValues }: RateCategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RateCategoryFormData>({
    resolver: zodResolver(rateCategorySchema),
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

  const onSubmit = async (data: RateCategoryFormData) => {
    try {
      if (initialData) {
        // Update existing rate category
        await rateCategoriesApi.update(initialData.id, data);
        toast.success('Rate category updated successfully');
      } else {
        // Create new rate category
        await rateCategoriesApi.create(data);
        toast.success('Rate category created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} rate category`;
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
                placeholder="e.g., ROOM, MEAL, SERVICE"
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
                placeholder="e.g., Room Charges, Meal Charges"
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
              placeholder="Optional description of this rate category"
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
                  {initialData ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
