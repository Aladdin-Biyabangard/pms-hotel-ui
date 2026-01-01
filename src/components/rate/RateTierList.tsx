import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ArrowDown, ArrowUp, Edit, Plus, Trash2} from 'lucide-react';
import {rateTierApi, RateTierResponse} from '@/api/rateTier';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan';
import {toast} from 'sonner';

interface RateTierListProps {
  ratePlanId?: number;
  onEdit?: (tier: RateTierResponse) => void;
  onDelete?: (tier: RateTierResponse) => void;
  onCreate?: () => void;
  onPriorityChange?: (tiers: RateTierResponse[]) => void;
}

export function RateTierList({
  ratePlanId,
  onEdit,
  onDelete,
  onCreate,
  onPriorityChange
}: RateTierListProps) {
  const [tiers, setTiers] = useState<RateTierResponse[]>([]);
  const [sortedTiers, setSortedTiers] = useState<RateTierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | undefined>(ratePlanId);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan) {
      loadTiers();
    } else {
      setTiers([]);
      setSortedTiers([]);
    }
  }, [selectedRatePlan]);

  useEffect(() => {
    // Sort tiers by priority
    const sorted = [...tiers].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    setSortedTiers(sorted);
  }, [tiers]);

  const loadInitialData = async () => {
    try {
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(ratePlansData.content);
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const loadTiers = async () => {
    if (!selectedRatePlan) return;

    setIsLoading(true);
    try {
      const data = await rateTierApi.getAllRateTiers(0, 1000, {
        ratePlanId: selectedRatePlan
      });
      setTiers(data.content);
    } catch (error) {
      console.error('Failed to load rate tiers', error);
      toast.error('Failed to load rate tiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tier: RateTierResponse) => {
    if (!window.confirm(`Are you sure you want to delete tier for ${tier.minNights}${tier.maxNights ? `-${tier.maxNights}` : '+'} nights?`)) {
      return;
    }

    try {
      await rateTierApi.deleteRateTier(tier.id);
      toast.success('Rate tier deleted successfully');
      loadTiers();
      onDelete?.(tier);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete rate tier');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newTiers = [...sortedTiers];
    const tier = newTiers[index];
    const prevTier = newTiers[index - 1];

    // Swap priorities
    const tempPriority = tier.priority || 0;
    tier.priority = prevTier.priority || 0;
    prevTier.priority = tempPriority;

    try {
      await rateTierApi.updatePriorities([
        { id: tier.id, priority: tier.priority },
        { id: prevTier.id, priority: prevTier.priority }
      ]);

      setTiers(newTiers);
      toast.success('Priority updated');
      onPriorityChange?.(newTiers);
    } catch (error) {
      toast.error('Failed to update priority');
      loadTiers(); // Reload on error
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === sortedTiers.length - 1) return;

    const newTiers = [...sortedTiers];
    const tier = newTiers[index];
    const nextTier = newTiers[index + 1];

    // Swap priorities
    const tempPriority = tier.priority || 0;
    tier.priority = nextTier.priority || 0;
    nextTier.priority = tempPriority;

    try {
      await rateTierApi.updatePriorities([
        { id: tier.id, priority: tier.priority },
        { id: nextTier.id, priority: nextTier.priority }
      ]);

      setTiers(newTiers);
      toast.success('Priority updated');
      onPriorityChange?.(newTiers);
    } catch (error) {
      toast.error('Failed to update priority');
      loadTiers(); // Reload on error
    }
  };

  const getAdjustmentTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PERCENTAGE: { variant: 'secondary', label: 'Percentage' },
      FIXED: { variant: 'default', label: 'Fixed' },
      MULTIPLIER: { variant: 'outline', label: 'Multiplier' },
    };
    return variants[type] || { variant: 'outline' as const, label: type };
  };

  const formatNightsRange = (minNights: number, maxNights?: number) => {
    if (maxNights) {
      return `${minNights}-${maxNights} nights`;
    }
    return `${minNights}+ nights`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading rate tiers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Rate Tiers</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {sortedTiers.length} tier(s) for selected rate plan
            </p>
          </div>
          <div className="flex gap-2">
            {!ratePlanId && (
              <Select
                value={selectedRatePlan?.toString() || ''}
                onValueChange={(v) => setSelectedRatePlan(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Rate Plan" />
                </SelectTrigger>
                <SelectContent>
                  {ratePlans.map(rp => (
                    <SelectItem key={rp.id} value={rp.id.toString()}>{rp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/*{onCreate && selectedRatePlan && (*/}
            {/*  <Button onClick={onCreate} className="w-full sm:w-auto">*/}
            {/*    <Plus className="h-4 w-4 mr-2" />*/}
            {/*    */}
            {/*  </Button>*/}
            {/*)}*/}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedRatePlan ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Please select a rate plan to view tiers</p>
          </div>
        ) : sortedTiers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rate tiers found for this rate plan</p>
            {onCreate && (
              <Button variant="outline" className="mt-4" onClick={onCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Tier
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Priority</TableHead>
                  <TableHead>Nights Range</TableHead>
                  <TableHead>Adjustment Type</TableHead>
                  <TableHead className="text-right">Adjustment Value</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTiers.map((tier, index) => {
                  const typeBadge = getAdjustmentTypeBadge(tier.adjustmentType);
                  return (
                    <TableRow key={tier.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{tier.priority || 0}</span>
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sortedTiers.length - 1}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatNightsRange(tier.minNights, tier.maxNights)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {tier.adjustmentType === 'PERCENTAGE'
                          ? `${tier.adjustmentValue}%`
                          : tier.adjustmentType === 'MULTIPLIER'
                          ? `×${tier.adjustmentValue}`
                          : `$${tier.adjustmentValue.toFixed(2)}`
                        }
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={tier.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {tier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(tier)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}


                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(tier)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

