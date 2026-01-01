import {useEffect, useState} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {roomTypeApi, RoomTypeResponse} from "@/api/roomType";
import {Loader2} from "lucide-react";

const ROOM_CATEGORIES = ['Standard', 'Superior', 'Deluxe', 'Executive', 'Suite', 'Presidential', 'Penthouse', 'Villa'] as const;

interface BasicInfoSectionProps {
  control: Control<any>;
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(true);

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setIsLoadingRoomTypes(true);
      const data = await roomTypeApi.getAllRoomTypes(0, 100);
      setRoomTypes(data.content);
    } catch (error) {
      console.error('Failed to load room types', error);
      // Fallback to empty array - form will show no options
    } finally {
      setIsLoadingRoomTypes(false);
    }
  };

  return (
    <>
      <FormField
        control={control}
        name="roomNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Number *</FormLabel>
            <FormControl>
              <Input placeholder="101" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="roomType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  {isLoadingRoomTypes ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select room type" />
                  )}
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {roomTypes.length === 0 && !isLoadingRoomTypes ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No room types available. Please create room types first.
                  </div>
                ) : (
                  roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {rt.code}
                        </span>
                        <span>{rt.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Select the room type category
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="roomCategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Category</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ROOM_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="floor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Floor *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="wing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wing</FormLabel>
            <FormControl>
              <Input placeholder="North, South, East, West" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="section"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Section</FormLabel>
            <FormControl>
              <Input placeholder="A, B, C" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="building"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Building</FormLabel>
            <FormControl>
              <Input placeholder="Main, Annex, Tower" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
