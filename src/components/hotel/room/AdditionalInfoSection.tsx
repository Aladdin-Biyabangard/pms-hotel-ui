import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";

interface AdditionalInfoSectionProps {
  control: Control<any>;
}

export function AdditionalInfoSection({control}: AdditionalInfoSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="description"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Room description, features, etc." {...field} />
            </FormControl>
            <FormDescription>Public description visible to guests</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="internalNotes"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Internal notes for staff only" {...field} />
            </FormControl>
            <FormDescription>Internal notes not visible to guests</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="guestNotes"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Guest Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Notes to display to guests" {...field} />
            </FormControl>
            <FormDescription>Notes visible to guests during booking</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="specialInstructions"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Special Instructions</FormLabel>
            <FormControl>
              <Textarea placeholder="Special instructions for staff" {...field} />
            </FormControl>
            <FormDescription>Special handling instructions</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

