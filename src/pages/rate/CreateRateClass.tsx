import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RateClassForm} from '@/components/rate/RateClassForm';
import {ArrowLeft, Layers} from 'lucide-react';

export default function CreateRateClass() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;

  return (
    <PageWrapper
      title="Create Rate Class"
      subtitle="Add a new rate class"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-classification?tab=classes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classification
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>New Rate Class</CardTitle>
                <CardDescription>
                  Define a new rate class within a category (e.g., Booking.com, Expedia)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateClassForm
              open={true}
              onClose={() => navigate('/rate-classification?tab=classes')}
              onSuccess={() => navigate('/rate-classification?tab=classes')}
              defaultCategoryId={categoryId}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

