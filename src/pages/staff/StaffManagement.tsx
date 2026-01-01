import React, {useEffect, useState} from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {staffApi, UserResponseForAdmin} from '@/api/staff';
import {toast} from 'sonner';
import {RoleAssignModal} from '@/components/staff/RoleAssignModal';
import {Power, PowerOff, UserCog} from 'lucide-react';

const StaffManagement: React.FC = () => {
    const [users, setUsers] = useState<UserResponseForAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserResponseForAdmin | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await staffApi.getAllUsers(0, 50); // Fetch first 50 for simplicity
            setUsers(data.content);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error("Failed to load staff list");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenRoleModal = (user: UserResponseForAdmin) => {
        setSelectedUser(user);
        setIsRoleModalOpen(true);
    };

    const handleToggleStatus = async (user: UserResponseForAdmin) => {
        const isActivating = user.status !== 'ACTIVE';
        const action = isActivating ? 'activate' : 'deactivate';

        if (!confirm(`Are you sure you want to ${action} ${user.firstName}?`)) return;

        try {
            if (isActivating) {
                await staffApi.activateUser(user.email);
            } else {
                await staffApi.deactivateUser(user.email);
            }
            toast.success(`User ${action}d successfully`);
            loadUsers();
        } catch (error) {
            console.error(`Failed to ${action} user`, error);
            toast.error(`Failed to ${action} user`);
        }
    };

    if (isLoading) {
        return <PageWrapper title="Staff Management"><div className="p-6">Loading...</div></PageWrapper>;
    }

    return (
        <PageWrapper title="Staff Management" subtitle="Manage specific roles and access for hotel staff.">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.email}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.map(role => (
                                            <Badge key={role} variant="secondary" className="text-xs">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenRoleModal(user)}
                                            title="Manage Roles"
                                        >
                                            <UserCog className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStatus(user)}
                                            title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        >
                                            {user.status === 'ACTIVE' ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-green-600" />}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <RoleAssignModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                user={selectedUser}
                onSuccess={loadUsers}
            />
        </PageWrapper>
    );
};

export default StaffManagement;
