import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {OverrideList} from '@/components/rate/OverrideList';
import {OverrideCalendarView} from '@/components/rate/OverrideCalendarView';
import {ArrowLeft, Calendar, List, Plus} from 'lucide-react';

export default function RateOverrides() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <PageWrapper
      title="Rate Overrides"
      subtitle="Manage special date-based rate adjustments"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/rate-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={() => navigate('/rate-overrides/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Override
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <OverrideList
            onEdit={(override) => navigate(`/rate-overrides/${override.id}/edit`)}
            onDelete={() => {}}
            onCreate={() => navigate('/rate-overrides/new')}
          />
        ) : (
          <OverrideCalendarView
            onEditOverride={(override) => navigate(`/rate-overrides/${override.id}/edit`)}
            onDateClick={(date, override) => {
              if (override) {
                navigate(`/rate-overrides/${override.id}/edit`);
              } else {
                navigate('/rate-overrides/new');
              }
            }}
          />
        )}
      </div>
    </PageWrapper>
  );
}

