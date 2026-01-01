import {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Bed, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Trash2, Users, X} from 'lucide-react';
import {roomTypeApi, RoomTypeResponse} from '@/api/roomType';
import {toast} from 'sonner';
import {EntityStatus} from '@/types/enums';
import {Skeleton} from '@/components/ui/skeleton';

interface RoomTypeListProps {
  onEdit?: (roomType: RoomTypeResponse) => void;
  onDelete?: (roomType: RoomTypeResponse) => void;
  onCreate?: () => void;
  onView?: (roomType: RoomTypeResponse) => void;
}

export function RoomTypeList({ onEdit, onDelete, onCreate, onView }: RoomTypeListProps) {
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [codeSearch, setCodeSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(0);
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [codeSearch, nameSearch, filterStatus]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (codeSearch) params.code = codeSearch;
      if (nameSearch) params.name = nameSearch;
      if (filterStatus !== 'all') params.status = filterStatus as EntityStatus;

      const data = await roomTypeApi.getAllRoomTypes(currentPage, pageSize, params);
      setRoomTypes(data.content);
      setTotalElements(data.totalElements || data.content.length);
    } catch (error) {
      console.error('Failed to load room types', error);
      toast.error('Failed to load room types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roomType: RoomTypeResponse) => {
    if (!window.confirm(`Are you sure you want to delete room type "${roomType.name}"?`)) return;

    try {
      await roomTypeApi.deleteRoomType(roomType.id);
      toast.success('Room type deleted successfully');
      loadData();
      onDelete?.(roomType);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete room type');
    }
  };

  const clearFilters = () => {
    setCodeSearch('');
    setNameSearch('');
    setFilterStatus('all');
  };

  const hasFilters = codeSearch || nameSearch || filterStatus !== 'all';
  const totalPages = Math.ceil(totalElements / pageSize);

  if (isLoading && roomTypes.length === 0) {
    return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bed className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Room Types</CardTitle>
                <CardDescription>
                  {roomTypes.length} of {totalElements} room type(s)
                </CardDescription>
              </div>
            </div>
            {onCreate && (
                <Button onClick={onCreate} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room Type
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search by code..."
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                  <X className="h-4 w-4" />
                </Button>
            )}
          </div>

          {/* Table */}
          {roomTypes.length === 0 ? (
              <div className="text-center py-12">
                <Bed className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">No room types found</p>
                {onCreate && (
                    <Button variant="outline" onClick={onCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Room Type
                    </Button>
                )}
              </div>
          ) : (
              <>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="hidden sm:table-cell text-center">
                          <Users className="h-4 w-4 mx-auto" />
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Amenities</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roomTypes.map((roomType) => (
                          <TableRow key={roomType.id} className="group">
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {roomType.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{roomType.name}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {roomType.description ? (
                                  <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                    {roomType.description}
                                  </div>
                              ) : (
                                  <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-center">
                              {roomType.maxOccupancy ? (
                                  <Badge variant="secondary">{roomType.maxOccupancy}</Badge>
                              ) : (
                                  <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {roomType.amenities && roomType.amenities.length > 0 ? (
                                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                                    {roomType.amenities.slice(0, 3).map((amenity) => (
                                        <Badge key={amenity} variant="outline" className="text-xs">
                                          {amenity}
                                        </Badge>
                                    ))}
                                    {roomType.amenities.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{roomType.amenities.length - 3}
                                        </Badge>
                                    )}
                                  </div>
                              ) : (
                                  <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                  variant={roomType.status === 'ACTIVE' ? 'default' : 'secondary'}
                                  className={roomType.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
                              >
                                {roomType.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {onView && (
                                        <DropdownMenuItem onClick={() => onView(roomType)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                    )}
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(roomType)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(roomType)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0 || isLoading}
                        >
                          Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1 || isLoading}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                )}
              </>
          )}
        </CardContent>
      </Card>
  );
}
