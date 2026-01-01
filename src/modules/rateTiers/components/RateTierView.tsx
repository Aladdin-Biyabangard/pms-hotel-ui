import React from 'react';
import {RateTierResponse} from '../api/rateTiers.api';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {DollarSign, Hash, Layers} from 'lucide-react';

interface RateTierViewProps {
    tier: RateTierResponse | null;
    open: boolean;
    onClose: () => void;
}

export const RateTierView: React.FC<RateTierViewProps> = ({
    tier,
    open,
    onClose,
}) => {
    if (!tier) return null;

    const getAdjustmentTypeLabel = (type: string) => {
        switch (type) {
            case 'PERCENTAGE': return 'Percentage';
            case 'FIXED': return 'Fixed Amount';
            case 'MULTIPLIER': return 'Multiplier';
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatNightsRange = (minNights: number, maxNights?: number) => {
        if (maxNights) {
            return `${minNights}-${maxNights} nights`;
        }
        return `${minNights}+ nights`;
    };

    const formatAdjustmentValue = (value: number, type: string) => {
        switch (type) {
            case 'PERCENTAGE':
                return `${value}%`;
            case 'MULTIPLIER':
                return `×${value}`;
            default:
                return formatCurrency(value);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Rate Tier Details</DialogTitle>
                            <DialogDescription>
                                View details for {formatNightsRange(tier.minNights, tier.maxNights)}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                <p className="text-sm font-medium">{tier.priority || 0}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <Badge variant={getStatusColor(tier.status)}>{tier.status}</Badge>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Nights Range</label>
                                <p className="text-sm font-medium">{formatNightsRange(tier.minNights, tier.maxNights)}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Adjustment Type</label>
                                <Badge variant="outline">{getAdjustmentTypeLabel(tier.adjustmentType)}</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Adjustment Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Adjustment Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Adjustment Value</label>
                                <p className="text-lg font-semibold">
                                    {formatAdjustmentValue(tier.adjustmentValue, tier.adjustmentType)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Minimum Nights</label>
                                <p className="text-sm font-medium">{tier.minNights}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Maximum Nights</label>
                                <p className="text-sm font-medium">
                                    {tier.maxNights ? tier.maxNights : 'Unlimited'}
                                </p>
                            </div>
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
                                <label className="text-sm font-medium text-muted-foreground">Tier ID</label>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{tier.id}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Rate Plan ID</label>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{tier.ratePlanId}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="text-sm">
                                    {tier.createdAt ? new Date(tier.createdAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                                <p className="text-sm">
                                    {tier.updatedAt ? new Date(tier.updatedAt).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
