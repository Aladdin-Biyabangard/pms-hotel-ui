import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {PaymentMethod} from '@/types/enums';
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {AlertCircle, DollarSign, Loader2} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';

const finalPaymentFormSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentMethod: z.nativeEnum(PaymentMethod),
    transactionId: z.string().optional(),
    paymentNotes: z.string().optional(),
    cardLastFourDigits: z.string().optional(),
    cardHolderName: z.string().optional(),
    bankName: z.string().optional(),
    referenceNumber: z.string().optional(),
}).refine((data) => {
    // Amount validation will be done in component with remainingAmount context
    return true;
});

type FinalPaymentFormValues = z.infer<typeof finalPaymentFormSchema>;

interface FinalPaymentFormProps {
    guestId?: number;
    guestName?: string;
    remainingAmount: number;
    onSubmit: (data: FinalPaymentFormValues) => Promise<void>;
    onCancel: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FinalPaymentForm: React.FC<FinalPaymentFormProps> = ({
    guestId,
    guestName,
    remainingAmount,
    onSubmit,
    onCancel,
    open,
    onOpenChange,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FinalPaymentFormValues>({
        resolver: zodResolver(finalPaymentFormSchema),
        defaultValues: {
            amount: remainingAmount > 0 ? remainingAmount : 0,
            paymentMethod: PaymentMethod.CASH,
            transactionId: '',
            paymentNotes: '',
            cardLastFourDigits: '',
            cardHolderName: '',
            bankName: '',
            referenceNumber: '',
        },
    });

    // Update amount when remainingAmount changes or dialog opens
    React.useEffect(() => {
        if (open && remainingAmount > 0) {
            form.setValue('amount', remainingAmount);
        }
    }, [open, remainingAmount, form]);

    const paymentMethod = form.watch('paymentMethod');
    const isCardPayment = paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.DEBIT_CARD;
    const isTransferPayment = paymentMethod === PaymentMethod.BANK_TRANSFER;

    const handleSubmit = async (data: FinalPaymentFormValues) => {
        // Validate that amount matches remaining amount (allow small rounding differences)
        const difference = Math.abs(data.amount - remainingAmount);
        if (difference > 0.01) {
            form.setError('amount', {
                type: 'manual',
                message: `Payment amount must equal the remaining balance of ${formatCurrency(remainingAmount)}`,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(data);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Payment submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        onCancel();
        onOpenChange(false);
    };

    if (remainingAmount <= 0) {
        return null; // Don't show form if nothing to pay
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pay Remaining Balance
                    </DialogTitle>
                    <DialogDescription>
                        Complete payment{guestName ? ` for ${guestName}` : ''}.
                        Remaining balance: {formatCurrency(remainingAmount)}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                                        Payment Required for Check-Out
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                        You must pay the remaining balance of {formatCurrency(remainingAmount)} to complete check-out.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Amount *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            readOnly
                                            className="bg-muted font-semibold"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Payment amount is set to remaining balance: {formatCurrency(remainingAmount)}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                                            <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                                            <SelectItem value={PaymentMethod.DEBIT_CARD}>Debit Card</SelectItem>
                                            <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                                            <SelectItem value={PaymentMethod.PAYPAL}>PayPal</SelectItem>
                                            <SelectItem value={PaymentMethod.STRIPE}>Stripe</SelectItem>
                                            <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isCardPayment && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="cardLastFourDigits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Card Last 4 Digits</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="1234"
                                                    maxLength={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cardHolderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Card Holder Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {isTransferPayment && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="bankName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bank Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Bank Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="referenceNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Reference Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        <FormField
                            control={form.control}
                            name="transactionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transaction ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional transaction ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentNotes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes about this payment"
                                            {...field}
                                        />
                                    </FormControl>
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Complete Payment ({formatCurrency(remainingAmount)})
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

