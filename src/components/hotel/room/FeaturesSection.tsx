import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Checkbox} from "@/components/ui/checkbox";

const COMMON_AMENITIES = [
    'WiFi', 'High-Speed Internet', 'Ethernet Connection', 'TV', 'Smart TV', 'Cable TV', 'Satellite TV',
    'Air Conditioning', 'Heating', 'Ceiling Fan', 'Mini Bar', 'Refrigerator', 'Microwave', 'Coffee Maker',
    'Kettle', 'Safe', 'In-Room Safe', 'Balcony', 'Terrace', 'Patio', 'Ocean View', 'Sea View', 'City View',
    'Room Service', '24-Hour Room Service', 'Housekeeping', 'Daily Housekeeping', 'Laundry Service',
    'Jacuzzi', 'Hot Tub', 'Bathtub', 'Shower', 'Bathrobes', 'Slippers', 'Work Desk', 'Office Chair',
    'Iron', 'Ironing Board', 'Hair Dryer', 'Toiletries', 'Blackout Curtains', 'Soundproofing',
    'Interconnecting Rooms', 'Adjoining Rooms', 'Kitchenette', 'Dining Area', 'Living Area',
    'Sofa', 'Armchair', 'Wardrobe', 'Closet', 'Dresser', 'Alarm Clock', 'Telephone', 'Wake-up Service'
];

interface FeaturesSectionProps {
  control: Control<any>;
}

export function FeaturesSection({control}: FeaturesSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="smokingAllowed"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Smoking Allowed</FormLabel>
              <FormDescription>Room allows smoking</FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="petFriendly"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Pet Friendly</FormLabel>
              <FormDescription>Room allows pets</FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="wheelchairAccessible"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Wheelchair Accessible</FormLabel>
              <FormDescription>Room is accessible for wheelchair users</FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="elevatorAccess"
        render={({field}) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Elevator Access</FormLabel>
              <FormDescription>Room has elevator access</FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="amenities"
        render={({field}) => (
          <FormItem className="col-span-2">
            <FormLabel>Amenities</FormLabel>
            <FormDescription>Select amenities available in this room</FormDescription>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 p-4 border rounded-md max-h-96 overflow-y-auto">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={field.value?.includes(amenity) || false}
                    onCheckedChange={(checked) => {
                      const currentAmenities = field.value || [];
                      if (checked) {
                        field.onChange([...currentAmenities, amenity]);
                      } else {
                        field.onChange(currentAmenities.filter(a => a !== amenity));
                      }
                    }}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

