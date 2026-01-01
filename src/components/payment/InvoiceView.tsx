import React from 'react';
import {PaymentSummaryResponse} from '@/api/payments';
import {PaymentStatus} from '@/types/enums';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {AlertCircle, Building2, Calendar, CheckCircle2, Clock, CreditCard, Receipt} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';
import {format} from 'date-fns';

interface InvoiceViewProps {
    paymentSummary: PaymentSummaryResponse;
    className?: string;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ paymentSummary, className }) => {
    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'CREDIT_CARD':
            case 'DEBIT_CARD':
                return <CreditCard className="h-4 w-4" />;
            case 'BANK_TRANSFER':
                return <Building2 className="h-4 w-4" />;
            default:
                return <Receipt className="h-4 w-4" />;
        }
    };

    const formatPaymentDate = (dateString?: string) => {
        if (!dateString) return null;
        try {
            return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
            case PaymentStatus.COMPLETED:
                return (
                    <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                );
            case PaymentStatus.PARTIALLY_PAID:
                return (
                    <Badge variant="default" className="bg-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Partial
                    </Badge>
                );
            case PaymentStatus.DEPOSIT:
                return (
                    <Badge variant="default" className="bg-blue-600">
                        Deposit
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const isFullyPaid = paymentSummary.paymentStatus === PaymentStatus.PAID;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <CardTitle>Invoice & Payment History</CardTitle>
                    </div>
                    {getStatusBadge(paymentSummary.paymentStatus)}
                </div>
                {paymentSummary.confirmationNumber && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Confirmation: {paymentSummary.confirmationNumber}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-semibold">{formatCurrency(paymentSummary.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {paymentSummary.paymentStatus === PaymentStatus.DEPOSIT ? 'Deposit Paid:' : 'Paid Amount:'}
                            </span>
                            <span className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-blue-600'}`}>
                                {formatCurrency(paymentSummary.paidAmount)}
                            </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg">
                            <span className="font-semibold">Remaining Balance:</span>
                            <span className={`font-bold ${paymentSummary.remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                {formatCurrency(paymentSummary.remainingAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                {paymentSummary.payments && paymentSummary.payments.length > 0 ? (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Payment History</h3>
                        <div className="space-y-3">
                            {paymentSummary.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="border rounded-lg p-4 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getPaymentMethodIcon(payment.paymentMethod)}
                                                <p className="font-medium">{payment.paymentMethod.replace(/_/g, ' ')}</p>
                                                {getStatusBadge(payment.paymentStatus)}
                                            </div>
                                            {(payment.paymentDateTime || payment.createdAt) && (
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">Paid:</span>
                                                    <span>{formatPaymentDate(payment.paymentDateTime || payment.createdAt) || 'N/A'}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-bold text-lg">{formatCurrency(payment.amount)}</p>
                                        </div>
                                    </div>
                                    {payment.transactionId && (
                                        <p className="text-sm text-muted-foreground">
                                            Transaction ID: {payment.transactionId}
                                        </p>
                                    )}
                                    {payment.paymentNotes && (
                                        <p className="text-sm text-muted-foreground">{payment.paymentNotes}</p>
                                    )}
                                    {(payment.cardLastFourDigits || payment.cardHolderName) && (
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            {payment.cardLastFourDigits && (
                                                <span>Card: ****{payment.cardLastFourDigits}</span>
                                            )}
                                            {payment.cardHolderName && (
                                                <span>Holder: {payment.cardHolderName}</span>
                                            )}
                                        </div>
                                    )}
                                    {(payment.bankName || payment.referenceNumber) && (
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            {payment.bankName && <span>Bank: {payment.bankName}</span>}
                                            {payment.referenceNumber && (
                                                <span>Ref: {payment.referenceNumber}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No payment history available</p>
                    </div>
                )}

                {/* Warning if not fully paid */}
                {!isFullyPaid && paymentSummary.remainingAmount > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900 dark:text-amber-100">
                                    Payment Required
                                </p>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    {formatCurrency(paymentSummary.remainingAmount)} remaining balance must be paid before checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

