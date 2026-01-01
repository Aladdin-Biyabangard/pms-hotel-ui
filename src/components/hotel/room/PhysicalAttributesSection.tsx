import {Control, useWatch} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";

const BED_TYPES = ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk', 'Sofa Bed'] as const;
const VIEW_TYPES = ['Sea View', 'Ocean View', 'City View', 'Garden View', 'Mountain View', 'Pool View', 'Park View', 'No View'] as const;
const CONNECTING_ROOM_TYPES = ['Connecting', 'Adjoining', 'Adjacent', 'None'] as const;

interface PhysicalAttributesSectionProps {
  control: Control<any>;
}

export function PhysicalAttributesSection({control}: PhysicalAttributesSectionProps) {
  const connectingRoom = useWatch({control, name: 'connectingRoom'});

  return (
    <>
      <FormField
        control={control}
        name="area"
        render={({field}) => (
          <FormItem>
            <FormLabel>Room Area</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="25.0"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>Room area in square meters</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="bedCount"
        render={({field}) => (
          <FormItem>
            <FormLabel>Bed Count *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="bedType"
        render={({field}) => (
          <FormItem>
            <FormLabel>Bed Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BED_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="bedConfiguration"
        render={({field}) => (
          <FormItem>
            <FormLabel>Bed Configuration</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 1 King, 2 Queens, 1 Twin" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="viewType"
        render={({field}) => (
          <FormItem>
            <FormLabel>View Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {VIEW_TYPES.map((view) => (
                  <SelectItem key={view} value={view}>{view}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="connectingRoom"
        render={({field}) => (
          <FormItem>
            <FormLabel>Connecting Room Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'None'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CONNECTING_ROOM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {connectingRoom && connectingRoom !== 'None' && (
        <FormField
          control={control}
          name="connectingRoomNumber"
          render={({field}) => (
            <FormItem>
              <FormLabel>Connecting Room Number</FormLabel>
              <FormControl>
                <Input placeholder="102" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="balcony"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Balcony</FormLabel>
              <FormDescription>Room has a balcony</FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="terrace"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Terrace</FormLabel>
              <FormDescription>Room has a terrace</FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}

