import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {roomTypeApi, RoomTypeResponse} from "@/api/roomType";
import {CreateRoomRateRequest, roomRateApi} from "@/api/roomRate";
import {toast} from "sonner";
import {Save} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {RatePlanPageLayout, BackButton, ActionButtons, useRatePlan} from "../..";

export default function AssignRoomTypes() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {ratePlan, isLoading: ratePlanLoading, error, notFound} = useRatePlan(id);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [baseRate, setBaseRate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && ratePlan) {
      loadRoomTypes();
    }
  }, [id, ratePlan]);

  const loadRoomTypes = async () => {
    try {
      setIsLoading(true);
      const roomTypesData = await roomTypeApi.getAllRoomTypes(0, 1000);
      setRoomTypes(roomTypesData.content);

      // Set default dates
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(nextYear.toISOString().split('T')[0]);
    } catch (error: any) {
      console.error("Failed to load room types", error);
      toast.error(error?.response?.data?.message || "Failed to load room types");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoomType = (roomType: RoomTypeResponse) => {
    setSelectedRoomTypes(prev => {
      const exists = prev.some(rt => rt.id === roomType.id);
      if (exists) {
        return prev.filter(rt => rt.id !== roomType.id);
      } else {
        return [...prev, roomType];
      }
    });
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called", { selectedRoomTypes, baseRate, startDate, endDate, ratePlan });
    
    if (selectedRoomTypes.length === 0) {
      toast.error("Please select at least one room type");
      return;
    }

    if (!baseRate || parseFloat(baseRate) <= 0) {
      toast.error("Please enter a valid base rate");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (!ratePlan) {
      toast.error("Rate plan not loaded");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsSaving(true);
    try {
      const rateAmount = parseFloat(baseRate);
      const promises: Promise<any>[] = [];
      let totalRates = 0;
      
      // Create rates for each day in the date range for each selected room type
      // This matches Oracle OPERA behavior where each day can have its own rate
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        
        for (const roomType of selectedRoomTypes) {
          if (!roomType.code) {
            console.error("Room type missing code:", roomType);
            continue;
          }
          
          const roomRate: CreateRoomRateRequest = {
            ratePlanCode: ratePlan.code,
            roomTypeCode: roomType.code,
            rateDate: dateStr,
            rateAmount,
            currency: 'USD',
          };
          
          console.log("Creating room rate:", roomRate);
          
          promises.push(
            roomRateApi.createRoomRate(roomRate).catch((err) => {
              console.error(`Error creating rate for ${roomType.code} on ${dateStr}:`, err);
              // If rate already exists for this date, skip it
              if (err.response?.status === 409 || err.response?.status === 400) {
                console.log(`Rate already exists for ${roomType.code} on ${dateStr}, skipping...`);
                return null;
              }
              throw err;
            })
          );
          totalRates++;
        }
      }

      console.log(`Creating ${totalRates} rates...`);
      const results = await Promise.all(promises);
      const successful = results.filter(r => r !== null).length;
      const skipped = totalRates - successful;
      
      console.log(`Results: ${successful} successful, ${skipped} skipped`);
      
      if (successful > 0) {
        toast.success(
          `Successfully created ${successful} rate(s) for ${selectedRoomTypes.length} room type(s)${skipped > 0 ? ` (${skipped} already existed)` : ''}`
        );
        navigate(`/rate-plans/${id}`);
      } else if (skipped === totalRates) {
        toast.warning("All rates already exist for the selected date range");
      } else {
        toast.error(`Failed to create rates. ${successful} succeeded, ${skipped} skipped.`);
      }
    } catch (error: any) {
      console.error("Failed to assign room types", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to assign room types";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RatePlanPageLayout
      title="Assign Room Types"
      subtitle={ratePlan ? `Assign "${ratePlan.name}" to room types` : "Assign rate plan to room types"}
      isLoading={ratePlanLoading || isLoading}
      error={error}
      notFound={notFound}
      notFoundMessage="Rate plan not found"
      maxWidth="4xl"
      loadingTitle="Loading room types..."
    >
      {ratePlan && (
        <div className="space-y-6">
          <BackButton
            onClick={() => navigate(`/rate-plans/${id}`)}
            label="Back to Rate Plan"
          />

        <Card>
          <CardHeader>
            <CardTitle>Rate Plan Information</CardTitle>
            <CardDescription>{ratePlan.name} ({ratePlan.code})</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Room Types</CardTitle>
            <CardDescription>Choose which room types this rate plan will be available for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomTypes.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No room types available. Please create room types first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomTypes.map((rt) => (
                  <div key={rt.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                    <Checkbox
                      id={`room-type-${rt.id}`}
                      checked={selectedRoomTypes.some(selected => selected.id === rt.id)}
                      onCheckedChange={() => toggleRoomType(rt)}
                    />
                    <label htmlFor={`room-type-${rt.id}`} className="text-sm font-normal cursor-pointer flex-1">
                      {rt.name} ({rt.code})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Configuration</CardTitle>
            <CardDescription>Set the base rate and validity period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">Base Rate (USD) *</Label>
              <Input
                id="baseRate"
                type="number"
                step="0.01"
                placeholder="99.99"
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

          <ActionButtons
            onCancel={() => navigate(`/rate-plans/${id}`)}
            onSave={(e) => {
              e?.preventDefault();
              console.log("Button clicked", {
                isSaving,
                selectedRoomTypes: selectedRoomTypes.length,
                baseRate,
                startDate,
                endDate,
                ratePlan: ratePlan?.code
              });
              handleSubmit();
            }}
            cancelLabel="Cancel"
            saveLabel={isSaving ? 'Creating Rates...' : `Create Rates (${selectedRoomTypes.length} room type(s))`}
            isSaving={isSaving}
            saveDisabled={selectedRoomTypes.length === 0 || !baseRate || !startDate || !endDate}
          />
        </div>
      )}
    </RatePlanPageLayout>
  );
}

