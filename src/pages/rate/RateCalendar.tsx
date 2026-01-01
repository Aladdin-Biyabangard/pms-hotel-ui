import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {RateCalendarMatrixView} from '@/components/rate/RateCalendarMatrixView';
import {ArrowLeft, Plus} from 'lucide-react';

export default function RateCalendar() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Rate Calendar"
      subtitle="View and manage daily room rates"
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/rate-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/daily-rates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Daily Rate
          </Button>
        </div>

        {/* Calendar Matrix */}
        <RateCalendarMatrixView
          onDateClick={(date, rate) => {
            if (rate) {
              navigate(`/daily-rates/${rate.id}/edit`);
            } else {
              navigate('/daily-rates/new');
            }
          }}
          onEditRate={(rate) => {
            navigate(`/daily-rates/${rate.id}/edit`);
          }}
        />
      </div>
    </PageWrapper>
  );
}

