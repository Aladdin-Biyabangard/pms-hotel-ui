import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {X} from 'lucide-react';
import {staffApi, UserResponseForAdmin} from '@/api/staff';
import {toast} from 'sonner';
import {ConfirmDialog} from './ConfirmDialog';

// Define hardcoded roles based on backend logic (since backend might not have a get-all-roles endpoint)
// Or better, fetch from backend if possible. 
// Based on AuthService.java, roles are Enums. We can hardcode them here to match.
const AVAILABLE_ROLES = [
    "ADMIN",
    "FRONT_DESK",
    "HOUSEKEEPING",
    "MANAGER",
    "ACCOUNTING"
];

interface RoleAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserResponseForAdmin | null;
    onSuccess: () => void;
}

export const RoleAssignModal: React.FC<RoleAssignModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [roleToRemove, setRoleToRemove] = useState<string | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    const handleAssign = async () => {
        if (!user || !selectedRole) return;
        setIsLoading(true);
        try {
            await staffApi.assignRole(user.email, selectedRole);
            toast.success(`Role ${selectedRole} assigned to ${user.firstName} ${user.lastName}`);
            setSelectedRole('');
            onSuccess();
        } catch (error: any) {
            console.error("Failed to assign role", error);
            const errorMessage = error?.response?.data?.message || "Failed to assign role";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveClick = (role: string) => {
        setRoleToRemove(role);
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveConfirm = async () => {
        if (!user || !roleToRemove) return;
        setIsLoading(true);
        try {
            await staffApi.removeRole(user.email, roleToRemove);
            toast.success(`Role ${roleToRemove} removed from ${user.firstName} ${user.lastName}`);
            setRoleToRemove(null);
            setIsRemoveDialogOpen(false);
            onSuccess();
        } catch (error: any) {
            console.error("Failed to remove role", error);
            const errorMessage = error?.response?.data?.message || "Failed to remove role";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setSelectedRole('');
            onClose();
        }
    };

    if (!user) return null;

    const availableRolesToAssign = AVAILABLE_ROLES.filter(r => !user.roles.includes(r));

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Manage Roles</DialogTitle>
                        <DialogDescription>
                            Assign or remove roles for {user.firstName} {user.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-3">
                            <Label>Current Roles</Label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                                {user.roles.length > 0 ? (
                                    user.roles.map(role => (
                                        <Badge key={role} variant="secondary" className="text-sm px-3 py-1 flex items-center gap-2">
                                            {role.replace('_', ' ')}
                                            <button
                                                onClick={() => handleRemoveClick(role)}
                                                disabled={isLoading}
                                                className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                                title="Remove Role"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">No roles assigned</span>
                                )}
                            </div>
                        </div>

                        {availableRolesToAssign.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="role">Assign New Role</Label>
                                <Select onValueChange={setSelectedRole} value={selectedRole} disabled={isLoading}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role to assign" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRolesToAssign.map(role => (
                                            <SelectItem key={role} value={role}>
                                                {role.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {availableRolesToAssign.length === 0 && (
                            <div className="text-sm text-muted-foreground italic">
                                All available roles have been assigned to this user.
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                            Close
                        </Button>
                        {availableRolesToAssign.length > 0 && (
                            <Button onClick={handleAssign} disabled={!selectedRole || isLoading}>
                                {isLoading ? "Assigning..." : "Assign Role"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={isRemoveDialogOpen}
                onClose={() => {
                    setIsRemoveDialogOpen(false);
                    setRoleToRemove(null);
                }}
                onConfirm={handleRemoveConfirm}
                title="Remove Role"
                description={`Are you sure you want to remove the role "${roleToRemove?.replace('_', ' ')}" from ${user.firstName} ${user.lastName}?`}
                confirmText="Remove Role"
                cancelText="Cancel"
                variant="destructive"
                isLoading={isLoading}
            />
        </>
    );
};
