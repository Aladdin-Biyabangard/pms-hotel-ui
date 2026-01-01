import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {PricingRuleType} from '@/types/enums';

interface PricingRuleFormData {
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
}

interface PricingRuleFormProps {
    initialData?: PricingRuleFormData;
    onSubmit: (data: PricingRuleFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    roomTypes?: string[];
}

export function PricingRuleForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    roomTypes = [],
}: PricingRuleFormProps) {
    const [formData, setFormData] = useState<PricingRuleFormData>({
        ruleName: initialData?.ruleName || '',
        ruleType: initialData?.ruleType || PricingRuleType.SEASONAL,
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        discountPercentage: initialData?.discountPercentage,
        fixedDiscountAmount: initialData?.fixedDiscountAmount,
        priceMultiplier: initialData?.priceMultiplier,
        minNights: initialData?.minNights,
        maxNights: initialData?.maxNights,
        advanceBookingDays: initialData?.advanceBookingDays,
        roomType: initialData?.roomType || '',
        isActive: initialData?.isActive ?? true,
        description: initialData?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Pricing Rule</CardTitle>
                <CardDescription>Set up dynamic pricing rules for your hotel</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ruleName">Rule Name *</Label>
                        <Input
                            id="ruleName"
                            value={formData.ruleName}
                            onChange={(e) =>
                                setFormData({ ...formData, ruleName: e.target.value })
                            }
                            placeholder="e.g., Summer Special 2024"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ruleType">Rule Type *</Label>
                            <Select
                                value={formData.ruleType}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        ruleType: value as PricingRuleType,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PricingRuleType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="roomType">Room Type</Label>
                            <Select
                                value={formData.roomType || '_all_'}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, roomType: value === '_all_' ? undefined : value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All room types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_all_">All room types</SelectItem>
                                    {roomTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discountPercentage">Discount %</Label>
                            <Input
                                id="discountPercentage"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.discountPercentage || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountPercentage: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fixedDiscountAmount">Fixed Discount ($)</Label>
                            <Input
                                id="fixedDiscountAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.fixedDiscountAmount || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fixedDiscountAmount: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priceMultiplier">Price Multiplier</Label>
                            <Input
                                id="priceMultiplier"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.priceMultiplier || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        priceMultiplier: e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="1.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minNights">Min Nights</Label>
                            <Input
                                id="minNights"
                                type="number"
                                min="1"
                                value={formData.minNights || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minNights: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxNights">Max Nights</Label>
                            <Input
                                id="maxNights"
                                type="number"
                                min="1"
                                value={formData.maxNights || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxNights: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="30"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="advanceBookingDays">Advance Booking (days)</Label>
                            <Input
                                id="advanceBookingDays"
                                type="number"
                                min="0"
                                value={formData.advanceBookingDays || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        advanceBookingDays: e.target.value
                                            ? parseInt(e.target.value)
                                            : undefined,
                                    })
                                }
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                            placeholder="Additional details about this pricing rule..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData({ ...formData, isActive: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Rule'}
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

