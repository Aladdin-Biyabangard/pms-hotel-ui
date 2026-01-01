import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ArrowLeft} from 'lucide-react';

export default function EditRateCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <PageWrapper
      title="Edit Rate Category"
      subtitle="Modify rate category classification"
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
                <ArrowLeft className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Edit Rate Category</CardTitle>
                <CardDescription>
                  Modify the rate category details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Rate Category Edit Form component coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
