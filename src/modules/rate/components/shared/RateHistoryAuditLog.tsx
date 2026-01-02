import {useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Collapsible, CollapsibleContent, CollapsibleTrigger,} from "@/components/ui/collapsible";
import {
    Activity,
    ArrowRight,
    Ban,
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    Copy,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    GitCompare,
    History,
    Layers,
    Minus,
    Package,
    Plus,
    RefreshCw,
    Search,
    Tag,
    Trash2,
    User
} from 'lucide-react';
import {endOfDay, format, formatDistanceToNow, parseISO, startOfDay, subDays} from 'date-fns';
import {
    AUDIT_ACTION_COLORS,
    AUDIT_ACTION_LABELS,
    ENTITY_TYPE_LABELS,
    generateFieldComparison,
    parseAuditValue,
    RateAuditAction,
    rateAuditApi,
    RateAuditCompare,
    RateAuditEntityType,
    RateAuditResponse
} from '@/api/rateAudit';
import {toast} from 'sonner';
import {cn} from '@/lib/utils';

// Action icons
const ACTION_ICONS: Record<RateAuditAction, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  BULK_UPDATE: Layers,
  COPY: Copy,
  OVERRIDE_CREATE: Calendar,
  OVERRIDE_UPDATE: Calendar,
  OVERRIDE_DELETE: Calendar,
  STOP_SELL: Ban,
  RATE_CHANGE: DollarSign,
  AVAILABILITY_CHANGE: Activity,
  TIER_UPDATE: Tag,
  PACKAGE_UPDATE: Package,
  RULE_APPLY: FileText,
};

// Entity icons
const ENTITY_ICONS: Record<RateAuditEntityType, React.ElementType> = {
  ROOM_RATE: DollarSign,
  RATE_PLAN: FileText,
  RATE_OVERRIDE: Calendar,
  RATE_TIER: Tag,
  RATE_PACKAGE_COMPONENT: Package,
  PRICING_RULE: Activity,
};

// Quick date filters
const DATE_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

interface RateHistoryAuditLogProps {
  entityType?: RateAuditEntityType;
  entityId?: number;
  compact?: boolean;
}

