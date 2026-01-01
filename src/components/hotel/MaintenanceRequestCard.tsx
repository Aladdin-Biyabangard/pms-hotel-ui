import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {AlertCircle, Calendar, DollarSign, User, Wrench} from 'lucide-react';
import {MaintenancePriority, MaintenanceStatus} from '@/types/enums';
import {format} from 'date-fns';

interface MaintenanceRequestCardProps {
    request: {
        id: number;
        title: string;
        description: string;
        maintenanceStatus: MaintenanceStatus;
        priority: MaintenancePriority;
        requestedDate: string;
        scheduledDate?: string;
        completedDate?: string;
        category?: string;
        subcategory?: string;
        estimatedCost?: number;
        actualCost?: number;
        assignedStaffName?: string;
        isUrgent?: boolean;
        room?: {
            roomNumber: string;
        };
    };
    onView?: (id: number) => void;
    onAssign?: (id: number) => void;
    onComplete?: (id: number) => void;
    canManage?: boolean;
}

export function MaintenanceRequestCard({
    request,
    onView,
    onAssign,
    onComplete,
    canManage = false,
}: MaintenanceRequestCardProps) {
    const getStatusColor = (status: MaintenanceStatus) => {
        switch (status) {
            case MaintenanceStatus.COMPLETED:
                return 'bg-green-500';
            case MaintenanceStatus.IN_PROGRESS:
                return 'bg-blue-500';
            case MaintenanceStatus.SCHEDULED:
                return 'bg-yellow-500';
            case MaintenanceStatus.CANCELLED:
                return 'bg-gray-500';
            default:
                return 'bg-orange-500';
        }
    };

    const getPriorityColor = (priority: MaintenancePriority) => {
        switch (priority) {
            case MaintenancePriority.EMERGENCY:
            case MaintenancePriority.URGENT:
                return 'bg-red-500';
            case MaintenancePriority.HIGH:
                return 'bg-orange-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <Card className={request.isUrgent ? 'border-red-500 border-2' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            {request.title}
                            {request.isUrgent && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                            {request.room && (
                                <span className="flex items-center gap-1">
                                    Room: {request.room.roomNumber}
                                </span>
                            )}
                            {request.category && (
                                <span className="flex items-center gap-1">
                                    {request.category}
                                    {request.subcategory && ` - ${request.subcategory}`}
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Badge className={getStatusColor(request.maintenanceStatus)}>
                            {request.maintenanceStatus.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-gray-700 line-clamp-3">{request.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Requested:</span>
                            <span className="font-medium">
                                {format(new Date(request.requestedDate), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        {request.scheduledDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Scheduled:</span>
                                <span className="font-medium">
                                    {format(new Date(request.scheduledDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                        {request.completedDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Completed:</span>
                                <span className="font-medium">
                                    {format(new Date(request.completedDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                        {request.assignedStaffName && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Assigned to:</span>
                                <span className="font-medium">{request.assignedStaffName}</span>
                            </div>
                        )}
                    </div>

                    {(request.estimatedCost || request.actualCost) && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            {request.estimatedCost && (
                                <span className="text-sm text-gray-600">
                                    Estimated: ${request.estimatedCost.toFixed(2)}
                                </span>
                            )}
                            {request.actualCost && (
                                <span className="text-sm font-medium">
                                    Actual: ${request.actualCost.toFixed(2)}
                                </span>
                            )}
                        </div>
                    )}

                    {canManage && (
                        <div className="flex gap-2 pt-2 border-t">
                            <button
                                onClick={() => onView?.(request.id)}
                                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                View Details
                            </button>
                            {request.maintenanceStatus === MaintenanceStatus.REQUESTED && (
                                <button
                                    onClick={() => onAssign?.(request.id)}
                                    className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Assign
                                </button>
                            )}
                            {request.maintenanceStatus === MaintenanceStatus.IN_PROGRESS && (
                                <button
                                    onClick={() => onComplete?.(request.id)}
                                    className="text-xs px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

