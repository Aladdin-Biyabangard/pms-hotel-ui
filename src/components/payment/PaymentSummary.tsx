import React, {useState} from 'react';
import {PaymentResponse, PaymentSummaryResponse} from '@/api/payments';
import {PaymentStatus} from '@/types/enums';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, DollarSign} from 'lucide-react';
import {formatCurrency} from '@/lib/utils';
import {PaymentList} from './PaymentList';

interface PaymentSummaryProps {
    paymentSummary: PaymentSummaryResponse;
    className?: string;
    onRefund?: (payment: PaymentResponse) => void;
    showTransactionHistory?: boolean;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({ 
    paymentSummary, 
    className,
    onRefund,
    showTransactionHistory = true 
}) => {
    const [showHistory, setShowHistory] = useState(false);
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

    const isFullyPaid = paymentSummary.paymentStatus === PaymentStatus.PAID;
    const hasRemaining = paymentSummary.remainingAmount > 0;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Payment Summary</CardTitle>
                    {getStatusBadge(paymentSummary.paymentStatus)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold">{formatCurrency(paymentSummary.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">Room + Services</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            {paymentSummary.paymentStatus === PaymentStatus.DEPOSIT ? 'Deposit Paid' : 'Paid Amount'}
                        </p>
                        <p className={`text-2xl font-bold ${isFullyPaid ? 'text-green-600' : 'text-blue-600'}`}>
                            {formatCurrency(paymentSummary.paidAmount)}
                        </p>
                        {paymentSummary.paidAmount > 0 && !isFullyPaid && (
                            <p className="text-xs text-muted-foreground">
                                {paymentSummary.paymentStatus === PaymentStatus.DEPOSIT 
                                    ? 'Deposit recorded' 
                                    : 'Partial payment'}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Remaining Balance</p>
                        <p className={`text-2xl font-bold ${hasRemaining ? 'text-amber-600' : 'text-green-600'}`}>
                            {formatCurrency(paymentSummary.remainingAmount)}
                        </p>
                        {hasRemaining && (
                            <p className="text-xs text-muted-foreground">Due at check-out</p>
                        )}
                        {!hasRemaining && (
                            <p className="text-xs text-green-600">Fully paid</p>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {paymentSummary.totalAmount > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Payment Progress</span>
                            <span>
                                {((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${
                                    isFullyPaid ? 'bg-green-600' : 'bg-blue-600'
                                }`}
                                style={{
                                    width: `${Math.min((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100, 100)}%`,
                                }}
                            />
                        </div>
                        </div>
                    )}

                {/* Transaction History */}
                {showTransactionHistory && paymentSummary.payments && paymentSummary.payments.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold">Transaction History</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHistory(!showHistory)}
                                className="gap-2"
                            >
                                {showHistory ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Hide History
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        Show History ({paymentSummary.payments.length})
                                    </>
                                )}
                            </Button>
                        </div>
                        {showHistory && (
                            <div className="mt-4">
                                <PaymentList 
                                    payments={paymentSummary.payments} 
                                    onRefund={onRefund}
                                    showReservationInfo={false}
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

