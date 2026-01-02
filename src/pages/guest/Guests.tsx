import React, {useEffect, useState} from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ConfirmDialog} from '@/components/staff/ConfirmDialog';
import {GuestCriteria, GuestResponse, guestsApi} from '@/api/guests';
import {toast} from 'sonner';
import {useNavigate} from 'react-router-dom';
import {Edit, Eye, Plus, Search, Trash2, User, X} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {GuestType} from '@/types/enums';
import {Pagination} from '@/components/ui/pagination';

const GUEST_TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: GuestType.INDIVIDUAL, label: 'Individual' },
    { value: GuestType.CORPORATE, label: 'Corporate' },
    { value: GuestType.GROUP, label: 'Group' },
    { value: GuestType.VIP, label: 'VIP' },
    { value: GuestType.LOYALTY_MEMBER, label: 'Loyalty Member' },
];

const Guests: React.FC = () => {
    const [guests, setGuests] = useState<GuestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState<GuestResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination and filters
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [criteria, setCriteria] = useState<GuestCriteria>({});
    
    // Filter states
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [filterGuestType, setFilterGuestType] = useState<string>('all');
    const [filterLoyaltyMember, setFilterLoyaltyMember] = useState<string>('all');

    const navigate = useNavigate();

    useEffect(() => {
        loadGuests();
    }, [currentPage, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newCriteria: GuestCriteria = {};
            if (searchFirstName) newCriteria.firstName = searchFirstName;
            if (searchLastName) newCriteria.lastName = searchLastName;
            if (searchEmail) newCriteria.email = searchEmail;
            if (searchPhone) newCriteria.phone = searchPhone;
            if (filterGuestType && filterGuestType !== 'all') {
                newCriteria.guestType = filterGuestType as GuestType;
            }
            if (filterLoyaltyMember && filterLoyaltyMember !== 'all') {
                newCriteria.loyaltyMember = filterLoyaltyMember === 'true';
            }
            
            setCriteria(newCriteria);
            setCurrentPage(0);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchFirstName, searchLastName, searchEmail, searchPhone, filterGuestType, filterLoyaltyMember]);

    useEffect(() => {
        loadGuests();
    }, [criteria]);

    const loadGuests = async () => {
        try {
            setIsLoading(true);
            const data = await guestsApi.getAllGuestsWithCriteria(currentPage, pageSize, criteria);
            setGuests(data.content);
            const estimatedTotal = data.content.length === pageSize ? (currentPage + 1) * pageSize + 1 : (currentPage * pageSize) + data.content.length;
            setTotalPages(Math.ceil(estimatedTotal / pageSize));
        } catch (error: any) {
            console.error('Failed to load guests', error);
            const errorMessage = error.response?.data?.message || 
                (error.response?.status === 403 ? "You don't have permission to view guests" :
                 error.response?.status === 401 ? "Please log in again" :
                 "Failed to load guests");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchFirstName('');
        setSearchLastName('');
        setSearchEmail('');
        setSearchPhone('');
        setFilterGuestType('all');
        setFilterLoyaltyMember('all');
        setCriteria({});
        setCurrentPage(0);
    };

    const handleCreateGuest = () => {
        navigate('/guests/new');
    };

    const handleEditGuest = (guest: GuestResponse) => {
        navigate(`/guests/${guest.id}/edit`);
    };

    const handleDeleteGuest = (guest: GuestResponse) => {
        setGuestToDelete(guest);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!guestToDelete) return;

        try {
            setIsDeleting(true);
            await guestsApi.deleteGuest(guestToDelete.id);
            toast.success('Guest deleted successfully');
            loadGuests();
            setIsDeleteDialogOpen(false);
            setGuestToDelete(null);
        } catch (error: any) {
            console.error('Failed to delete guest', error);
            toast.error(error.response?.data?.message || 'Failed to delete guest');
        } finally {
            setIsDeleting(false);
        }
    };


    const handleViewGuest = (guest: GuestResponse) => {
        navigate(`/guests/${guest.id}`);
    };

    return (
        <PageWrapper title="Guest Management" subtitle="Manage hotel guests and their information">
            <div className="space-y-6">
                {/* Header Actions and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <Button onClick={handleCreateGuest}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Guest
                    </Button>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="First name..."
                                value={searchFirstName}
                                onChange={(e) => setSearchFirstName(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Last name..."
                                value={searchLastName}
                                onChange={(e) => setSearchLastName(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Phone..."
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={filterGuestType} onValueChange={setFilterGuestType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Guest Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {GUEST_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterLoyaltyMember} onValueChange={setFilterLoyaltyMember}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Loyalty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="true">Loyalty Member</SelectItem>
                                <SelectItem value="false">Not Loyalty</SelectItem>
                            </SelectContent>
                        </Select>
                        {(searchFirstName || searchLastName || searchEmail || searchPhone || filterGuestType !== 'all' || filterLoyaltyMember !== 'all') && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearFilters}
                                title="Clear filters"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Guests List */}
                {isLoading && guests.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading guests...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : guests.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <User className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium mb-2">No guests found</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {criteria && Object.keys(criteria).length > 0 ? 'Try adjusting your filters.' : 'No guests have been added yet.'}
                                </p>
                                <Button onClick={handleCreateGuest}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Guest
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guests.map((guest) => (
                            <Card key={guest.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {guest.firstName} {guest.lastName}
                                                </CardTitle>
                                                {guest.email && (
                                                    <p className="text-sm text-muted-foreground">{guest.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {guest.loyaltyMember && (
                                                <Badge variant="default" className="text-xs">
                                                    VIP
                                                </Badge>
                                            )}
                                            {guest.guestType && (
                                                <Badge variant="outline" className="text-xs">
                                                    {guest.guestType.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium">{guest.phone}</p>
                                    </div>
                                    {(guest.city || guest.country) && (
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Location</p>
                                            <p className="font-medium">
                                                {[guest.city, guest.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                    {guest.loyaltyPoints !== undefined && guest.loyaltyPoints !== null && guest.loyaltyPoints > 0 && (
                                        <div className="text-sm">
                                            <p className="text-muted-foreground">Loyalty Points</p>
                                            <p className="font-medium">{guest.loyaltyPoints.toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleViewGuest(guest)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEditGuest(guest)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteGuest(guest)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && guests.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        showPageNumbers={false}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setGuestToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Delete Guest"
                    description={
                        guestToDelete
                            ? `Are you sure you want to delete ${guestToDelete.firstName} ${guestToDelete.lastName}? This action cannot be undone.`
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
};

export default Guests;

