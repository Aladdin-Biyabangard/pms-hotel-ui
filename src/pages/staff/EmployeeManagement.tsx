import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {staffApi, UserCriteria, UserResponseForAdmin} from '@/api/staff';
import {toast} from 'sonner';
import {RoleAssignModal} from '@/components/staff/RoleAssignModal';
import {EmployeeForm} from '@/components/staff/EmployeeForm';
import {ConfirmDialog} from '@/components/staff/ConfirmDialog';
import {RegisterRequest} from '@/api/auth';
import {EntityStatus} from '@/types/enums';
import {Plus, Power, PowerOff, Search, Trash2, UserCog, X,} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: EntityStatus.ACTIVE, label: 'Active' },
    { value: EntityStatus.INACTIVE, label: 'Inactive' },
    { value: EntityStatus.DELETED, label: 'Deleted' },
    { value: EntityStatus.PENDING, label: 'Pending' },
];

const ROLE_OPTIONS = [
    { value: 'all', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'FRONT_DESK', label: 'Front Desk' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ACCOUNTING', label: 'Accounting' },
];

const EmployeeManagement: React.FC = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserResponseForAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserResponseForAdmin | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserResponseForAdmin | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Pagination and filters
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [criteria, setCriteria] = useState<UserCriteria>({});

    // Filter states
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | EntityStatus>('all');
    const [filterRole, setFilterRole] = useState<string>('all');

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            const newCriteria: UserCriteria = {};
            if (searchFirstName) newCriteria.firstName = searchFirstName;
            if (searchEmail) newCriteria.email = searchEmail;
            if (filterStatus && filterStatus !== 'all') {
                newCriteria.status = filterStatus as EntityStatus;
            }
            if (filterRole && filterRole !== 'all') newCriteria.roles = [filterRole];
            
            setCriteria(newCriteria);
            setCurrentPage(0); // Reset to first page when filters change
        }, 500);

        return () => clearTimeout(timer);
    }, [searchFirstName, searchEmail, filterStatus, filterRole]);

    useEffect(() => {
        loadUsers();
    }, [criteria]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await staffApi.getAllUsers(currentPage, pageSize, criteria);
            setUsers(data.content);
            // Calculate total pages (assuming backend returns totalElements or we estimate)
            const estimatedTotal = data.content.length === pageSize ? (currentPage + 1) * pageSize + 1 : (currentPage * pageSize) + data.content.length;
            setTotalPages(Math.ceil(estimatedTotal / pageSize));
        } catch (error: any) {
            console.error('Failed to load users', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load employee list';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEmployee = async (formData: RegisterRequest & { role: string; hotelId?: number | null }) => {
        setIsActionLoading(true);
        try {
            await staffApi.createEmployee(
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    passwordConfirm: formData.passwordConfirm,
                    hotelId: formData.hotelId || null,
                },
                formData.role
            );
            toast.success(`Employee ${formData.firstName} ${formData.lastName} created successfully`);
            setIsCreateModalOpen(false);
            loadUsers();
        } catch (error: any) {
            console.error('Failed to create employee', error);
            const errorMessage = error?.response?.data?.message || 'Failed to create employee';
            toast.error(errorMessage);
            throw error; // Re-throw to let form handle it
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleOpenRoleModal = (user: UserResponseForAdmin) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleToggleStatus = async (user: UserResponseForAdmin) => {
        const isActivating = user.status !== EntityStatus.ACTIVE;
        const action = isActivating ? 'activate' : 'deactivate';

        setIsActionLoading(true);
        try {
            if (isActivating) {
                await staffApi.activateUser(user.email);
            } else {
                await staffApi.deactivateUser(user.email);
            }
            toast.success(`Employee ${action}d successfully`);
            loadUsers();
        } catch (error: any) {
            console.error(`Failed to ${action} user`, error);
            const errorMessage = error?.response?.data?.message || `Failed to ${action} employee`;
            toast.error(errorMessage);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteClick = (user: UserResponseForAdmin) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsActionLoading(true);
        try {
            await staffApi.deleteEmployee(userToDelete.email);
            toast.success(`Employee ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
            loadUsers();
        } catch (error: any) {
            console.error('Failed to delete employee', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete employee';
            toast.error(errorMessage);
        } finally {
            setIsActionLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchFirstName('');
        setSearchEmail('');
        setFilterStatus('all');
        setFilterRole('all');
        setCriteria({});
        setCurrentPage(0);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    const getStatusBadgeVariant = (status: EntityStatus) => {
        switch (status) {
            case EntityStatus.ACTIVE:
                return 'default';
            case EntityStatus.INACTIVE:
                return 'secondary';
            case EntityStatus.DELETED:
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <PageWrapper
            title="Employee Management"
            subtitle="Manage employees, roles, and access permissions"
        >
            <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Employee
                    </Button>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name..."
                                value={searchFirstName}
                                onChange={(e) => setSearchFirstName(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(searchFirstName || searchEmail || filterStatus !== 'all' || filterRole !== 'all') && (
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

                {/* Employee Table */}
                <div className="rounded-md border">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Loading employees...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No employees found. {criteria && Object.keys(criteria).length > 0 && 'Try adjusting your filters.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={user.email}>
                                        <TableCell className="font-medium">
                                            {currentPage * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            {user.firstName} {user.lastName}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {role.replace('_', ' ')}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        No roles
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(user.status as EntityStatus)}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(user.dateCreated)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenRoleModal(user)}
                                                    title="Manage Roles"
                                                    disabled={isActionLoading}
                                                >
                                                    <UserCog className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user)}
                                                    title={
                                                        user.status === EntityStatus.ACTIVE
                                                            ? 'Deactivate'
                                                            : 'Activate'
                                                    }
                                                    disabled={isActionLoading || user.status === EntityStatus.DELETED}
                                                >
                                                    {user.status === EntityStatus.ACTIVE ? (
                                                        <PowerOff className="h-4 w-4 text-destructive" />
                                                    ) : (
                                                        <Power className="h-4 w-4 text-green-600" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(user)}
                                                    title="Delete Employee"
                                                    disabled={isActionLoading}
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
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && users.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages || 1}
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
                                disabled={users.length < pageSize || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Modals */}
                <RoleAssignModal
                    isOpen={isRoleModalOpen}
                    onClose={() => {
                        setIsRoleModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    onSuccess={loadUsers}
                />

                <EmployeeForm
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateEmployee}
                />

                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setUserToDelete(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Employee"
                    description={
                        userToDelete
                            ? `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`
                            : ''
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    isLoading={isActionLoading}
                />
            </div>
        </PageWrapper>
    );
};

export default EmployeeManagement;

