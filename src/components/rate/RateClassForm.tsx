import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {CreateRateClassRequest, rateClassApi, RateClassResponse, UpdateRateClassRequest} from '@/api/rateClass';
import {rateCategoryApi, RateCategoryResponse} from '@/api/rateCategory';
import {toast} from 'sonner';

const rateClassSchema = z.object({
  rateCategoryId: z.number().min(1, 'Rate category is required'),
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
});

type RateClassFormValues = z.infer<typeof rateClassSchema>;

interface RateClassFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateClassResponse;
  defaultCategoryId?: number;
}

export function RateClassForm({
  open,
  onClose,
  onSuccess,
  initialData,
  defaultCategoryId,
}: RateClassFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<RateCategoryResponse[]>([]);
  const isEditMode = !!initialData;

  const form = useForm<RateClassFormValues>({
    resolver: zodResolver(rateClassSchema),
    defaultValues: {
      rateCategoryId: initialData?.rateCategoryId || defaultCategoryId || 0,
      code: initialData?.code || '',
      name: initialData?.name || '',
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
          rateCategoryId: initialData.rateCategoryId || 0,
          code: initialData.code,
          name: initialData.name,
          description: initialData.description || '',
        });
      } else {
        form.reset({
          rateCategoryId: defaultCategoryId || 0,
          code: '',
          name: '',
          description: '',
        });
      }
    }
  }, [open, initialData, defaultCategoryId, form]);

  const loadInitialData = async () => {
    try {
      const categoriesData = await rateCategoryApi.getAllRateCategories(0, 1000);
      setCategories(categoriesData.content);
    } catch (error) {
      toast.error('Failed to load rate categories');
    }
  };

  const onSubmit = async (data: RateClassFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRateClassRequest | UpdateRateClassRequest = {
        rateCategoryId: data.rateCategoryId,
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      };

      if (isEditMode && initialData) {
        await rateClassApi.updateRateClass(initialData.id, payload as UpdateRateClassRequest);
        toast.success('Rate class updated successfully');
      } else {
        await rateClassApi.createRateClass(payload as CreateRateClassRequest);
        toast.success('Rate class created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Rate Class' : 'Create Rate Class'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rateCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Category *</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                    value={field.value?.toString() || ''}
                    disabled={!!defaultCategoryId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select the category this rate class belongs to</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A" {...field} />
                    </FormControl>
                    <FormDescription>Unique code for this rate class</FormDescription>
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
                      <Input placeholder="e.g., Class A" {...field} />
                    </FormControl>
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description..."
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








