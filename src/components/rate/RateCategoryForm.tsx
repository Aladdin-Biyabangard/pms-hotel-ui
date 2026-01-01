import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {
    CreateRateCategoryRequest,
    rateCategoryApi,
    RateCategoryResponse,
    UpdateRateCategoryRequest
} from '@/api/rateCategory';
import {toast} from 'sonner';

const rateCategorySchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().nullable(),
});

type RateCategoryFormValues = z.infer<typeof rateCategorySchema>;

interface RateCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateCategoryResponse;
}

export function RateCategoryForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: RateCategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<RateCategoryFormValues>({
    resolver: zodResolver(rateCategorySchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code,
          name: initialData.name,
          description: initialData.description || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (data: RateCategoryFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRateCategoryRequest | UpdateRateCategoryRequest = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      };

      if (isEditMode && initialData) {
        await rateCategoryApi.updateRateCategory(initialData.id, payload as UpdateRateCategoryRequest);
        toast.success('Rate category updated successfully');
      } else {
        await rateCategoryApi.createRateCategory(payload as CreateRateCategoryRequest);
        toast.success('Rate category created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Rate Category' : 'Create Rate Category'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CORP" {...field} />
                  </FormControl>
                  <FormDescription>Unique code for this rate category</FormDescription>
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
                    <Input placeholder="e.g., Corporate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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








