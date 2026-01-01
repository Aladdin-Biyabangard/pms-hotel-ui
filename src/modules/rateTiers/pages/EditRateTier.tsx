import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {RateTierForm} from '../forms/RateTierForm';
import {ArrowLeft, Layers} from 'lucide-react';
import {RateTierResponse, rateTiersApi} from '../api/rateTiers.api';
import {toast} from 'sonner';

export default function EditRateTier() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tier, setTier] = useState<RateTierResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTier();
    }
  }, [id]);

  const loadTier = async () => {
    try {
      setIsLoading(true);
      const data = await rateTiersApi.getById(parseInt(id!));
      setTier(data);
    } catch (error) {
      toast.error('Failed to load rate tier');
      navigate('/rate-tiers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Rate Tier" subtitle="Loading...">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Rate Tier"
      subtitle={`Editing tier: ${tier?.id || ''}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-tiers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rate Tiers
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Edit Rate Tier</CardTitle>
                <CardDescription>
                  Update tier settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tier && (
              <RateTierForm
                open={true}
                onClose={() => navigate('/rate-tiers')}
                onSuccess={() => navigate('/rate-tiers')}
                initialData={tier}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
