import {Control} from "react-hook-form";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Plus, X} from "lucide-react";
import {useState} from "react";

interface CustomAmenitiesSectionProps {
  control: Control<any>;
}

export function CustomAmenitiesSection({control}: CustomAmenitiesSectionProps) {
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = (field: any) => {
    if (newAmenity.trim() && !field.value?.includes(newAmenity.trim())) {
      const currentAmenities = field.value || [];
      field.onChange([...currentAmenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (field: any, amenityToRemove: string) => {
    const currentAmenities = field.value || [];
    field.onChange(currentAmenities.filter((amenity: string) => amenity !== amenityToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAmenity(field);
    }
  };

  return (
    <FormField
      control={control}
      name="customAmenities"
      render={({field}) => (
        <FormItem>
          <FormLabel>Custom Amenities</FormLabel>
          <FormDescription>
            Add custom amenities specific to this room that aren't in the standard list
          </FormDescription>

          {/* Add new amenity input */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter custom amenity..."
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, field)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddAmenity(field)}
              disabled={!newAmenity.trim()}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Display custom amenities */}
          {field.value && field.value.length > 0 && (
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Current Custom Amenities:</FormLabel>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                {field.value.map((amenity: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(field, amenity)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
