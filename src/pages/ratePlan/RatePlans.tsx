import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {ratePlanApi, RatePlanResponse} from "@/api/ratePlan";
import {toast} from "sonner";
import {ArrowLeft, Calendar, Edit, Eye, Plus, Search, Trash2, X, ChevronDown, ChevronUp, Filter} from "lucide-react";
import {format} from "date-fns";
import {ConfirmDialog} from "@/components/staff/ConfirmDialog";
import {rateTypeApi, RateTypeResponse} from "@/api/rateType";
import {EntityStatus} from "@/types/enums.ts";

export default function RatePlans() {
    const navigate = useNavigate();
    const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [ratePlanToDelete, setRatePlanToDelete] = useState<RatePlanResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [hasNext, setHasNext] = useState(true);

    // Search state
    const [searchCode, setSearchCode] = useState('');
    const [searchName, setSearchName] = useState('');

    // Advanced search state
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRateType, setFilterRateType] = useState<string>('all');
    const [filterIsPublic, setFilterIsPublic] = useState<string>('all');
    const [filterIsPackage, setFilterIsPackage] = useState<string>('all');
    const [filterIsDefault, setFilterIsDefault] = useState<string>('all');
    const [filterMinStayNights, setFilterMinStayNights] = useState<string>('');
    const [filterValidFrom, setFilterValidFrom] = useState<string>('');
    const [filterValidTo, setFilterValidTo] = useState<string>('');

    // Load rate types for advanced search
    useEffect(() => {
        const loadRateTypes = async () => {
            try {
                const data = await rateTypeApi.getAllRateTypes(0, 100);
                setRateTypes(data.content);
            } catch (error) {
                console.error('Failed to load rate types', error);
            }
        };
        loadRateTypes();
    }, []);

    useEffect(() => {
        loadRatePlans();
    }, [currentPage, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(0);
            loadRatePlans();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchCode, searchName, filterStatus, filterRateType, filterIsPublic, filterIsPackage, filterIsDefault, filterMinStayNights, filterValidFrom, filterValidTo]);

    const loadRatePlans = async () => {
        try {
            setIsLoading(true);
            const params: {
                code?: string;
                name?: string;
                status?: EntityStatus;
                rateTypeId?: number;
                isPublic?: boolean;
                isPackage?: boolean;
                isDefault?: boolean;
                minStayNights?: number;
                validFrom?: string;
                validTo?: string;
            } = {};

            // Basic search
            if (searchCode) params.code = searchCode;
            if (searchName) params.name = searchName;

            // Advanced search
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus as EntityStatus;
            }
            if (filterRateType && filterRateType !== 'all') {
                params.rateTypeId = parseInt(filterRateType);
            }
            if (filterIsPublic && filterIsPublic !== 'all') {
                params.isPublic = filterIsPublic === 'true';
            }
            if (filterIsPackage && filterIsPackage !== 'all') {
                params.isPackage = filterIsPackage === 'true';
            }
            if (filterIsDefault && filterIsDefault !== 'all') {
                params.isDefault = filterIsDefault === 'true';
            }
            if (filterMinStayNights) {
                params.minStayNights = parseInt(filterMinStayNights);
            }
            if (filterValidFrom) {
                params.validFrom = filterValidFrom;
            }
            if (filterValidTo) {
                params.validTo = filterValidTo;
            }

            const data = await ratePlanApi.getAllRatePlans(currentPage, pageSize, params);

            setRatePlans(data.content);

            setHasNext(data.content.length === pageSize);

        } catch (error: any) {
            console.error("Failed to load rate plans", error);
            toast.error(error?.response?.data?.message || "Failed to load rate plans");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!ratePlanToDelete) return;

        try {
            setIsDeleting(true);
            await ratePlanApi.deleteRatePlan(ratePlanToDelete.id);
            toast.success("Rate plan deleted successfully");
            loadRatePlans();
            setIsDeleteDialogOpen(false);
            setRatePlanToDelete(null);
        } catch (error: any) {
            console.error("Failed to delete rate plan", error);
            toast.error(error?.response?.data?.message || "Failed to delete rate plan");
        } finally {
            setIsDeleting(false);
        }
    };

    const clearFilters = () => {
        setSearchCode('');
        setSearchName('');
        setFilterStatus('all');
        setFilterRateType('all');
        setFilterIsPublic('all');
        setFilterIsPackage('all');
        setFilterIsDefault('all');
        setFilterMinStayNights('');
        setFilterValidFrom('');
        setFilterValidTo('');
    };

    const hasFilters = searchCode || searchName || filterStatus !== 'all' || filterRateType !== 'all' ||
        filterIsPublic !== 'all' || filterIsPackage !== 'all' || filterIsDefault !== 'all' ||
        filterMinStayNights || filterValidFrom || filterValidTo;

    return (
        <PageWrapper
            title="Rate Plans"
            subtitle="Manage rate plans and pricing"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => navigate("/rate-management")}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back to Dashboard
                    </Button>
                    <Button onClick={() => navigate("/rate-plans/new")}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Create Rate Plan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rate Plans</CardTitle>
                        <CardDescription>
                            Showing page {currentPage + 1}
                        </CardDescription>

                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search by code..."
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    placeholder="Search by name..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={pageSize.toString()} onValueChange={(value) => {
                                setPageSize(Number(value));
                                setCurrentPage(0);
                            }}>
                                <SelectTrigger className="w-full sm:w-[120px]">
                                    <SelectValue placeholder="Page size"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 per page</SelectItem>
                                    <SelectItem value="25">25 per page</SelectItem>
                                    <SelectItem value="50">50 per page</SelectItem>
                                    <SelectItem value="100">100 per page</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4"/>
                                Advanced
                                {showAdvancedSearch ? <ChevronUp className="h-4 w-4"/> :
                                    <ChevronDown className="h-4 w-4"/>}
                            </Button>
                            {hasFilters && (
                                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                                    <X className="h-4 w-4"/>
                                </Button>
                            )}
                        </div>

                        {/* Advanced Search */}
                        {showAdvancedSearch && (
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterRateType} onValueChange={setFilterRateType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Rate Types"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Rate Types</SelectItem>
                                        {rateTypes.map((rateType) => (
                                            <SelectItem key={rateType.id} value={rateType.id.toString()}>
                                                {rateType.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={filterIsPublic} onValueChange={setFilterIsPublic}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Public/Private"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Public</SelectItem>
                                        <SelectItem value="false">Private</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterIsPackage} onValueChange={setFilterIsPackage}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Package/Regular"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Package</SelectItem>
                                        <SelectItem value="false">Regular</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filterIsDefault} onValueChange={setFilterIsDefault}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Default/Regular"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Default</SelectItem>
                                        <SelectItem value="false">Regular</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Min stay nights..."
                                        value={filterMinStayNights}
                                        onChange={(e) => setFilterMinStayNights(e.target.value)}
                                        min="0"
                                    />
                                </div>

                                <div className="relative">
                                    <Input
                                        type="date"
                                        placeholder="Valid from..."
                                        value={filterValidFrom}
                                        onChange={(e) => setFilterValidFrom(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    <Input
                                        type="date"
                                        placeholder="Valid to..."
                                        value={filterValidTo}
                                        onChange={(e) => setFilterValidTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : ratePlans.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No rate plans found.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => navigate("/rate-plans/new")}
                                    >
                                        <Plus className="mr-2 h-4 w-4"/>
                                        Create First Rate Plan
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Rate Type</TableHead>
                                                <TableHead>Valid Period</TableHead>
                                                <TableHead>Restrictions</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ratePlans.map((ratePlan) => (
                                                <TableRow key={ratePlan.id}>
                                                    <TableCell className="font-medium">{ratePlan.code}</TableCell>
                                                    <TableCell>{ratePlan.name}</TableCell>
                                                    <TableCell>{ratePlan.rateType?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {ratePlan.validFrom && ratePlan.validTo ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Calendar className="h-3 w-3 text-muted-foreground"/>
                                                                {format(new Date(ratePlan.validFrom), "MMM dd")} - {format(new Date(ratePlan.validTo), "MMM dd, yyyy")}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">No date range</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs space-y-1">
                                                            {ratePlan.minStayNights && (
                                                                <div>Min Stay: {ratePlan.minStayNights} nights</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            <Badge
                                                                variant={ratePlan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                                {ratePlan.status}
                                                            </Badge>
                                                            {ratePlan.isDefault &&
                                                                <Badge variant="outline">Default</Badge>}
                                                            {ratePlan.isPublic &&
                                                                <Badge variant="secondary">Public</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/rate-plans/${ratePlan.id}`)}
                                                            >
                                                                <Eye className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/rate-plans/${ratePlan.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setRatePlanToDelete(ratePlan);
                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {ratePlans.length > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Page {currentPage + 1}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 0 || isLoading}
                                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        >
                                            Previous
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!hasNext || isLoading}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>

                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setRatePlanToDelete(null);
                    }}
                    onConfirm={handleDelete}
                    title="Delete Rate Plan"
                    description={
                        ratePlanToDelete
                            ? `Are you sure you want to delete rate plan "${ratePlanToDelete.name}"? This action cannot be undone.`
                            : ''
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    isLoading={isDeleting}
                />
            </div>
        </PageWrapper>
    );
}