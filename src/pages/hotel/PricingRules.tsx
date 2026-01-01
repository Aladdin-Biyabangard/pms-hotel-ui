import {useCallback, useEffect, useState} from 'react';
import {PricingRuleCard, PricingRuleForm} from '@/components/hotel';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Filter, Plus, Search} from 'lucide-react';
import {PricingRuleType, Role} from '@/types/enums';
import {useAuth} from '@/context/AuthContext';
import {hasAnyRole} from '@/utils/roleUtils';
import {CreatePricingRuleRequest, pricingRuleApi, PricingRuleResponse} from '@/api/pricingRule';
import {roomTypeApi} from '@/api/roomType';
import {useToast} from '@/hooks/use-toast';

export default function PricingRules() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [rules, setRules] = useState<PricingRuleResponse[]>([]);
    const [roomTypes, setRoomTypes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRuleResponse | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [activeFilter, setActiveFilter] = useState<string>('ALL');

    const canManage = hasAnyRole(user?.role || [], [
        Role.ADMIN,
        Role.MANAGER,
        Role.DIRECTOR,
    ]);

    const loadRules = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: {
                ruleName?: string;
                ruleType?: import('@/api/pricingRule').PricingRuleType;
                isActive?: boolean;
            } = {};
            
            if (searchTerm) {
                params.ruleName = searchTerm;
            }
            if (typeFilter !== 'ALL') {
                params.ruleType = typeFilter as import('@/api/pricingRule').PricingRuleType;
            }
            if (activeFilter === 'ACTIVE') {
                params.isActive = true;
            } else if (activeFilter === 'INACTIVE') {
                params.isActive = false;
            }
            
            const response = await pricingRuleApi.getAllPricingRules(0, 100, params);
            setRules(response.content || []);
        } catch (error) {
            console.error('Failed to load pricing rules:', error);
            toast({
                title: 'Error',
                description: 'Failed to load pricing rules',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, typeFilter, activeFilter, toast]);

    const loadRoomTypes = useCallback(async () => {
        try {
            const response = await roomTypeApi.getAllRoomTypes(0, 100);
            const types = response.content?.map((rt) => rt.name) || [];
            setRoomTypes(types);
        } catch (error) {
            console.error('Failed to load room types:', error);
        }
    }, []);

    useEffect(() => {
        loadRules();
        loadRoomTypes();
    }, [loadRules, loadRoomTypes]);

    const handleEdit = (id: number) => {
        const rule = rules.find((r) => r.id === id);
        if (rule) {
            setEditingRule(rule);
            setShowForm(true);
        }
    };

    const handleToggle = async (id: number) => {
        const rule = rules.find((r) => r.id === id);
        if (!rule) return;
        
        try {
            await pricingRuleApi.toggleActive(id, !rule.isActive);
            toast({
                title: 'Success',
                description: `Rule ${rule.isActive ? 'deactivated' : 'activated'} successfully`,
            });
            loadRules();
        } catch (error) {
            console.error('Failed to toggle rule:', error);
            toast({
                title: 'Error',
                description: 'Failed to toggle rule status',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pricing rule?')) return;
        try {
            await pricingRuleApi.deletePricingRule(id);
            toast({
                title: 'Success',
                description: 'Pricing rule deleted successfully',
            });
            loadRules();
        } catch (error) {
            console.error('Failed to delete rule:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete pricing rule',
                variant: 'destructive',
            });
        }
    };

    const handleSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            const request: CreatePricingRuleRequest = {
                ruleName: data.ruleName,
                ruleType: data.ruleType,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                discountPercentage: data.discountPercentage,
                discountAmount: data.fixedDiscountAmount,
                priceAdjustment: data.priceMultiplier,
                minimumNights: data.minNights,
                maximumNights: data.maxNights,
                advanceBookingDays: data.advanceBookingDays,
                isActive: data.isActive,
                description: data.description,
            };
            
            if (editingRule) {
                await pricingRuleApi.updatePricingRule(editingRule.id, request);
                toast({
                    title: 'Success',
                    description: 'Pricing rule updated successfully',
                });
            } else {
                await pricingRuleApi.createPricingRule(request);
                toast({
                    title: 'Success',
                    description: 'Pricing rule created successfully',
                });
            }
            setShowForm(false);
            setEditingRule(null);
            loadRules();
        } catch (error) {
            console.error('Failed to save rule:', error);
            toast({
                title: 'Error',
                description: 'Failed to save pricing rule',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRules = rules.filter((rule) => {
        const matchesSearch =
            rule.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'ALL' || rule.ruleType === typeFilter;
        const matchesActive =
            activeFilter === 'ALL' ||
            (activeFilter === 'ACTIVE' && rule.isActive) ||
            (activeFilter === 'INACTIVE' && !rule.isActive);
        return matchesSearch && matchesType && matchesActive;
    });

    return (
        <PageWrapper title="Pricing Rules">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search rules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                {Object.values(PricingRuleType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={activeFilter} onValueChange={setActiveFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {canManage && (
                        <Button
                            onClick={() => {
                                setEditingRule(null);
                                setShowForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Rule
                        </Button>
                    )}
                </div>

                {showForm && (
                    <PricingRuleForm
                        initialData={editingRule ? {
                            ruleName: editingRule.ruleName,
                            ruleType: editingRule.ruleType as unknown as PricingRuleType,
                            startDate: editingRule.startDate,
                            endDate: editingRule.endDate,
                            discountPercentage: editingRule.discountPercentage,
                            fixedDiscountAmount: editingRule.discountAmount,
                            priceMultiplier: editingRule.priceAdjustment,
                            minNights: editingRule.minimumNights,
                            maxNights: editingRule.maximumNights,
                            advanceBookingDays: editingRule.advanceBookingDays,
                            isActive: editingRule.isActive,
                            description: editingRule.description,
                        } : undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingRule(null);
                        }}
                        isLoading={isSaving}
                        roomTypes={roomTypes}
                    />
                )}

                {isLoading ? (
                    <div className="text-center py-8">Loading rules...</div>
                ) : filteredRules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No pricing rules found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRules.map((rule) => (
                            <PricingRuleCard
                                key={rule.id}
                                rule={{
                                    id: rule.id,
                                    ruleName: rule.ruleName,
                                    ruleType: rule.ruleType as unknown as PricingRuleType,
                                    startDate: rule.startDate,
                                    endDate: rule.endDate,
                                    discountPercentage: rule.discountPercentage,
                                    fixedDiscountAmount: rule.discountAmount,
                                    priceMultiplier: rule.priceAdjustment,
                                    minNights: rule.minimumNights,
                                    maxNights: rule.maximumNights,
                                    advanceBookingDays: rule.advanceBookingDays,
                                    isActive: rule.isActive,
                                    description: rule.description,
                                }}
                                onEdit={canManage ? handleEdit : undefined}
                                onToggle={canManage ? handleToggle : undefined}
                                onDelete={canManage ? handleDelete : undefined}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}

