import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RateTypeForm } from '../../components/forms/RateTypeForm';
import { RateTypeResponse, rateTypesApi } from '../../api/rateType.api';

export default function EditRateType() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [rateType, setRateType] = useState<RateTypeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRateType = async () => {
      if (!id) return;

      try {
        const data = await rateTypesApi.getById(parseInt(id));
        setRateType(data);
      } catch (error) {
        toast.error('Failed to load rate type');
        navigate('/rate-classification');
      } finally {
        setIsLoading(false);
      }
    };

    loadRateType();
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
        title="Edit Rate Type"
        subtitle="Modify rate type classification"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => navigate('/rate-classification')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classification
          </Button>

          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading rate type...</span>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (!rateType) {
    return (
      <PageWrapper
        title="Edit Rate Type"
        subtitle="Modify rate type classification"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => navigate('/rate-classification')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classification
          </Button>

          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Rate type not found</p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Rate Type"
      subtitle="Modify rate type classification"
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
                <CardTitle>Edit Rate Type</CardTitle>
                <CardDescription>
                  Modify the rate type details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RateTypeForm
              open={true}
              onClose={handleClose}
              onSuccess={handleSuccess}
              initialData={rateType}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
