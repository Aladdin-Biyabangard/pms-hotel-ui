import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RateTypeForm} from '@/components/rate/RateTypeForm';
import {ArrowLeft, Tag} from 'lucide-react';

export default function CreateRateType() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Create Rate Type"
      subtitle="Add a new rate type classification"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-classification')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classification
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>New Rate Type</CardTitle>
                <CardDescription>
                  Define a new rate type (e.g., Standard, Corporate, Promotional)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateTypeForm
              open={true}
              onClose={() => navigate('/rate-classification')}
              onSuccess={() => navigate('/rate-classification')}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

