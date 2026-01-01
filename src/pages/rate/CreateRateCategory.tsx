import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {RateCategoryForm} from '@/components/rate/RateCategoryForm';
import {ArrowLeft, FolderTree} from 'lucide-react';

export default function CreateRateCategory() {
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Create Rate Category"
      subtitle="Add a new rate category"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-classification?tab=categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classification
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>New Rate Category</CardTitle>
                <CardDescription>
                  Define a new rate category (e.g., OTA, Direct, Corporate)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateCategoryForm
              open={true}
              onClose={() => navigate('/rate-classification?tab=categories')}
              onSuccess={() => navigate('/rate-classification?tab=categories')}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

