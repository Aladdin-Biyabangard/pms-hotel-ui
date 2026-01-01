import {Control, useWatch} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";

interface LoyaltySectionProps {
  control: Control<any>;
}

export function LoyaltySection({control}: LoyaltySectionProps) {
  const loyaltyMember = useWatch({control, name: 'loyaltyMember'});

  return (
    <>
      <FormField
        control={control}
        name="loyaltyMember"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Loyalty Member</FormLabel>
              <FormDescription>Guest is a loyalty program member</FormDescription>
            </div>
          </FormItem>
        )}
      />
      {loyaltyMember && (
        <>
          <FormField
            control={control}
            name="loyaltyPoints"
            render={({field}) => (
              <FormItem>
                <FormLabel>Loyalty Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
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
            name="loyaltyTier"
            render={({field}) => (
              <FormItem>
                <FormLabel>Loyalty Tier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Gold, Platinum, Silver" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={control}
        name="preferredLanguage"
        render={({field}) => (
          <FormItem>
            <FormLabel>Preferred Language</FormLabel>
            <FormControl>
              <Input placeholder="e.g., English, Spanish" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

