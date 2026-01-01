import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RoomRateForm} from '@/components/rate/RoomRateForm';
import {ArrowLeft, DollarSign} from 'lucide-react';

export default function AddDailyRate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ratePlanId = searchParams.get('ratePlanId') ? parseInt(searchParams.get('ratePlanId')!) : undefined;
  const roomTypeId = searchParams.get('roomTypeId') ? parseInt(searchParams.get('roomTypeId')!) : undefined;
  const date = searchParams.get('date') || undefined;

  return (
    <PageWrapper
      title="Add Daily Rate"
      subtitle="Set a rate for a specific date"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-matrix')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rate Calendar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>New Daily Rate</CardTitle>
                <CardDescription>
                  Configure a rate for a room type and rate plan on a specific date
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RoomRateForm
              open={true}
              onClose={() => navigate('/rate-matrix')}
              onSuccess={() => navigate('/rate-matrix')}
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

