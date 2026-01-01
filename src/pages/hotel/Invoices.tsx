import {useEffect, useState} from 'react';
import {InvoiceCard} from '@/components/hotel';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Download, Filter, Search} from 'lucide-react';
import {InvoiceStatus, Role} from '@/types/enums';
import {useAuth} from '@/context/AuthContext';
import {hasAnyRole} from '@/utils/roleUtils';

export default function Invoices() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const canManage = hasAnyRole(user?.roles || [], [
        Role.ADMIN,
        Role.MANAGER,
        Role.DIRECTOR,
        Role.ACCOUNTING,
        Role.FRONT_DESK,
    ]);

    useEffect(() => {
        loadInvoices();
    }, [statusFilter, dateRange, searchTerm]);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call
            // const response = await fetchInvoices({ statusFilter, dateRange, searchTerm });
            // setInvoices(response.data);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (id: number) => {
        // TODO: Navigate to detail page or open modal
        console.log('View invoice:', id);
    };

    const handleDownload = async (id: number) => {
        try {
            // TODO: Implement API call
            // await downloadInvoice(id);
        } catch (error) {
            console.error('Failed to download invoice:', error);
        }
    };

    const handleSend = async (id: number) => {
        try {
            // TODO: Implement API call
            // await sendInvoice(id);
            loadInvoices();
        } catch (error) {
            console.error('Failed to send invoice:', error);
        }
    };

    const handleExport = async () => {
        try {
            // TODO: Implement API call
            // await exportInvoices({ statusFilter, dateRange });
        } catch (error) {
            console.error('Failed to export invoices:', error);
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' || invoice.invoiceStatus === statusFilter;
        const matchesDateRange =
            !dateRange.start ||
            !dateRange.end ||
            (new Date(invoice.invoiceDate) >= new Date(dateRange.start) &&
                new Date(invoice.invoiceDate) <= new Date(dateRange.end));
        return matchesSearch && matchesStatus && matchesDateRange;
    });

    const totalAmount = filteredInvoices.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0),
        0
    );
    const paidAmount = filteredInvoices.reduce(
        (sum, inv) => sum + (inv.paidAmount || 0),
        0
    );
    const balanceAmount = filteredInvoices.reduce(
        (sum, inv) => sum + (inv.balanceAmount || 0),
        0
    );

    return (
        <PageWrapper title="Invoices">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search invoices..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                {Object.values(InvoiceStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="date"
                            placeholder="Start Date"
                            value={dateRange.start}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, start: e.target.value })
                            }
                            className="w-40"
                        />
                        <Input
                            type="date"
                            placeholder="End Date"
                            value={dateRange.end}
                            onChange={(e) =>
                                setDateRange({ ...dateRange, end: e.target.value })
                            }
                            className="w-40"
                        />
                    </div>
                    {canManage && (
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Paid</div>
                        <div className="text-2xl font-bold">${paidAmount.toFixed(2)}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Balance</div>
                        <div className="text-2xl font-bold">${balanceAmount.toFixed(2)}</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Loading invoices...</div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No invoices found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceCard
                                key={invoice.id}
                                invoice={invoice}
                                onView={handleView}
                                onDownload={canManage ? handleDownload : undefined}
                                onSend={canManage ? handleSend : undefined}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}

