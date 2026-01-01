import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card, CardContent} from '@/components/ui/card.tsx';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {RateTiersList} from '../RateTiersList';
import {ArrowLeft, Layers, Plus} from 'lucide-react';
import {ratePlanApi, RatePlanResponse} from '@/api/ratePlan.ts';
import {toast} from 'sonner';

export default function RateTiers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<number | undefined>(
    searchParams.get('ratePlanId') ? parseInt(searchParams.get('ratePlanId')!) : undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRatePlans();
  }, []);

  const loadRatePlans = async () => {
    try {
      setIsLoading(true);
      const data = await ratePlanApi.getAllRatePlans(0, 1000);
      setRatePlans(data.content);
      // Auto-select first rate plan if none selected
      if (!selectedRatePlanId && data.content.length > 0) {
        setSelectedRatePlanId(data.content[0].id);
      }
    } catch (error) {
      toast.error('Failed to load rate plans');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Rate Tiers"
      subtitle="Manage length-of-stay based pricing tiers"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/rate-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select
              value={selectedRatePlanId?.toString() || ''}
              onValueChange={(value) => setSelectedRatePlanId(parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select Rate Plan" />
              </SelectTrigger>
              <SelectContent>
                {ratePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.name} ({plan.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => navigate(`/rate-tiers/new${selectedRatePlanId ? `?ratePlanId=${selectedRatePlanId}` : ''}`)}
              disabled={!selectedRatePlanId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </div>

        {/* Content */}
        {!selectedRatePlanId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Rate Plan</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Rate tiers are associated with rate plans. Select a rate plan from the dropdown above to view and manage its tiers.
              </p>
            </CardContent>
          </Card>
        ) : (
          <RateTiersList
            ratePlanId={selectedRatePlanId}
            onEdit={(tier) => navigate(`/rate-tiers/${tier.id}/edit`)}
            onDelete={() => {}}
            onCreate={() => navigate(`/rate-tiers/new?ratePlanId=${selectedRatePlanId}`)}
            onPriorityChange={() => {}}
          />
        )}
      </div>
    </PageWrapper>
  );
}
