import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RateTierForm} from '../forms/RateTierForm';
import {ArrowLeft, Layers} from 'lucide-react';

export default function CreateRateTier() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ratePlanId = searchParams.get('ratePlanId') ? parseInt(searchParams.get('ratePlanId')!) : undefined;

  return (
    <PageWrapper
      title="Create Rate Tier"
      subtitle="Add a new length-of-stay pricing tier"
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
                <CardTitle>New Rate Tier</CardTitle>
                <CardDescription>
                  Configure tier settings for length-of-stay discounts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateTierForm
              open={true}
              onClose={() => navigate('/rate-tiers')}
              onSuccess={() => navigate('/rate-tiers')}
              defaultRatePlanId={ratePlanId}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
