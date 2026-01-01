import React from 'react';
import {PaymentResponse} from '@/api/payments';
import {PaymentMethod, PaymentStatus} from '@/types/enums';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {formatCurrency} from '@/lib/utils';
import {AlertCircle, Building2, CheckCircle2, Clock, CreditCard, DollarSign, Receipt} from 'lucide-react';
import {format} from 'date-fns';

interface PaymentListProps {
    payments: PaymentResponse[];
    onRefund?: (payment: PaymentResponse) => void;
    showReservationInfo?: boolean;
}

export const PaymentList: React.FC<PaymentListProps> = ({ 
    payments, 
    onRefund,
    showReservationInfo = false 
}) => {
    const getStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
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
                        Partially Paid
                    </Badge>
                );
            case PaymentStatus.DEPOSIT:
                return (
                    <Badge variant="default" className="bg-blue-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Deposit
                    </Badge>
                );
            case PaymentStatus.REFUNDED:
                return (
                    <Badge variant="default" className="bg-red-600">
                        <Receipt className="h-3 w-3 mr-1" />
                        Refunded
                    </Badge>
                );
            case PaymentStatus.PENDING:
                return (
                    <Badge variant="outline">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.CREDIT_CARD:
            case PaymentMethod.DEBIT_CARD:
                return <CreditCard className="h-4 w-4" />;
            case PaymentMethod.BANK_TRANSFER:
                return <Building2 className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const formatPaymentMethod = (method: PaymentMethod) => {
        return method.split('_').map(word => 
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    if (payments.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payments found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History ({payments.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                {showReservationInfo && <TableHead>Reservation</TableHead>}
                                <TableHead>Transaction ID</TableHead>
                                {onRefund && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {payment.paymentDate && (
                                                <span className="font-medium">
                                                    {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                                </span>
                                            )}
                                            {payment.paymentDateTime && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.paymentDateTime), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                            {payment.refundAmount && payment.refundAmount > 0 && (
                                                <span className="text-xs text-red-600">
                                                    Refunded: {formatCurrency(payment.refundAmount)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getPaymentMethodIcon(payment.paymentMethod)}
                                            <span className="text-sm">
                                                {formatPaymentMethod(payment.paymentMethod)}
                                            </span>
                                        </div>
                                        {payment.cardLastFourDigits && (
                                            <span className="text-xs text-muted-foreground block mt-1">
                                                ****{payment.cardLastFourDigits}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(payment.paymentStatus)}
                                    </TableCell>
                                    {showReservationInfo && (
                                        <TableCell>
                                            {payment.confirmationNumber ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {payment.confirmationNumber}
                                                    </span>
                                                    {payment.guestName && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Guest: {payment.guestName}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {payment.transactionId ? (
                                            <span className="font-mono text-sm">
                                                {payment.transactionId}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    {onRefund && payment.paymentStatus === PaymentStatus.PAID && !payment.isRefund && (
                                        <TableCell className="text-right">
                                            <button
                                                onClick={() => onRefund(payment)}
                                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Refund
                                            </button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

