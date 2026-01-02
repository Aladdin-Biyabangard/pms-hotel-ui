import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {CalendarIcon} from 'lucide-react';
import {format} from 'date-fns';
import {cn} from '@/lib/utils';

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  className?: string;
}

export function DateRangeSelector({ 
  startDate, 
  endDate, 
  onDateRangeChange,
  className 
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange(undefined, undefined);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDateRangeChange(date, undefined);
    } else if (startDate && !endDate) {
      // Complete selection
      if (date < startDate) {
        // If selected date is before start, make it the start
        onDateRangeChange(date, startDate);
      } else {
        onDateRangeChange(startDate, date);
      }
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-[300px] justify-start text-left font-normal",
            !startDate && !endDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {startDate && endDate ? (
            <>
              {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
            </>
          ) : startDate ? (
            <>
              {format(startDate, "MMM dd, yyyy")} - Select end date
            </>
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={endDate || startDate}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

