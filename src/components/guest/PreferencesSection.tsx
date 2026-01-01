import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";

interface PreferencesSectionProps {
  control: Control<any>;
}

export function PreferencesSection({control}: PreferencesSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="dietaryPreferences"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Dietary Preferences</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g., Vegetarian, Gluten-free, Halal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="specialNeeds"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Special Needs</FormLabel>
            <FormControl>
              <Textarea placeholder="Special accommodation needs" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="notes"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Additional notes about the guest" {...field} />
            </FormControl>
            <FormDescription>Internal notes for staff</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

