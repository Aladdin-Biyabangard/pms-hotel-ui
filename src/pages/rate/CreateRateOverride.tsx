import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RateOverrideForm} from '@/components/rate/RateOverrideForm';
import {ArrowLeft, TrendingUp} from 'lucide-react';

export default function CreateRateOverride() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ratePlanId = searchParams.get('ratePlanId') ? parseInt(searchParams.get('ratePlanId')!) : undefined;
  const roomTypeId = searchParams.get('roomTypeId') ? parseInt(searchParams.get('roomTypeId')!) : undefined;
  const date = searchParams.get('date') || undefined;

  return (
    <PageWrapper
      title="Create Rate Override"
      subtitle="Add a special date-based rate adjustment"
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
                <CardTitle>New Rate Override</CardTitle>
                <CardDescription>
                  Configure a special rate adjustment for specific dates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateOverrideForm
              open={true}
              onClose={() => navigate('/rate-overrides')}
              onSuccess={() => navigate('/rate-overrides')}
              defaultRatePlanId={ratePlanId}
              defaultRoomTypeId={roomTypeId}
              defaultDate={date}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

