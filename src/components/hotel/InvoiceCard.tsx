import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, DollarSign, Download, FileText, User} from 'lucide-react';
import {InvoiceStatus} from '@/types/enums';
import {format} from 'date-fns';

interface InvoiceCardProps {
    invoice: {
        id: number;
        invoiceNumber: string;
        invoiceDate: string;
        dueDate?: string;
        invoiceStatus: InvoiceStatus;
        subtotal: number;
        taxAmount?: number;
        serviceCharge?: number;
        discountAmount?: number;
        totalAmount: number;
        paidAmount?: number;
        balanceAmount?: number;
        currency?: string;
        guest?: {
            firstName: string;
            lastName: string;
            email: string;
        };
    };
    onView?: (id: number) => void;
    onDownload?: (id: number) => void;
    onSend?: (id: number) => void;
    canManage?: boolean;
}

export function InvoiceCard({
    invoice,
    onView,
    onDownload,
    onSend,
    canManage = false,
}: InvoiceCardProps) {
    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAID:
                return 'bg-green-500';
            case InvoiceStatus.SENT:
                return 'bg-blue-500';
            case InvoiceStatus.OVERDUE:
                return 'bg-red-500';
            case InvoiceStatus.PENDING:
                return 'bg-yellow-500';
            case InvoiceStatus.CANCELLED:
            case InvoiceStatus.REFUNDED:
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    };

    const isOverdue =
        invoice.invoiceStatus === InvoiceStatus.SENT &&
        invoice.dueDate &&
        new Date(invoice.dueDate) < new Date();

    return (
        <Card className={isOverdue ? 'border-red-500 border-2' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice #{invoice.invoiceNumber}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1 mt-2">
                            {invoice.guest && (
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {invoice.guest.firstName} {invoice.guest.lastName}
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <Badge className={getStatusColor(invoice.invoiceStatus)}>
                        {invoice.invoiceStatus}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">
                                {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        {invoice.dueDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Due:</span>
                                <span
                                    className={`font-medium ${
                                        isOverdue ? 'text-red-600' : ''
                                    }`}
                                >
                                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                                {invoice.currency || 'USD'} {invoice.subtotal.toFixed(2)}
                            </span>
                        </div>
                        {invoice.taxAmount && invoice.taxAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax:</span>
                                <span className="font-medium">
                                    {invoice.currency || 'USD'} {invoice.taxAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {invoice.serviceCharge && invoice.serviceCharge > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Service Charge:</span>
                                <span className="font-medium">
                                    {invoice.currency || 'USD'}{' '}
                                    {invoice.serviceCharge.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {invoice.discountAmount && invoice.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>
                                    -{invoice.currency || 'USD'}{' '}
                                    {invoice.discountAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Total:</span>
                            <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {invoice.currency || 'USD'} {invoice.totalAmount.toFixed(2)}
                            </span>
                        </div>
                        {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                            <div className="flex justify-between text-sm pt-1">
                                <span className="text-gray-600">Paid:</span>
                                <span className="text-green-600 font-medium">
                                    {invoice.currency || 'USD'} {invoice.paidAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {invoice.balanceAmount !== undefined && invoice.balanceAmount > 0 && (
                            <div className="flex justify-between text-sm pt-1">
                                <span className="text-gray-600">Balance:</span>
                                <span className="text-red-600 font-medium">
                                    {invoice.currency || 'USD'}{' '}
                                    {invoice.balanceAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    {canManage && (
                        <div className="flex gap-2 pt-2 border-t">
                            <button
                                onClick={() => onView?.(invoice.id)}
                                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                View
                            </button>
                            <button
                                onClick={() => onDownload?.(invoice.id)}
                                className="text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
                            >
                                <Download className="h-3 w-3" />
                                Download
                            </button>
                            {invoice.invoiceStatus === InvoiceStatus.DRAFT && (
                                <button
                                    onClick={() => onSend?.(invoice.id)}
                                    className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Send
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

