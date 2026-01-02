import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RateCategoryForm } from '../../components/forms/RateCategoryForm';
import { RateCategoryResponse, rateCategoriesApi } from '../../api/rateCategory.api';

export default function EditRateCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [rateCategory, setRateCategory] = useState<RateCategoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRateCategory = async () => {
      if (!id) return;

      try {
        const data = await rateCategoriesApi.getById(parseInt(id));
        setRateCategory(data);
      } catch (error) {
        toast.error('Failed to load rate category');
        navigate('/rate-classification');
      } finally {
        setIsLoading(false);
      }
    };

    loadRateCategory();
  }, [id, navigate]);

  const handleSuccess = () => {
    navigate('/rate-classification');
  };

  const handleClose = () => {
    navigate('/rate-classification');
  };

  if (isLoading) {
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
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading rate category...</span>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (!rateCategory) {
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
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Rate category not found</p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

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
            <RateCategoryForm
              open={true}
              onClose={handleClose}
              onSuccess={handleSuccess}
              initialData={rateCategory}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
