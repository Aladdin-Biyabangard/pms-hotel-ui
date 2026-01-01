import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {RateOverrideForm} from '../components/forms/RateOverrideForm';
import {RateOverrideResponse, rateOverridesApi} from '../api/rateOverride.api';
import {ArrowLeft, TrendingUp} from 'lucide-react';
import {toast} from 'sonner';

export default function EditRateOverride() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [override, setOverride] = useState<RateOverrideResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOverride();
    }
  }, [id]);

  const loadOverride = async () => {
    try {
      setIsLoading(true);
      const data = await rateOverridesApi.getById(parseInt(id!));
      setOverride(data);
    } catch (error) {
      toast.error('Failed to load rate override');
      navigate('/rate-overrides');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Rate Override" subtitle="Loading...">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Rate Override"
      subtitle={`Editing override for ${override?.overrideDate || ''}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-overrides')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rate Overrides
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Edit Rate Override</CardTitle>
                <CardDescription>
                  Update the rate override settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {override && (
              <RateOverrideForm
                initialData={override}
                open={true}
                onClose={() => navigate('/rate-overrides')}
                onSuccess={() => navigate('/rate-overrides')}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
