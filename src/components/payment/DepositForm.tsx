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
import {DollarSign, Loader2} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';

const depositFormSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentMethod: z.nativeEnum(PaymentMethod),
    transactionId: z.string().optional(),
    paymentNotes: z.string().optional(),
    cardLastFourDigits: z.string().optional(),
    cardHolderName: z.string().optional(),
    bankName: z.string().optional(),
    referenceNumber: z.string().optional(),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

interface DepositFormProps {
    guestId?: number;
    guestName?: string;
    maxAmount?: number;
    onSubmit: (data: DepositFormValues) => Promise<void>;
    onCancel: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({
    guestId,
    guestName,
    maxAmount,
    onSubmit,
    onCancel,
    open,
    onOpenChange,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<DepositFormValues>({
        resolver: zodResolver(depositFormSchema),
        defaultValues: {
            amount: 0,
            paymentMethod: PaymentMethod.CASH,
            transactionId: '',
            paymentNotes: '',
            cardLastFourDigits: '',
            cardHolderName: '',
            bankName: '',
            referenceNumber: '',
        },
    });

    const paymentMethod = form.watch('paymentMethod');
    const isCardPayment = paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.DEBIT_CARD;
    const isTransferPayment = paymentMethod === PaymentMethod.BANK_TRANSFER;
    const depositAmount = form.watch('amount');
    const maxDepositAmount = maxAmount || totalAmount;

    const handleSubmit = async (data: DepositFormValues) => {
        if (data.amount >= maxDepositAmount) {
            form.setError('amount', {
                type: 'manual',
                message: `Deposit amount cannot equal or exceed total amount (${formatCurrency(maxDepositAmount)}). Use partial payment instead.`,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(data);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Deposit submission error:', error);
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Record Deposit Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record a deposit or partial payment{guestName ? ` for ${guestName}` : ''}.
                        {maxAmount && ` Maximum amount: ${formatCurrency(maxAmount)}`}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                            </div>
                            {depositAmount > 0 && (
                                <>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Deposit to Pay:</span>
                                            <span className="font-semibold text-blue-600">{formatCurrency(depositAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-muted-foreground">Remaining Balance After Deposit:</span>
                                            <span className={totalAmount - depositAmount > 0 ? 'text-amber-600' : 'text-green-600'}>
                                                {formatCurrency(Math.max(0, totalAmount - depositAmount))}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {depositAmount === 0 && maxAmount !== undefined && maxAmount < totalAmount && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current Remaining Balance:</span>
                                    <span className="font-semibold text-amber-600">{formatCurrency(maxAmount)}</span>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deposit Amount *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            max={maxDepositAmount}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter deposit amount (must be less than total: {formatCurrency(totalAmount)})
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
                                            placeholder="Additional notes about this deposit"
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
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Record Deposit
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

