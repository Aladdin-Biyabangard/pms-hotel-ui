import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {PackageComponentForm} from '../forms/PackageComponentForm';
import {packageComponentsApi, RatePackageComponentResponse} from '../api/packageComponents.api';
import {ArrowLeft, Loader2, Package} from 'lucide-react';
import {toast} from 'sonner';

export default function EditPackageComponent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<RatePackageComponentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadComponent();
    }
  }, [id]);

  const loadComponent = async () => {
    try {
      const data = await packageComponentsApi.getById(parseInt(id!));
      setComponent(data);
    } catch (error) {
      toast.error('Failed to load package component');
      navigate('/rate-package-components');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper
        title="Edit Package Component"
        subtitle="Loading component details..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!component) {
    return (
      <PageWrapper
        title="Edit Package Component"
        subtitle="Component not found"
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Package component not found</p>
          <Button onClick={() => navigate('/rate-package-components')}>
            Back to Package Components
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Package Component"
      subtitle="Modify the details of this package component"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/rate-package-components')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Package Components
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Edit Package Component</CardTitle>
                <CardDescription>
                  Update the configuration for {component.componentName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PackageComponentForm
              initialData={component}
              open={true}
              onClose={() => navigate('/rate-package-components')}
              onSuccess={() => navigate('/rate-package-components')}
              defaultRatePlanId={component.ratePlanId}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
