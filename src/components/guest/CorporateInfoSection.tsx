import {Control, useWatch} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {GuestType} from "@/types/enums";

interface CorporateInfoSectionProps {
  control: Control<any>;
}

export function CorporateInfoSection({control}: CorporateInfoSectionProps) {
  const guestType = useWatch({control, name: 'guestType'});

  return (
    <>
      <FormField
        control={control}
        name="guestType"
        render={({field}) => (
          <FormItem>
            <FormLabel>Guest Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || GuestType.INDIVIDUAL}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={GuestType.INDIVIDUAL}>Individual</SelectItem>
                <SelectItem value={GuestType.CORPORATE}>Corporate</SelectItem>
                <SelectItem value={GuestType.GROUP}>Group</SelectItem>
                <SelectItem value={GuestType.VIP}>VIP</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {(guestType === GuestType.CORPORATE || guestType === GuestType.GROUP) && (
        <>
          <FormField
            control={control}
            name="companyName"
            render={({field}) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="companyAddress"
            render={({field}) => (
              <FormItem className="col-span-2">
                <FormLabel>Company Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="taxId"
            render={({field}) => (
              <FormItem>
                <FormLabel>Tax ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tax ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}

