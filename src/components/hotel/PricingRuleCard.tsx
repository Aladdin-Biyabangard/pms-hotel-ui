import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, DollarSign, Percent, Tag, ToggleLeft, ToggleRight} from 'lucide-react';
import {PricingRuleType} from '@/types/enums';
import {format} from 'date-fns';

interface PricingRuleCardProps {
    rule: {
        id: number;
        ruleName: string;
        ruleType: PricingRuleType;
        startDate?: string;
        endDate?: string;
        discountPercentage?: number;
        fixedDiscountAmount?: number;
        priceMultiplier?: number;
        minNights?: number;
        maxNights?: number;
        advanceBookingDays?: number;
        roomType?: string;
        isActive: boolean;
        description?: string;
    };
    onEdit?: (id: number) => void;
    onToggle?: (id: number) => void;
    onDelete?: (id: number) => void;
    canManage?: boolean;
}

export function PricingRuleCard({
    rule,
    onEdit,
    onToggle,
    onDelete,
    canManage = false,
}: PricingRuleCardProps) {
    const getRuleTypeColor = (type: PricingRuleType) => {
        switch (type) {
            case PricingRuleType.SEASONAL:
                return 'bg-blue-500';
            case PricingRuleType.WEEKEND:
                return 'bg-purple-500';
            case PricingRuleType.HOLIDAY:
                return 'bg-red-500';
            case PricingRuleType.LOYALTY_DISCOUNT:
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            {rule.ruleName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                            <Badge className={getRuleTypeColor(rule.ruleType)}>
                                {rule.ruleType.replace('_', ' ')}
                            </Badge>
                            {rule.roomType && (
                                <span className="text-xs">Room: {rule.roomType}</span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {rule.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {rule.description && (
                        <p className="text-sm text-gray-700">{rule.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {rule.startDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Start:</span>
                                <span className="font-medium">
                                    {format(new Date(rule.startDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                        {rule.endDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">End:</span>
                                <span className="font-medium">
                                    {format(new Date(rule.endDate), 'MMM dd, yyyy')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t space-y-2">
                        {rule.discountPercentage && (
                            <div className="flex items-center gap-2 text-sm">
                                <Percent className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-medium">
                                    {rule.discountPercentage}%
                                </span>
                            </div>
                        )}
                        {rule.fixedDiscountAmount && (
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Fixed Discount:</span>
                                <span className="font-medium">
                                    ${rule.fixedDiscountAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {rule.priceMultiplier && (
                            <div className="flex items-center gap-2 text-sm">
                                <Percent className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Multiplier:</span>
                                <span className="font-medium">
                                    {rule.priceMultiplier}x
                                </span>
                            </div>
                        )}
                        {rule.minNights && (
                            <div className="text-sm text-gray-600">
                                Min Nights: {rule.minNights}
                            </div>
                        )}
                        {rule.maxNights && (
                            <div className="text-sm text-gray-600">
                                Max Nights: {rule.maxNights}
                            </div>
                        )}
                        {rule.advanceBookingDays && (
                            <div className="text-sm text-gray-600">
                                Advance Booking: {rule.advanceBookingDays} days
                            </div>
                        )}
                    </div>

                    {canManage && (
                        <div className="flex gap-2 pt-2 border-t">
                            <button
                                onClick={() => onEdit?.(rule.id)}
                                className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onToggle?.(rule.id)}
                                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                {rule.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => onDelete?.(rule.id)}
                                className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

