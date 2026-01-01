import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {MaintenancePriority} from '@/types/enums';

interface MaintenanceRequestFormData {
    title: string;
    description: string;
    priority: MaintenancePriority;
    category?: string;
    subcategory?: string;
    estimatedCost?: number;
    scheduledDate?: string;
    roomId?: number;
    isUrgent?: boolean;
}

interface MaintenanceRequestFormProps {
    initialData?: MaintenanceRequestFormData;
    onSubmit: (data: MaintenanceRequestFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    rooms?: Array<{ id: number; roomNumber: string }>;
}

export function MaintenanceRequestForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    rooms = [],
}: MaintenanceRequestFormProps) {
    const [formData, setFormData] = useState<MaintenanceRequestFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        priority: initialData?.priority || MaintenancePriority.NORMAL,
        category: initialData?.category || '',
        subcategory: initialData?.subcategory || '',
        estimatedCost: initialData?.estimatedCost,
        scheduledDate: initialData?.scheduledDate || '',
        roomId: initialData?.roomId,
        isUrgent: initialData?.isUrgent || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Maintenance Request</CardTitle>
                <CardDescription>Report an issue that needs maintenance</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="e.g., Broken AC in Room 101"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={4}
                            placeholder="Describe the issue in detail..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomId">Room</Label>
                            <Select
                                value={formData.roomId?.toString() || ''}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, roomId: parseInt(value) })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.roomNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority *</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        priority: value as MaintenancePriority,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={MaintenancePriority.LOW}>Low</SelectItem>
                                    <SelectItem value={MaintenancePriority.NORMAL}>
                                        Normal
                                    </SelectItem>
                                    <SelectItem value={MaintenancePriority.HIGH}>High</SelectItem>
                                    <SelectItem value={MaintenancePriority.URGENT}>
                                        Urgent
                                    </SelectItem>
                                    <SelectItem value={MaintenancePriority.EMERGENCY}>
                                        Emergency
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                placeholder="e.g., HVAC, Plumbing, Electrical"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategory</Label>
                            <Input
                                id="subcategory"
                                value={formData.subcategory}
                                onChange={(e) =>
                                    setFormData({ ...formData, subcategory: e.target.value })
                                }
                                placeholder="e.g., Air Conditioning"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="estimatedCost">Estimated Cost</Label>
                            <Input
                                id="estimatedCost"
                                type="number"
                                step="0.01"
                                value={formData.estimatedCost || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        estimatedCost: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledDate">Scheduled Date</Label>
                            <Input
                                id="scheduledDate"
                                type="date"
                                value={formData.scheduledDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, scheduledDate: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isUrgent"
                            checked={formData.isUrgent}
                            onChange={(e) =>
                                setFormData({ ...formData, isUrgent: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor="isUrgent">Mark as urgent</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

