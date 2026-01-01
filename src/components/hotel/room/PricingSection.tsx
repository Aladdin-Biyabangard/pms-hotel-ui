import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface PricingSectionProps {
  control: Control<any>;
}

export function PricingSection({control}: PricingSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="pricePerNight"
        render={({field}) => (
          <FormItem>
            <FormLabel>Base Price per Night ($) *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="99.99"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="weekendPricePerNight"
        render={({field}) => (
          <FormItem>
            <FormLabel>Weekend Price per Night ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="129.99"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>Optional weekend pricing</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="seasonalPricePerNight"
        render={({field}) => (
          <FormItem>
            <FormLabel>Seasonal Price per Night ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="149.99"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>Optional seasonal pricing</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="holidayPricePerNight"
        render={({field}) => (
          <FormItem>
            <FormLabel>Holiday Price per Night ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="179.99"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>Optional holiday pricing</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