export function RateHistoryAuditLog({ entityType, entityId, compact = false }: RateHistoryAuditLogProps) {
  // State
  const [auditLogs, setAuditLogs] = useState<RateAuditResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('last7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState<RateAuditAction | 'ALL'>('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState<RateAuditEntityType | 'ALL'>(entityType || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail dialog
  const [selectedAudit, setSelectedAudit] = useState<RateAuditResponse | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [comparisons, setComparisons] = useState<RateAuditCompare[]>([]);
  
  // Expanded items for timeline view
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Load audit logs
  useEffect(() => {
    loadAuditLogs(true);
  }, [dateFilter, startDate, endDate, actionFilter, entityTypeFilter, entityType, entityId]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today':
        return { start: format(startOfDay(now), 'yyyy-MM-dd'), end: format(endOfDay(now), 'yyyy-MM-dd') };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: format(startOfDay(yesterday), 'yyyy-MM-dd'), end: format(endOfDay(yesterday), 'yyyy-MM-dd') };
      case 'last7days':
        return { start: format(subDays(now, 7), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'last30days':
        return { start: format(subDays(now, 30), 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
      case 'custom':
        return { start: startDate, end: endDate };
      default:
        return { start: '', end: '' };
    }
  };

  const loadAuditLogs = async (reset = false) => {
    setIsLoading(true);
    try {
      const pageToLoad = reset ? 0 : page;
      const dateRange = getDateRange();
      
      let data;
      if (entityType && entityId) {
        // Load for specific entity
        data = await rateAuditApi.getEntityAuditLogs(entityType, entityId, pageToLoad, 20);
      } else {
        // Load with filters
        data = await rateAuditApi.getAuditLogs(pageToLoad, 20, {
          entityType: entityTypeFilter !== 'ALL' ? entityTypeFilter : undefined,
          action: actionFilter !== 'ALL' ? actionFilter : undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          searchTerm: searchTerm || undefined,
        });
      }
      
      if (reset) {
        setAuditLogs(data.content);
        setPage(0);
      } else {
        setAuditLogs(prev => [...prev, ...data.content]);
      }
      
      setTotalElements(data.totalElements || 0);
      setHasMore(data.content.length === 20);
    } catch (error) {
      // If API doesn't exist yet, show empty state
      setAuditLogs([]);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    loadAuditLogs(false);
  };

  // View detail
  const viewDetail = async (audit: RateAuditResponse) => {
    setSelectedAudit(audit);
    setComparisons(generateFieldComparison(audit));
    setShowDetailDialog(true);
  };

  // Toggle expanded
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Export
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const dateRange = getDateRange();
      const blob = await rateAuditApi.exportAuditLogs(format, {
        entityType: entityTypeFilter !== 'ALL' ? entityTypeFilter : undefined,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rate-audit-log.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Group by date for timeline
  const groupedByDate = useMemo(() => {
    const groups: Record<string, RateAuditResponse[]> = {};
    auditLogs.forEach(log => {
      const date = format(parseISO(log.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [auditLogs]);

  // Render timeline item
  const renderTimelineItem = (audit: RateAuditResponse) => {
    const actionColors = AUDIT_ACTION_COLORS[audit.action] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    const ActionIcon = ACTION_ICONS[audit.action] || Edit;
    const EntityIcon = ENTITY_ICONS[audit.entityType] || FileText;
    const isExpanded = expandedItems.has(audit.id);
    
    return (
      <div key={audit.id} className="relative pl-8 pb-6 last:pb-0">
        {/* Timeline line */}
        <div className="absolute left-3 top-3 bottom-0 w-px bg-border" />
        
        {/* Timeline dot */}
        <div className={cn(
          "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center",
          actionColors.bg
        )}>
          <ActionIcon className={cn("h-3 w-3", actionColors.text)} />
        </div>
        
        {/* Content */}
        <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(audit.id)}>
          <div className="bg-card rounded-lg border p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              {/* User avatar */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getUserInitials(audit.userName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{audit.userName}</span>
                  <Badge className={cn("text-xs", actionColors.bg, actionColors.text)}>
                    {AUDIT_ACTION_LABELS[audit.action]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <EntityIcon className="h-3 w-3 mr-1" />
                    {ENTITY_TYPE_LABELS[audit.entityType]}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {audit.changeDescription || `${AUDIT_ACTION_LABELS[audit.action]} ${ENTITY_TYPE_LABELS[audit.entityType]}`}
                  {audit.entityName && <span className="font-medium"> "{audit.entityName}"</span>}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(parseISO(audit.createdAt), { addSuffix: true })}
                  </span>
                  <span>{format(parseISO(audit.createdAt), 'HH:mm:ss')}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => viewDetail(audit)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Expanded content */}
            <CollapsibleContent>
              <div className="mt-3 pt-3 border-t">
                {audit.changedFields && audit.changedFields.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">Changed fields: </span>
                    <span className="text-xs font-mono">{audit.changedFields.join(', ')}</span>
                  </div>
                )}
                
                {/* Quick diff */}
                {(audit.previousValue || audit.newValue) && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {audit.previousValue && (
                      <div className="p-2 rounded bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                        <div className="font-medium text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-1">
                          <Minus className="h-3 w-3" /> Previous
                        </div>
                        <pre className="whitespace-pre-wrap text-rose-600 dark:text-rose-400 overflow-hidden max-h-24">
                          {(() => {
                            const parsed = parseAuditValue(audit.previousValue);
                            if (typeof parsed === 'object') {
                              return Object.entries(parsed).slice(0, 4).map(([k, v]) => `${k}: ${formatValue(v)}`).join('\n');
                            }
                            return formatValue(parsed);
                          })()}
                        </pre>
                      </div>
                    )}
                    {audit.newValue && (
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="font-medium text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1">
                          <Plus className="h-3 w-3" /> New
                        </div>
                        <pre className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-400 overflow-hidden max-h-24">
                          {(() => {
                            const parsed = parseAuditValue(audit.newValue);
                            if (typeof parsed === 'object') {
                              return Object.entries(parsed).slice(0, 4).map(([k, v]) => `${k}: ${formatValue(v)}`).join('\n');
                            }
                            return formatValue(parsed);
                          })()}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => viewDetail(audit)}
                >
                  <GitCompare className="h-3 w-3 mr-1" />
                  View Full Comparison
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    );
  };

  // Compact list view
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Changes
          </h4>
          <Button variant="ghost" size="sm" onClick={() => loadAuditLogs(true)}>
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          </Button>
        </div>
        
        {auditLogs.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No changes recorded
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {auditLogs.slice(0, 10).map(audit => {
              const actionColors = AUDIT_ACTION_COLORS[audit.action];
              return (
                <div 
                  key={audit.id}
                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => viewDetail(audit)}
                >
                  <Badge className={cn("text-xs shrink-0", actionColors.bg, actionColors.text)}>
                    {AUDIT_ACTION_LABELS[audit.action]}
                  </Badge>
                  <span className="text-sm truncate flex-1">
                    {audit.changeDescription || `${ENTITY_TYPE_LABELS[audit.entityType]}`}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(parseISO(audit.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Detail Dialog */}
        {selectedAudit && (
          <DetailDialog 
            audit={selectedAudit}
            comparisons={comparisons}
            open={showDetailDialog}
            onClose={() => setShowDetailDialog(false)}
            formatValue={formatValue}
          />
        )}
      </div>
    );
  }

  // Full view
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-zinc-50 dark:from-slate-950/50 dark:to-zinc-950/50 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-slate-600" />
              Rate History & Audit Log
            </CardTitle>
            <CardDescription>
              Track all rate-related changes with full audit trail
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={() => loadAuditLogs(true)} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map(f => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {dateFilter === 'custom' && (
            <>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px]"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px]"
              />
            </>
          )}
          
          <Separator orientation="vertical" className="h-8" />
          
          {/* Action Filter */}
          {!entityType && (
            <Select 
              value={actionFilter} 
              onValueChange={(v) => setActionFilter(v as RateAuditAction | 'ALL')}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                {Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Entity Type Filter */}
          {!entityType && (
            <Select 
              value={entityTypeFilter} 
              onValueChange={(v) => setEntityTypeFilter(v as RateAuditEntityType | 'ALL')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entities</SelectItem>
                {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex-1" />
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          
          <Badge variant="outline">{totalElements} records</Badge>
        </div>

        {/* Timeline View */}
        {isLoading && auditLogs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading audit logs...
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">No Audit Records</p>
            <p className="text-sm">Rate changes will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, logs]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {logs.length} change{logs.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Timeline items */}
                <div className="ml-2">
                  {logs.map(log => renderTimelineItem(log))}
                </div>
              </div>
            ))}
            
            {/* Load more */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Detail Dialog */}
      {selectedAudit && (
        <DetailDialog 
          audit={selectedAudit}
          comparisons={comparisons}
          open={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          formatValue={formatValue}
        />
      )}
    </Card>
  );
}

// Separate component for detail dialog
function DetailDialog({
  audit,
  comparisons,
  open,
  onClose,
  formatValue,
}: {
  audit: RateAuditResponse;
  comparisons: RateAuditCompare[];
  open: boolean;
  onClose: () => void;
  formatValue: (value: any) => string;
}) {
  const actionColors = AUDIT_ACTION_COLORS[audit.action];
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Change Details
          </DialogTitle>
          <DialogDescription>
            {format(parseISO(audit.createdAt), 'MMMM d, yyyy at HH:mm:ss')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Action</div>
              <Badge className={cn(actionColors.bg, actionColors.text)}>
                {AUDIT_ACTION_LABELS[audit.action]}
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Entity Type</div>
              <div className="font-medium">{ENTITY_TYPE_LABELS[audit.entityType]}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Changed By</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{audit.userName}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Entity ID</div>
              <div className="font-mono">{audit.entityId}</div>
            </div>
          </div>

          {audit.changeDescription && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Description</div>
              <div>{audit.changeDescription}</div>
            </div>
          )}

          <Separator />

          {/* Comparison */}
          <div>
            <h4 className="text-sm font-medium mb-3">Field Changes</h4>
            
            {comparisons.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No field-level changes available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Field</TableHead>
                    <TableHead>Previous Value</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>New Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisons.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{comp.fieldLabel}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "p-2 rounded text-sm font-mono",
                          comp.changeType === 'removed' 
                            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                            : comp.changeType === 'modified'
                            ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 line-through"
                            : "text-muted-foreground"
                        )}>
                          {formatValue(comp.previousValue)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "p-2 rounded text-sm font-mono",
                          comp.changeType === 'added' || comp.changeType === 'modified'
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                            : "text-muted-foreground"
                        )}>
                          {formatValue(comp.newValue)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Metadata */}
          {(audit.ipAddress || audit.userAgent) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Session Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {audit.ipAddress && (
                    <div>
                      <span className="text-muted-foreground">IP Address: </span>
                      <span className="font-mono">{audit.ipAddress}</span>
                    </div>
                  )}
                  {audit.userAgent && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">User Agent: </span>
                      <span className="font-mono text-xs break-all">{audit.userAgent}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

