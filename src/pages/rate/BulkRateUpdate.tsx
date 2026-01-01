import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {BulkRateOperations} from '@/components/rate/BulkRateOperations';
import {ArrowLeft} from 'lucide-react';

export default function BulkRateUpdate() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Bulk Rate Update"
      subtitle="Update multiple rates at once"
    >
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <BulkRateOperations />
      </div>
    </PageWrapper>
  );
}

