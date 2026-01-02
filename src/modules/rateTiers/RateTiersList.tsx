import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Plus} from 'lucide-react';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {toast} from 'sonner';

// Import our custom hooks
import {useRateTiers} from './hooks/useRateTiers';
import {useRateTierFilters} from './hooks/useRateTierFilters';

// Import our presentational components
import {RateTiersTable} from './components/RateTiersTable';
import {RateTiersSearch} from './components/RateTiersSearch';
import {RateTiersDialogs} from './components/RateTiersDialogs';

// Import types
import {RateTierResponse} from './api/rateTiers.api';

interface RateTiersListProps {
  ratePlanId?: number;
  onDelete?: (tier: RateTierResponse) => void;
  onCreate?: () => void;
  onEdit?: (tier: RateTierResponse) => void;
  onPriorityChange?: (tiers: RateTierResponse[]) => void;
}

export function RateTiersList({
  ratePlanId,
  onDelete,
  onCreate,
  onEdit,
  onPriorityChange
}: RateTiersListProps) {
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | undefined>(ratePlanId);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);

  // Dialog state
  const [editingTier, setEditingTier] = useState<RateTierResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewingTier, setViewingTier] = useState<RateTierResponse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Use our custom hooks
  const {
    tiers,
    isLoading,
    loadTiers,
    createTier,
    updateTier,
    deleteTier,
    updatePriorities
  } = useRateTiers({ ratePlanId: selectedRatePlan });

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredTiers,
    hasActiveFilters
  } = useRateTierFilters(tiers);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan) {
      loadTiers();
    }
  }, [selectedRatePlan, loadTiers]);

  const loadInitialData = async () => {
    try {
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(ratePlansData.content);
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const handleEdit = (tier: RateTierResponse) => {
    setEditingTier(tier);
    setEditDialogOpen(true);
    onEdit?.(tier);
  };

  const handleView = (tier: RateTierResponse) => {
    setViewingTier(tier);
    setViewDialogOpen(true);
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
    onCreate?.();
  };

  const handleEditSuccess = () => {
    loadTiers();
  };

  const handleCreateSuccess = () => {
    loadTiers();
  };

  const handleDelete = async (tier: RateTierResponse) => {
    if (!window.confirm(`Are you sure you want to delete this rate tier?`)) return;

    try {
      await deleteTier(tier.id);
      if (onDelete) {
        onDelete(tier);
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const currentTier = filteredTiers[index];
    const previousTier = filteredTiers[index - 1];

    if (!currentTier || !previousTier) return;

    try {
      await updatePriorities([
        { id: currentTier.id, priority: previousTier.priority },
        { id: previousTier.id, priority: currentTier.priority }
      ]);
      loadTiers();
      onPriorityChange?.(filteredTiers);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === filteredTiers.length - 1) return;

    const currentTier = filteredTiers[index];
    const nextTier = filteredTiers[index + 1];

    if (!currentTier || !nextTier) return;

    try {
      await updatePriorities([
        { id: currentTier.id, priority: nextTier.priority },
        { id: nextTier.id, priority: currentTier.priority }
      ]);
      loadTiers();
      onPriorityChange?.(filteredTiers);
    } catch (error) {
      // Error is handled in the hook
    }
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
    <>
      <RateTiersDialogs
        editingTier={editingTier}
        viewingTier={viewingTier}
        creatingTier={false}
        editDialogOpen={editDialogOpen}
        viewDialogOpen={viewDialogOpen}
        createDialogOpen={createDialogOpen}
        onEditDialogChange={setEditDialogOpen}
        onViewDialogChange={setViewDialogOpen}
        onCreateDialogChange={setCreateDialogOpen}
        onEditSuccess={handleEditSuccess}
        onCreateSuccess={handleCreateSuccess}
        defaultRatePlanId={selectedRatePlan}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Rate Tiers</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedRatePlan ? `${filteredTiers.length} tier(s) for selected rate plan` : 'Select a rate plan to view tiers'}
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
                    {ratePlans.map((rp) => (
                      <SelectItem key={rp.id} value={rp.id.toString()}>
                        {rp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedRatePlan ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Please select a rate plan to view tiers</p>
            </div>
          ) : (
            <>
              <RateTiersSearch
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              <RateTiersTable
                tiers={filteredTiers}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={onDelete ? handleDelete : undefined}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />

              {filteredTiers.length === 0 && tiers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No rate tiers found</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Tier
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
