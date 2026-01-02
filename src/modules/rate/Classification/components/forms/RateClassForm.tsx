import { useEffect, useState } from 'react';
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
import { RateClassResponse, CreateRateClassRequest, UpdateRateClassRequest, rateClassesApi } from '../../api/rateClass.api';
import { RateCategoryResponse, rateCategoriesApi } from '../../api/rateCategory.api';

const rateClassSchema = z.object({
  rateCategoryId: z.number().min(1, 'Rate category is required'),
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
});

type RateClassFormData = z.infer<typeof rateClassSchema>;

interface RateClassFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateClassResponse;
  defaultValues?: Partial<RateClassFormData>;
}

export function RateClassForm({ open, onClose, onSuccess, initialData, defaultValues }: RateClassFormProps) {
  const [categories, setCategories] = useState<RateCategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RateClassFormData>({
    resolver: zodResolver(rateClassSchema),
    defaultValues: {
      rateCategoryId: initialData?.rateCategoryId || defaultValues?.rateCategoryId || 0,
      code: initialData?.code || defaultValues?.code || '',
      name: initialData?.name || defaultValues?.name || '',
      description: initialData?.description || defaultValues?.description || '',
    },
  });

  const selectedCategoryId = watch('rateCategoryId');

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await rateCategoriesApi.getAll(0, 1000);
        setCategories(response.content);
      } catch (error) {
        toast.error('Failed to load rate categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        rateCategoryId: initialData.rateCategoryId || 0,
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: RateClassFormData) => {
    try {
      if (initialData) {
        // Update existing rate class
        await rateClassesApi.update(initialData.id, data);
        toast.success('Rate class updated successfully');
      } else {
        // Create new rate class
        await rateClassesApi.create(data);
        toast.success('Rate class created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} rate class`;
      toast.error(message);
    }
  };

  if (!open) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rateCategoryId">Rate Category *</Label>
            <Select
              value={selectedCategoryId?.toString() || ''}
              onValueChange={(value) => setValue('rateCategoryId', parseInt(value))}
            >
              <SelectTrigger className={errors.rateCategoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a rate category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name} ({category.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.rateCategoryId && (
              <p className="text-sm text-red-500">{errors.rateCategoryId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="e.g., STD, DLX, SUITE"
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
                placeholder="e.g., Standard Room, Deluxe Room"
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
              placeholder="Optional description of this rate class"
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
                  {initialData ? 'Update Class' : 'Create Class'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
