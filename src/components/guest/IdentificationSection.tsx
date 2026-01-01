import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

interface IdentificationSectionProps {
  control: Control<any>;
}

export function IdentificationSection({control}: IdentificationSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="passportNumber"
        render={({field}) => (
          <FormItem>
            <FormLabel>Passport Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter passport number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="passportExpiryDate"
        render={({field}) => (
          <FormItem>
            <FormLabel>Passport Expiry Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="idNumber"
        render={({field}) => (
          <FormItem>
            <FormLabel>ID Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter ID number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

