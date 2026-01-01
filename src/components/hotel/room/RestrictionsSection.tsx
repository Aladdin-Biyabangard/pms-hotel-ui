import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface RestrictionsSectionProps {
  control: Control<any>;
}

export function RestrictionsSection({control}: RestrictionsSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="minStayNights"
        render={({field}) => (
          <FormItem>
            <FormLabel>Minimum Stay (Nights)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormDescription>Minimum stay requirement</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maxStayNights"
        render={({field}) => (
          <FormItem>
            <FormLabel>Maximum Stay (Nights)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="30"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormDescription>Maximum stay limit</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="advanceBookingDays"
        render={({field}) => (
          <FormItem>
            <FormLabel>Advance Booking (Days)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="365"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormDescription>Maximum days in advance for booking</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cancellationPolicy"
        render={({field}) => (
          <FormItem>
            <FormLabel>Cancellation Policy</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Free cancellation 24 hours before" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

