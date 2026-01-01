import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {CreateRateTypeRequest, rateTypeApi, RateTypeResponse, UpdateRateTypeRequest} from '@/api/rateType';
import {toast} from 'sonner';

const rateTypeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional().nullable(),
});

type RateTypeFormValues = z.infer<typeof rateTypeSchema>;

interface RateTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: RateTypeResponse;
}

export function RateTypeForm({
  open,
  onClose,
  onSuccess,
  initialData,
}: RateTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<RateTypeFormValues>({
    resolver: zodResolver(rateTypeSchema),
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

  const onSubmit = async (data: RateTypeFormValues) => {
    setIsLoading(true);
    try {
      const payload: CreateRateTypeRequest | UpdateRateTypeRequest = {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      };

      if (isEditMode && initialData) {
        await rateTypeApi.updateRateType(initialData.id, payload as UpdateRateTypeRequest);
        toast.success('Rate type updated successfully');
      } else {
        await rateTypeApi.createRateType(payload as CreateRateTypeRequest);
        toast.success('Rate type created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save rate type');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Rate Type' : 'Create Rate Type'}</DialogTitle>
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
                    <Input placeholder="e.g., STD" {...field} />
                  </FormControl>
                  <FormDescription>Unique code for this rate type</FormDescription>
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
                    <Input placeholder="e.g., Standard Rate" {...field} />
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








