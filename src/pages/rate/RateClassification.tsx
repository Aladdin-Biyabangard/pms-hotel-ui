import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {RateTypeList} from '@/components/rate/RateTypeList';
import {RateCategoryList} from '@/components/rate/RateCategoryList';
import {RateClassList} from '@/components/rate/RateClassList';
import {ArrowLeft, Plus} from 'lucide-react';

export default function RateClassification() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');

  const getCreateRoute = () => {
    switch (activeTab) {
      case 'types':
        return '/rate-types/new';
      case 'categories':
        return '/rate-categories/new';
      case 'classes':
        return '/rate-classes/new';
      default:
        return '/rate-types/new';
    }
  };

  return (
    <PageWrapper
      title="Rate Classification"
      subtitle="Manage rate types, categories, and classes"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/rate-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate(getCreateRoute())}>
            <Plus className="h-4 w-4 mr-2" />
            Create {activeTab === 'types' ? 'Type' : activeTab === 'categories' ? 'Category' : 'Class'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="types">Rate Types</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-6">
            <RateTypeList
              onEdit={(rateType) => navigate(`/rate-types/${rateType.id}/edit`)}
              onDelete={() => {}}
              onCreate={() => navigate('/rate-types/new')}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <RateCategoryList
              onEdit={(category) => navigate(`/rate-categories/${category.id}/edit`)}
              onDelete={() => {}}
              onCreate={() => navigate('/rate-categories/new')}
            />
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <RateClassList
              onEdit={(rateClass) => navigate(`/rate-classes/${rateClass.id}/edit`)}
              onDelete={() => {}}
              onCreate={() => navigate('/rate-classes/new')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}

