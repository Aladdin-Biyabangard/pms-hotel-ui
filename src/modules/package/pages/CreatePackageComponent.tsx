import {useNavigate, useSearchParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {PackageComponentForm} from '../forms/PackageComponentForm';
import {ArrowLeft, Package} from 'lucide-react';

export default function CreatePackageComponent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ratePlanId = searchParams.get('ratePlanId') ? parseInt(searchParams.get('ratePlanId')!) : undefined;

  return (
    <PageWrapper
      title="Create Package Component"
      subtitle="Add a new service or amenity to a rate plan"
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
                <CardTitle>New Package Component</CardTitle>
                <CardDescription>
                  Configure a service or amenity to include in a rate plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PackageComponentForm
              open={true}
              onClose={() => navigate('/rate-package-components')}
              onSuccess={() => navigate('/rate-package-components')}
              defaultRatePlanId={ratePlanId}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
