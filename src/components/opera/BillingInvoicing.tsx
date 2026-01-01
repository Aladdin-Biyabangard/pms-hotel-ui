import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Download, FileText, Plus, Search, Send} from "lucide-react";
import {format} from "date-fns";

interface Invoice {
  id: number;
  invoiceNumber: string;
  guestName: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  category: "room" | "service" | "food" | "other";
}

interface BillingInvoicingProps {
  invoices?: Invoice[];
  onCreateInvoice?: () => void;
  onViewInvoice?: (id: number) => void;
  onSendInvoice?: (id: number) => void;
  onDownloadInvoice?: (id: number) => void;
}

export function BillingInvoicing({
  invoices = [],
  onCreateInvoice,
  onViewInvoice,
  onSendInvoice,
  onDownloadInvoice,
}: BillingInvoicingProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
    if (searchQuery && !invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !invoice.guestName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const defaultInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: "INV-2024-001",
      guestName: "John Doe",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subtotal: 500,
      tax: 50,
      serviceCharge: 25,
      discount: 0,
      total: 575,
      paid: 0,
      balance: 575,
      status: "sent",
      items: [
        { id: 1, description: "Room 205 - 2 nights", quantity: 2, unitPrice: 150, amount: 300, category: "room" },
        { id: 2, description: "Room Service", quantity: 1, unitPrice: 50, amount: 50, category: "service" },
        { id: 3, description: "Breakfast", quantity: 2, unitPrice: 75, amount: 150, category: "food" },
      ],
    },
  ];

  const displayInvoices = invoices.length > 0 ? filteredInvoices : defaultInvoices;

  const stats = {
    total: displayInvoices.length,
    paid: displayInvoices.filter(i => i.status === "paid").length,
    pending: displayInvoices.filter(i => i.status === "sent" || i.status === "draft").length,
    overdue: displayInvoices.filter(i => i.status === "overdue").length,
    totalAmount: displayInvoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: displayInvoices.reduce((sum, i) => sum + i.paid, 0),
    outstanding: displayInvoices.reduce((sum, i) => sum + i.balance, 0),
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Invoices</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Paid</div>
            <div className="text-2xl font-bold text-success">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Overdue</div>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Amount</div>
            <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Paid Amount</div>
            <div className="text-2xl font-bold text-success">${stats.paidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Outstanding</div>
            <div className="text-2xl font-bold text-warning">${stats.outstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing & Invoicing</CardTitle>
            <Button onClick={onCreateInvoice} className="gap-2">
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.guestName}</TableCell>
                      <TableCell>{format(invoice.issueDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell>{format(invoice.dueDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>${invoice.paid.toFixed(2)}</TableCell>
                      <TableCell className={invoice.balance > 0 ? "text-warning font-medium" : ""}>
                        ${invoice.balance.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "overdue"
                              ? "destructive"
                              : invoice.status === "sent"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewInvoice?.(invoice.id)}
                            title="View"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDownloadInvoice?.(invoice.id)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onSendInvoice?.(invoice.id)}
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

