import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {ratePlanApi, RatePlanResponse, RatePlanPageLayout, useTablePagination} from "../..";
import {Pagination} from "@/components/ui/pagination";
import {toast} from "sonner";
import {ArrowLeft, Calendar, Edit, Eye, Plus, Search, Trash2, X} from "lucide-react";
import {format} from "date-fns";
import {ConfirmDialog} from "@/components/staff/ConfirmDialog";

export default function RatePlans() {
  const navigate = useNavigate();
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ratePlanToDelete, setRatePlanToDelete] = useState<RatePlanResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');

  // Track if there's a next page
  const [hasNextPage, setHasNextPage] = useState(false);

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    setPage,
    setPageSize,
    resetPagination,
    updateTotalElements
  } = useTablePagination();

  useEffect(() => {
    loadRatePlans();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      resetPagination();
      loadRatePlans();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchCode, searchName, resetPagination]);

  const loadRatePlans = async () => {
    try {
      setIsLoading(true);
      const params: {
        code?: string;
        name?: string;
      } = {};

      if (searchCode) params.code = searchCode;
      if (searchName) params.name = searchName;

      const data = await ratePlanApi.getAllRatePlans(currentPage, pageSize, params);
      setRatePlans(data.content);

      // Determine if there's a next page by checking if we got a full page
      setHasNextPage(data.content.length === pageSize);

      // Update total elements for display (approximate)
      const approximateTotal = (currentPage + 1) * pageSize + (data.content.length < pageSize ? 0 : pageSize);
      updateTotalElements(approximateTotal);
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
  };

  const hasFilters = searchCode || searchName;

  return (
    <RatePlanPageLayout
      title="Rate Plans"
      subtitle="Manage rate plans and pricing"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/rate-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/rate-plans/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rate Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rate Plans</CardTitle>
            <CardDescription>
              {totalElements} rate plan{totalElements !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
              }}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

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
                    <Plus className="mr-2 h-4 w-4" />
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
                              <Calendar className="h-3 w-3 text-muted-foreground" />
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
                            <Badge variant={ratePlan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {ratePlan.status}
                            </Badge>
                            {ratePlan.isDefault && <Badge variant="outline">Default</Badge>}
                            {ratePlan.isPublic && <Badge variant="secondary">Public</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/rate-plans/${ratePlan.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/rate-plans/${ratePlan.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
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
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  onPageChange={setPage}
                  className="mt-4"
                />
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
    </RatePlanPageLayout>
  );
}