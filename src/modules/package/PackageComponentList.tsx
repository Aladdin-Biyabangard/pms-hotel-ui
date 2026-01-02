import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Plus} from 'lucide-react';
import {ratePlanApi, RatePlanResponse} from '@/modules/rate/RatePlan';
import {toast} from 'sonner';

// Import our custom hooks
import {usePackageComponents} from './hooks/usePackageComponents';
import {useComponentFilters} from './hooks/useComponentFilters';

// Import our presentational components
import {PackageComponentTable} from './components/PackageComponentTable';
import {PackageComponentSearch} from './components/PackageComponentSearch';
import {PackageComponentDialogs} from './components/PackageComponentDialogs';

// Import types
import {RatePackageComponentResponse} from './api/packageComponents.api';

interface PackageComponentListProps {
  ratePlanId?: number;
  onDelete?: (component: RatePackageComponentResponse) => void;
  onCreate?: () => void;
}

export function PackageComponentList({
  ratePlanId,
  onDelete,
  onCreate
}: PackageComponentListProps) {
  const navigate = useNavigate();
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | undefined>(ratePlanId);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);

  // Dialog state (only for viewing now)
  const [viewingComponent, setViewingComponent] = useState<RatePackageComponentResponse | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Use our custom hooks
  const {
    components,
    isLoading,
    loadComponents,
    deleteComponent
  } = usePackageComponents({ ratePlanId: selectedRatePlan });

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredComponents,
    hasActiveFilters
  } = useComponentFilters(components);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRatePlan) {
      loadComponents();
    }
  }, [selectedRatePlan, loadComponents]);

  const loadInitialData = async () => {
    try {
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(ratePlansData.content);
    } catch (error) {
      toast.error('Failed to load rate plans');
    }
  };

  const handleEdit = (component: RatePackageComponentResponse) => {
    navigate(`/rate-package-components/${component.id}/edit`);
  };

  const handleView = (component: RatePackageComponentResponse) => {
    setViewingComponent(component);
    setViewDialogOpen(true);
  };


  const handleDelete = async (component: RatePackageComponentResponse) => {
    if (!window.confirm(`Are you sure you want to delete component "${component.componentName}"?`)) return;

    try {
      await deleteComponent(component.id);
      if (onDelete) {
        onDelete(component);
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">Loading package components...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <PackageComponentDialogs
        editingComponent={null}
        viewingComponent={viewingComponent}
        editDialogOpen={false}
        viewDialogOpen={viewDialogOpen}
        onEditDialogChange={() => {}}
        onViewDialogChange={setViewDialogOpen}
        onEditSuccess={() => {}}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Package Components</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredComponents.length} of {components.length} component(s) for selected rate plan
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
                    {ratePlans.filter((rp) => rp.isPackage).map((rp) => (
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
              <p>Please select a rate plan to view package components</p>
              <p className="text-sm mt-2">Note: Only package rate plans are shown</p>
            </div>
          ) : (
            <>
              <PackageComponentSearch
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              <PackageComponentTable
                components={filteredComponents}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={onDelete ? handleDelete : undefined}
              />

              {filteredComponents.length === 0 && components.length === 0 && onCreate && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No package components found</p>
                  <Button variant="outline" className="mt-4" onClick={onCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Component
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
