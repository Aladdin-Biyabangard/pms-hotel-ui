import {useState} from 'react';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Calendar, Grid3x3, List} from 'lucide-react';
import {RateCalendarView} from './RateCalendarView';
import {RateMatrixView} from './RateMatrixView';
import {DateRangeSelector} from './DateRangeSelector';
import {BulkRateUpdateDialog} from './BulkRateUpdateDialog';
import {CreateRoomRateRequest, roomRateApi, RoomRateResponse} from '@/api/roomRate';
import {RoomTypeResponse} from '@/api/roomType';
import {RatePlanResponse} from '@/api/ratePlan';
import {toast} from 'sonner';

interface RateCalendarMatrixViewProps {
  onEditRate?: (rate: RoomRateResponse) => void;
  onDateClick?: (date: Date, rate?: RoomRateResponse) => void;
}

export function RateCalendarMatrixView({ onEditRate, onDateClick }: RateCalendarMatrixViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'matrix' | 'list'>('calendar');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleBulkUpdate = async (
    updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }>
  ) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const update of updates) {
        try {
          await roomRateApi.createRoomRate(update.data as CreateRoomRateRequest);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Failed to update rate', error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} rate(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to update ${errorCount} rate(s)`);
      }

      setBulkUpdateOpen(false);
    } catch (error) {
      toast.error('Failed to process bulk update');
    }
  };

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleMatrixEdit = (
    rate: RoomRateResponse,
    roomType: RoomTypeResponse,
    ratePlan: RatePlanResponse,
    date: Date
  ) => {
    if (onEditRate) {
      onEditRate(rate);
    }
  };

  return (
    <div className="space-y-4">
      {/* View Toggle and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="matrix">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Matrix
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Range Selector */}
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* View Content */}
      {viewMode === 'calendar' && (
        <RateCalendarView
          onEditRate={onEditRate}
          onDateClick={onDateClick}
        />
      )}

      {viewMode === 'matrix' && (
        <RateMatrixView
          onEditRate={handleMatrixEdit}
          onBulkUpdate={handleBulkUpdate}
        />
      )}

      {viewMode === 'list' && (
        <div className="text-center py-12 text-muted-foreground">
          <p>List view coming soon</p>
          <p className="text-sm mt-2">Use Calendar or Matrix view for now</p>
        </div>
      )}

      {/* Bulk Update Dialog */}
      <BulkRateUpdateDialog
        open={bulkUpdateOpen}
        onClose={() => setBulkUpdateOpen(false)}
        onConfirm={handleBulkUpdate}
        selectedCount={selectedCount}
      />
    </div>
  );
}

