import {useEffect, useState} from 'react';
import {MaintenanceRequestCard, MaintenanceRequestForm} from '@/components/hotel';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Filter, Plus, Search} from 'lucide-react';
import {MaintenancePriority, MaintenanceStatus, Role} from '@/types/enums';
import {useAuth} from '@/context/AuthContext';
import {hasAnyRole} from '@/utils/roleUtils';

export default function MaintenanceRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

    const canManage = hasAnyRole(user?.roles || [], [
        Role.ADMIN,
        Role.MANAGER,
        Role.DIRECTOR,
        Role.HOUSEKEEPING,
    ]);

    useEffect(() => {
        loadRequests();
        loadRooms();
    }, [statusFilter, priorityFilter, searchTerm]);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement API call
            // const response = await fetchMaintenanceRequests({ statusFilter, priorityFilter, searchTerm });
            // setRequests(response.data);
        } catch (error) {
            console.error('Failed to load maintenance requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRooms = async () => {
        try {
            // TODO: Implement API call
            // const response = await fetchRooms();
            // setRooms(response.data);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        }
    };

    const handleView = (id: number) => {
        // TODO: Navigate to detail page or open modal
        console.log('View request:', id);
    };

    const handleAssign = async (id: number) => {
        try {
            // TODO: Implement API call
            // await assignMaintenanceRequest(id, staffId);
            loadRequests();
        } catch (error) {
            console.error('Failed to assign request:', error);
        }
    };

    const handleComplete = async (id: number) => {
        try {
            // TODO: Implement API call
            // await completeMaintenanceRequest(id);
            loadRequests();
        } catch (error) {
            console.error('Failed to complete request:', error);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            // TODO: Implement API call
            // await createMaintenanceRequest(data);
            setShowForm(false);
            loadRequests();
        } catch (error) {
            console.error('Failed to create request:', error);
        }
    };

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' || request.maintenanceStatus === statusFilter;
        const matchesPriority =
            priorityFilter === 'ALL' || request.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <PageWrapper title="Maintenance Requests">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                {Object.values(MaintenanceStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priorities</SelectItem>
                                {Object.values(MaintenancePriority).map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                        {priority}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                </div>

                {showForm && (
                    <MaintenanceRequestForm
                        onSubmit={handleSubmit}
                        onCancel={() => setShowForm(false)}
                        isLoading={isLoading}
                        rooms={rooms}
                    />
                )}

                {isLoading ? (
                    <div className="text-center py-8">Loading requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No maintenance requests found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRequests.map((request) => (
                            <MaintenanceRequestCard
                                key={request.id}
                                request={request}
                                onView={handleView}
                                onAssign={canManage ? handleAssign : undefined}
                                onComplete={canManage ? handleComplete : undefined}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}

