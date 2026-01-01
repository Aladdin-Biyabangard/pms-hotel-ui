import {Control, useWatch} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {RoomStatus} from "@/types/enums";

const HOUSEKEEPING_STATUS = ['Clean', 'Dirty', 'Inspected', 'Out of Order', 'Out of Service'] as const;

interface StatusSectionProps {
  control: Control<any>;
}

export function StatusSection({control}: StatusSectionProps) {
  const roomStatus = useWatch({control, name: 'roomStatus'});

  return (
    <>
      <FormField
        control={control}
        name="roomStatus"
        render={({field}) => (
          <FormItem>
            <FormLabel>Room Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select room status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={RoomStatus.VACANT_CLEAN}>Vacant Clean</SelectItem>
                <SelectItem value={RoomStatus.VACANT_DIRTY}>Vacant Dirty</SelectItem>
                <SelectItem value={RoomStatus.OCCUPIED_CLEAN}>Occupied Clean</SelectItem>
                <SelectItem value={RoomStatus.OCCUPIED_DIRTY}>Occupied Dirty</SelectItem>
                <SelectItem value={RoomStatus.OUT_OF_ORDER}>Out of Order</SelectItem>
                <SelectItem value={RoomStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
                <SelectItem value={RoomStatus.INSPECTED}>Inspected</SelectItem>
                <SelectItem value={RoomStatus.DUE_OUT}>Due Out</SelectItem>
                <SelectItem value={RoomStatus.CHECK_OUT}>Check Out</SelectItem>
                <SelectItem value={RoomStatus.STAY_OVER}>Stay Over</SelectItem>
                <SelectItem value={RoomStatus.DO_NOT_DISTURB}>Do Not Disturb</SelectItem>
                <SelectItem value={RoomStatus.LOCKED_OUT}>Locked Out</SelectItem>
                <SelectItem value={RoomStatus.OFF_MARKET}>Off Market</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Current availability status</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="housekeepingStatus"
        render={({field}) => (
          <FormItem>
            <FormLabel>Housekeeping Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {HOUSEKEEPING_STATUS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {(roomStatus === RoomStatus.OUT_OF_SERVICE || roomStatus === RoomStatus.OUT_OF_ORDER || roomStatus === RoomStatus.OFF_MARKET) && (
        <>
          <FormField
            control={control}
            name="outOfOrderReason"
            render={({field}) => (
              <FormItem>
                <FormLabel>Out of Order Reason</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Renovation, Maintenance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="outOfOrderUntil"
            render={({field}) => (
              <FormItem>
                <FormLabel>Out of Order Until</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={control}
        name="maintenanceNotes"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Maintenance Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Maintenance notes, special instructions, etc." {...field} />
            </FormControl>
            <FormDescription>Internal notes for maintenance and operations</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

