import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import { RateClassForm } from '../../components/forms/RateClassForm';

export default function CreateRateClass() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Create Rate Class"
      subtitle="Add a new rate class classification"
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
                <CardTitle>New Rate Class</CardTitle>
                <CardDescription>
                  Define a new rate class
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateClassForm
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
