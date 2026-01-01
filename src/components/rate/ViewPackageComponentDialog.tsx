import React from 'react';
import { RatePackageComponentResponse } from '@/api/ratePackageComponent';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, DollarSign, Users, Hash, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ViewPackageComponentDialogProps {
    component: RatePackageComponentResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ViewPackageComponentDialog: React.FC<ViewPackageComponentDialogProps> = ({
    component,
    open,
    onOpenChange,
}) => {
    if (!component) return null;

    const getComponentTypeLabel = (type: string) => {
        switch (type) {
            case 'SERVICE': return 'Service';
            case 'AMENITY': return 'Amenity';
            case 'FEE': return 'Fee';
            default: return type;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'default';
            case 'INACTIVE': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Package Component Details</DialogTitle>
                            <DialogDescription>
                                View details for {component.componentName}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Component Name</label>
                                <p className="text-sm font-medium">{component.componentName}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Component Code</label>
                                <p className="text-sm font-medium">{component.componentCode || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Type</label>
                                <Badge variant="outline">{getComponentTypeLabel(component.componentType)}</Badge>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <Badge variant={getStatusColor(component.status)}>{component.status}</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Pricing Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Pricing Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                                <p className="text-sm font-medium">
                                    {component.unitPrice ? formatCurrency(component.unitPrice) : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Adult Price</label>
                                <p className="text-sm font-medium">
                                    {component.priceAdult ? formatCurrency(component.priceAdult) : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Child Price</label>
                                <p className="text-sm font-medium">
                                    {component.priceChild ? formatCurrency(component.priceChild) : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Infant Price</label>
                                <p className="text-sm font-medium">
                                    {component.priceInfant ? formatCurrency(component.priceInfant) : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                                <p className="text-sm font-medium">{component.quantity || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Included</label>
                                <Badge variant={component.isIncluded ? 'default' : 'secondary'}>
                                    {component.isIncluded ? 'Included' : 'Not Included'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Additional Information
                        </h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="text-sm leading-relaxed">
                                {component.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Metadata */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Hash className="h-5 w-5" />
                            Metadata
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Component ID</label>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{component.id}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Rate Plan ID</label>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{component.ratePlanId}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="text-sm">
                                    {component.createdAt ? new Date(component.createdAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                                <p className="text-sm">
                                    {component.updatedAt ? new Date(component.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
