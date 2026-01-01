import React, {useEffect, useState} from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Checkbox} from '@/components/ui/checkbox';
import {Badge} from '@/components/ui/badge';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {
    CreateHotelServiceRequest,
    HotelServiceCriteria,
    HotelServiceResponse,
    hotelServicesApi,
    UpdateHotelServiceRequest
} from '@/api/hotelServices';
import {Edit, Filter, Package, Plus, Search, Trash2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {CurrencyCode, EntityStatus, ServiceType} from '@/types/enums';

const SERVICE_TYPE_OPTIONS = Object.values(ServiceType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const CURRENCY_OPTIONS = Object.values(CurrencyCode).map(code => ({
    value: code,
    label: code
}));

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: EntityStatus.ACTIVE, label: 'Active' },
    { value: EntityStatus.INACTIVE, label: 'Inactive' },
    { value: EntityStatus.DELETED, label: 'Deleted' },
];

const HotelServices: React.FC = () => {
    const { toast } = useToast();
    const [services, setServices] = useState<HotelServiceResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editingService, setEditingService] = useState<HotelServiceResponse | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    
    // Filters
    const [searchName, setSearchName] = useState('');
    const [filterServiceType, setFilterServiceType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterIsActive, setFilterIsActive] = useState<string>('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [criteria, setCriteria] = useState<HotelServiceCriteria>({});
    
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType | ''>('');
    const [isPerPerson, setIsPerPerson] = useState(false);
    const [isPerNight, setIsPerNight] = useState(false);
    const [isPerReservation, setIsPerReservation] = useState(false);
    const [availableFromTime, setAvailableFromTime] = useState('');
    const [availableToTime, setAvailableToTime] = useState('');
    const [requiresAdvanceBooking, setRequiresAdvanceBooking] = useState(false);
    const [advanceBookingHours, setAdvanceBookingHours] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');
    const [minQuantity, setMinQuantity] = useState('1');
    const [location, setLocation] = useState('');
    const [taxIncluded, setTaxIncluded] = useState(false);
    const [discountEligible, setDiscountEligible] = useState(true);
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(CurrencyCode.USD);
    const [displayOrder, setDisplayOrder] = useState('0');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [cancellationPolicy, setCancellationPolicy] = useState('');
    const [cancellationHours, setCancellationHours] = useState('');
    const [isRefundable, setIsRefundable] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadServices();
    }, [currentPage, pageSize, criteria]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newCriteria: HotelServiceCriteria = {};
            if (searchName) newCriteria.name = searchName;
            if (filterServiceType && filterServiceType !== 'all') {
                newCriteria.serviceType = filterServiceType as ServiceType;
            }
            if (filterStatus && filterStatus !== 'all') {
                newCriteria.status = filterStatus as EntityStatus;
            }
            if (filterIsActive && filterIsActive !== 'all') {
                newCriteria.isActive = filterIsActive === 'true';
            }
            if (minPrice) newCriteria.minPrice = parseFloat(minPrice);
            if (maxPrice) newCriteria.maxPrice = parseFloat(maxPrice);
            
            setCriteria(newCriteria);
            setCurrentPage(0);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchName, filterServiceType, filterStatus, filterIsActive, minPrice, maxPrice]);

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await hotelServicesApi.getAllServices(criteria, currentPage, pageSize);
            setServices(data.content);
            setTotalElements(data.totalElements || data.content.length);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load services',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingService(null);
        resetForm();
        setShowDialog(true);
    };

    const handleEdit = (service: HotelServiceResponse) => {
        setEditingService(service);
        setName(service.name);
        setDescription(service.description || '');
        setPrice(service.price.toString());
        setServiceType(service.serviceType || '');
        setIsPerPerson(service.isPerPerson);
        setIsPerNight(service.isPerNight);
        setIsPerReservation(service.isPerReservation);
        setAvailableFromTime(service.availableFromTime || '');
        setAvailableToTime(service.availableToTime || '');
        setRequiresAdvanceBooking(service.requiresAdvanceBooking || false);
        setAdvanceBookingHours(service.advanceBookingHours?.toString() || '');
        setDurationMinutes(service.durationMinutes?.toString() || '');
        setMaxCapacity(service.maxCapacity?.toString() || '');
        setMinQuantity(service.minQuantity?.toString() || '1');
        setLocation(service.location || '');
        setTaxIncluded(service.taxIncluded || false);
        setDiscountEligible(service.discountEligible ?? true);
        setCurrencyCode(service.currencyCode || CurrencyCode.USD);
        setDisplayOrder(service.displayOrder?.toString() || '0');
        setImageUrl(service.imageUrl || '');
        setCategory(service.category || '');
        setCancellationPolicy(service.cancellationPolicy || '');
        setCancellationHours(service.cancellationHours?.toString() || '');
        setIsRefundable(service.isRefundable ?? true);
        setIsActive(service.isActive ?? true);
        setNotes(service.notes || '');
        setShowDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this service?')) {
            return;
        }
        
        try {
            await hotelServicesApi.deleteService(id);
            toast({
                title: 'Success',
                description: 'Service deleted successfully',
            });
            loadServices();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete service',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setServiceType('');
        setIsPerPerson(false);
        setIsPerNight(false);
        setIsPerReservation(false);
        setAvailableFromTime('');
        setAvailableToTime('');
        setRequiresAdvanceBooking(false);
        setAdvanceBookingHours('');
        setDurationMinutes('');
        setMaxCapacity('');
        setMinQuantity('1');
        setLocation('');
        setTaxIncluded(false);
        setDiscountEligible(true);
        setCurrencyCode(CurrencyCode.USD);
        setDisplayOrder('0');
        setImageUrl('');
        setCategory('');
        setCancellationPolicy('');
        setCancellationHours('');
        setIsRefundable(true);
        setIsActive(true);
        setNotes('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingService) {
                const updateData: UpdateHotelServiceRequest = {
                    name,
                    description: description || undefined,
                    price: parseFloat(price),
                    serviceType: serviceType || undefined,
                    isPerPerson: isPerPerson || undefined,
                    isPerNight: isPerNight || undefined,
                    isPerReservation: isPerReservation || undefined,
                    availableFromTime: availableFromTime || undefined,
                    availableToTime: availableToTime || undefined,
                    requiresAdvanceBooking: requiresAdvanceBooking || undefined,
                    advanceBookingHours: advanceBookingHours ? parseInt(advanceBookingHours) : undefined,
                    durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
                    maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
                    minQuantity: minQuantity ? parseInt(minQuantity) : undefined,
                    location: location || undefined,
                    taxIncluded: taxIncluded || undefined,
                    discountEligible: discountEligible,
                    currencyCode: currencyCode,
                    displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
                    imageUrl: imageUrl || undefined,
                    category: category || undefined,
                    cancellationPolicy: cancellationPolicy || undefined,
                    cancellationHours: cancellationHours ? parseInt(cancellationHours) : undefined,
                    isRefundable: isRefundable,
                    isActive: isActive,
                    notes: notes || undefined,
                };
                await hotelServicesApi.updateService(editingService.id, updateData);
                toast({
                    title: 'Success',
                    description: 'Service updated successfully',
                });
            } else {
                const createData: CreateHotelServiceRequest = {
                    name,
                    description: description || undefined,
                    price: parseFloat(price),
                    serviceType: serviceType || undefined,
                    isPerPerson: isPerPerson || undefined,
                    isPerNight: isPerNight || undefined,
                    isPerReservation: isPerReservation || undefined,
                    availableFromTime: availableFromTime || undefined,
                    availableToTime: availableToTime || undefined,
                    requiresAdvanceBooking: requiresAdvanceBooking || undefined,
                    advanceBookingHours: advanceBookingHours ? parseInt(advanceBookingHours) : undefined,
                    durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
                    maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
                    minQuantity: minQuantity ? parseInt(minQuantity) : undefined,
                    location: location || undefined,
                    taxIncluded: taxIncluded || undefined,
                    discountEligible: discountEligible,
                    currencyCode: currencyCode,
                    displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
                    imageUrl: imageUrl || undefined,
                    category: category || undefined,
                    cancellationPolicy: cancellationPolicy || undefined,
                    cancellationHours: cancellationHours ? parseInt(cancellationHours) : undefined,
                    isRefundable: isRefundable,
                    isActive: isActive,
                    notes: notes || undefined,
                };
                await hotelServicesApi.createService(createData);
                toast({
                    title: 'Success',
                    description: 'Service created successfully',
                });
            }
            
            setShowDialog(false);
            resetForm();
            loadServices();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save service',
                variant: 'destructive',
            });
        }
    };

    const getServiceTypeBadge = (type?: ServiceType) => {
        if (!type) return null;
        const colors: Record<string, string> = {
            BREAKFAST: 'bg-yellow-500',
            DINNER: 'bg-orange-500',
            LUNCH: 'bg-green-500',
            SPA: 'bg-purple-500',
            LAUNDRY: 'bg-blue-500',
            PARKING: 'bg-gray-500',
            ROOM_SERVICE: 'bg-pink-500',
            WIFI: 'bg-indigo-500',
            GYM: 'bg-red-500',
            POOL: 'bg-cyan-500',
        };
        return (
            <Badge className={colors[type] || 'bg-gray-500'}>
                {type.replace(/_/g, ' ')}
            </Badge>
        );
    };

    const totalPages = Math.ceil(totalElements / pageSize);

    return (
        <PageWrapper
            title="Hotel Services"
            subtitle="Manage additional services offered by your hotel"
        >
            <div className="space-y-4">
                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Services</CardTitle>
                                <CardDescription>
                                    Search and filter hotel services
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Service
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchName}
                                            onChange={(e) => setSearchName(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div>
                                        <Label>Service Type</Label>
                                        <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {SERVICE_TYPE_OPTIONS.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Active</Label>
                                        <Select value={filterIsActive} onValueChange={setFilterIsActive}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Min Price</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Price</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Services Table */}
                {loading ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading services...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : services.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by adding your first hotel service
                                </p>
                                <Button onClick={handleCreate}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Service
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Pricing Model</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                {service.name}
                                            </TableCell>
                                            <TableCell>
                                                {getServiceTypeBadge(service.serviceType)}
                                            </TableCell>
                                            <TableCell>
                                                {service.currencyCode || 'USD'} {service.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {service.isPerPerson && (
                                                        <Badge variant="outline">Per Person</Badge>
                                                    )}
                                                    {service.isPerNight && (
                                                        <Badge variant="outline">Per Night</Badge>
                                                    )}
                                                    {service.isPerReservation && (
                                                        <Badge variant="outline">Per Reservation</Badge>
                                                    )}
                                                    {!service.isPerPerson && !service.isPerNight && !service.isPerReservation && (
                                                        <Badge variant="outline">One-time</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        variant={service.status === EntityStatus.ACTIVE ? 'default' : 'secondary'}
                                                    >
                                                        {service.status}
                                                    </Badge>
                                                    {service.isActive !== undefined && (
                                                        <Badge variant={service.isActive ? 'outline' : 'secondary'}>
                                                            {service.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(service)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(service.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {!loading && services.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} services
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0 || loading}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    Page {currentPage + 1} of {totalPages || 1}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1 || loading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingService ? 'Edit Service' : 'Create New Service'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingService
                                ? 'Update service details'
                                : 'Add a new service for hotel operations'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Service Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="e.g., Breakfast, Spa Treatment"
                                />
                            </div>
                            <div>
                                <Label htmlFor="serviceType">Service Type</Label>
                                <Select value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_TYPE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the service..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="price">Price *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="currencyCode">Currency</Label>
                                <Select value={currencyCode} onValueChange={(value) => setCurrencyCode(value as CurrencyCode)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCY_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="displayOrder">Display Order</Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Pricing Model</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isPerPerson"
                                        checked={isPerPerson}
                                        onCheckedChange={(checked) => {
                                            setIsPerPerson(checked as boolean);
                                            if (checked) {
                                                setIsPerNight(false);
                                                setIsPerReservation(false);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="isPerPerson" className="font-normal">
                                        Per Person
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isPerNight"
                                        checked={isPerNight}
                                        onCheckedChange={(checked) => {
                                            setIsPerNight(checked as boolean);
                                            if (checked) {
                                                setIsPerPerson(false);
                                                setIsPerReservation(false);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="isPerNight" className="font-normal">
                                        Per Night
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isPerReservation"
                                        checked={isPerReservation}
                                        onCheckedChange={(checked) => {
                                            setIsPerReservation(checked as boolean);
                                            if (checked) {
                                                setIsPerPerson(false);
                                                setIsPerNight(false);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="isPerReservation" className="font-normal">
                                        Per Reservation (One-time)
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g., Dining, Wellness"
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., Room Service, Spa Floor 2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="availableFromTime">Available From</Label>
                                <Input
                                    id="availableFromTime"
                                    type="time"
                                    value={availableFromTime}
                                    onChange={(e) => setAvailableFromTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="availableToTime">Available To</Label>
                                <Input
                                    id="availableToTime"
                                    type="time"
                                    value={availableToTime}
                                    onChange={(e) => setAvailableToTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                                <Input
                                    id="durationMinutes"
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    placeholder="60"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxCapacity">Max Capacity</Label>
                                <Input
                                    id="maxCapacity"
                                    type="number"
                                    value={maxCapacity}
                                    onChange={(e) => setMaxCapacity(e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="minQuantity">Min Quantity</Label>
                                <Input
                                    id="minQuantity"
                                    type="number"
                                    min="1"
                                    value={minQuantity}
                                    onChange={(e) => setMinQuantity(e.target.value)}
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="advanceBookingHours">Advance Booking (hours)</Label>
                                <Input
                                    id="advanceBookingHours"
                                    type="number"
                                    value={advanceBookingHours}
                                    onChange={(e) => setAdvanceBookingHours(e.target.value)}
                                    placeholder="24"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cancellationHours">Cancellation (hours)</Label>
                                <Input
                                    id="cancellationHours"
                                    type="number"
                                    value={cancellationHours}
                                    onChange={(e) => setCancellationHours(e.target.value)}
                                    placeholder="24"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                            <Textarea
                                id="cancellationPolicy"
                                value={cancellationPolicy}
                                onChange={(e) => setCancellationPolicy(e.target.value)}
                                placeholder="Cancellation policy details..."
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Internal notes for staff..."
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Options</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="taxIncluded"
                                            checked={taxIncluded}
                                            onCheckedChange={(checked) => setTaxIncluded(checked as boolean)}
                                        />
                                        <Label htmlFor="taxIncluded" className="font-normal">
                                            Tax Included
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="discountEligible"
                                            checked={discountEligible}
                                            onCheckedChange={(checked) => setDiscountEligible(checked as boolean)}
                                        />
                                        <Label htmlFor="discountEligible" className="font-normal">
                                            Discount Eligible
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="requiresAdvanceBooking"
                                            checked={requiresAdvanceBooking}
                                            onCheckedChange={(checked) => setRequiresAdvanceBooking(checked as boolean)}
                                        />
                                        <Label htmlFor="requiresAdvanceBooking" className="font-normal">
                                            Requires Advance Booking
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isRefundable"
                                            checked={isRefundable}
                                            onCheckedChange={(checked) => setIsRefundable(checked as boolean)}
                                        />
                                        <Label htmlFor="isRefundable" className="font-normal">
                                            Refundable
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={isActive}
                                            onCheckedChange={(checked) => setIsActive(checked as boolean)}
                                        />
                                        <Label htmlFor="isActive" className="font-normal">
                                            Active
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowDialog(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingService ? 'Update' : 'Create'} Service
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
};

export default HotelServices;
