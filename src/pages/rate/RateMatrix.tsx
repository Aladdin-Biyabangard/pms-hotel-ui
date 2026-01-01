import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {RateMatrixViewEnhanced} from '@/components/rate/RateMatrixViewEnhanced';
import {ArrowLeft, Plus} from 'lucide-react';

export default function RateMatrix() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Rate Matrix"
      subtitle="View and edit rates in matrix format"
    >
      <div className="space-y-6">
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

        <RateMatrixViewEnhanced />
      </div>
    </PageWrapper>
  );
}

