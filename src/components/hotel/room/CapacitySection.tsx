import {Control, useWatch} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";

interface CapacitySectionProps {
  control: Control<any>;
}

export function CapacitySection({control}: CapacitySectionProps) {
  const extraBedAvailable = useWatch({control, name: 'extraBedAvailable'});
  const cribAvailable = useWatch({control, name: 'cribAvailable'});

  return (
    <>
      <FormField
        control={control}
        name="occupancy"
        render={({field}) => (
          <FormItem>
            <FormLabel>Maximum Occupancy *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="2"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 1)}
              />
            </FormControl>
            <FormDescription>Total maximum number of guests</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maxAdults"
        render={({field}) => (
          <FormItem>
            <FormLabel>Max Adults</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="2"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maxChildren"
        render={({field}) => (
          <FormItem>
            <FormLabel>Max Children</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="2"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="maxInfants"
        render={({field}) => (
          <FormItem>
            <FormLabel>Max Infants</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="extraBedAvailable"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Extra Bed Available</FormLabel>
              <FormDescription>Room can accommodate extra bed(s)</FormDescription>
            </div>
          </FormItem>
        )}
      />
      {extraBedAvailable && (
        <>
          <FormField
            control={control}
            name="extraBedCount"
            render={({field}) => (
              <FormItem>
                <FormLabel>Extra Bed Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="extraBedPrice"
            render={({field}) => (
              <FormItem>
                <FormLabel>Extra Bed Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={control}
        name="cribAvailable"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Crib Available</FormLabel>
              <FormDescription>Room can accommodate a crib</FormDescription>
            </div>
          </FormItem>
        )}
      />
      {cribAvailable && (
        <FormField
          control={control}
          name="cribPrice"
          render={({field}) => (
            <FormItem>
              <FormLabel>Crib Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="15.00"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

