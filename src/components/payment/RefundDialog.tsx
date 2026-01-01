import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {PaymentResponse} from '@/api/payments';
import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {AlertTriangle, Loader2, Receipt} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';

const refundFormSchema = z.object({
    refundAmount: z.number()
        .min(0.01, 'Refund amount must be greater than 0')
        .max(z.number(), 'Refund amount cannot exceed payment amount'),
    reason: z.string().optional(),
});

type RefundFormValues = z.infer<typeof refundFormSchema>;

interface RefundDialogProps {
    payment: PaymentResponse;
    onSubmit: (refundAmount: number, reason?: string) => Promise<void>;
    onCancel: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const RefundDialog: React.FC<RefundDialogProps> = ({
    payment,
    onSubmit,
    onCancel,
    open,
    onOpenChange,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(refundFormSchema),
        defaultValues: {
            refundAmount: payment.amount,
            reason: '',
        },
    });

    // Update max validation when payment changes
    React.useEffect(() => {
        if (open && payment) {
            form.setValue('refundAmount', payment.amount);
            form.clearErrors();
        }
    }, [open, payment, form]);

    const handleSubmit = async (data: RefundFormValues) => {
        // Validate refund amount doesn't exceed payment amount
        if (data.refundAmount > payment.amount) {
            form.setError('refundAmount', {
                type: 'manual',
                message: `Refund amount cannot exceed payment amount of ${formatCurrency(payment.amount)}`,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(data.refundAmount, data.reason);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Refund submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        onCancel();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-red-600" />
                        Process Refund
                    </DialogTitle>
                    <DialogDescription>
                        Process a refund for payment #{payment.id}. 
                        Original payment amount: {formatCurrency(payment.amount)}
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900 dark:text-amber-100">
                                Refund Warning
                            </p>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                This action will mark the payment as refunded. 
                                Please ensure the refund has been processed through your payment gateway.
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="refundAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Refund Amount *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            max={payment.amount}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Maximum refund: {formatCurrency(payment.amount)}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Refund Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter reason for refund (optional)"
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a reason for this refund (optional but recommended)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                variant="destructive"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Receipt className="mr-2 h-4 w-4" />
                                        Process Refund
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

