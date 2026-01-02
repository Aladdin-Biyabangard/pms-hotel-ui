import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  AlertTriangle
} from 'lucide-react';
import { RatePlanAnalytics } from '../../hooks/useRatePlanAnalytics';
import { cn } from '@/lib/utils';

interface RatePlanAnalyticsTableProps {
  analytics: RatePlanAnalytics;
  isLoading?: boolean;
}

type SortField = 'name' | 'averagePrice' | 'totalRates' | 'priceVariance' | 'status';
type SortDirection = 'asc' | 'desc';

export function RatePlanAnalyticsTable({ analytics, isLoading }: RatePlanAnalyticsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let data = analytics.ratePlansWithPricing || [];

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rateType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    // Apply outlier filter
    if (showOutliersOnly) {
      data = data.filter(item => item.isOutlier);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'priceVariance') {
        aValue = a.priceVariance || 0;
        bValue = b.priceVariance || 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [analytics.ratePlansWithPricing, searchTerm, sortField, sortDirection, statusFilter, showOutliersOnly]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />;
  };

  const outlierCount = analytics.ratePlansWithPricing?.filter(p => p.isOutlier).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Plan Analytics</CardTitle>
          <CardDescription>Loading table data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Plan Analytics</CardTitle>
        <CardDescription>
          Detailed analysis with outlier detection and sorting capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rate plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showOutliersOnly ? "default" : "outline"}
            onClick={() => setShowOutliersOnly(!showOutliersOnly)}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Outliers ({outlierCount})
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold gap-2"
                  >
                    Rate Plan
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('averagePrice')}
                    className="h-auto p-0 font-semibold gap-2"
                  >
                    Avg Price
                    {getSortIcon('averagePrice')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('priceVariance')}
                    className="h-auto p-0 font-semibold gap-2"
                  >
                    Variance
                    {getSortIcon('priceVariance')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('totalRates')}
                    className="h-auto p-0 font-semibold gap-2"
                  >
                    Rates
                    {getSortIcon('totalRates')}
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No rate plans found matching the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className={cn(
                      plan.isOutlier && "bg-amber-50/50 dark:bg-amber-900/10"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {plan.isOutlier && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-xs text-muted-foreground">{plan.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {plan.averagePrice ? formatCurrency(plan.averagePrice) : '—'}
                    </TableCell>
                    <TableCell>
                      {plan.priceVariance !== undefined ? (
                        <span className={cn(
                          plan.priceVariance > 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {plan.priceVariance > 0 ? '+' : ''}{formatPercent(plan.priceVariance)}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.totalRates || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{plan.rateType.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.rateCategoryName ? (
                        <Badge variant="outline">{plan.rateCategoryName}</Badge>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Showing {filteredAndSortedData.length} of {analytics.ratePlansWithPricing?.length || 0} rate plans
          </span>
          {outlierCount > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {outlierCount} outliers detected
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
