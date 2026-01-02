import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {roomTypeApi, RoomTypeResponse} from "@/api/roomType";
import {RatePlanResponse} from "@/modules/rate/RatePlan";
import {roomRateApi, RoomRateResponse} from "@/api/roomRate";
import {toast} from "sonner";
import {ArrowLeft, Calendar, Edit} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {format} from "date-fns";

export default function RoomTypeDetails() {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<RoomTypeResponse | null>(null);
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [roomRates, setRoomRates] = useState<RoomRateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const roomTypeData = await roomTypeApi.getRoomType(parseInt(id!));
      const roomRatesData = await roomRateApi.getAllRoomRates(0, 1000, {
        roomTypeCode: roomTypeData.code,
      });
      setRoomType(roomTypeData);
      setRoomRates(roomRatesData.content);
      
      // Extract unique rate plans from room rates
      const ratePlanMap = new Map<number, RatePlanResponse>();
      roomRatesData.content.forEach((rate) => {
        const roomType = rate.roomType || rate.roomTypeResponse;
        if (rate.ratePlan && !ratePlanMap.has(rate.ratePlan.id)) {
          ratePlanMap.set(rate.ratePlan.id, rate.ratePlan);
        }
      });
      setRatePlans(Array.from(ratePlanMap.values()));
    } catch (error: any) {
      console.error("Failed to load room type", error);
      toast.error(error?.response?.data?.message || "Failed to load room type");
      navigate("/room-types");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Room Type Details" subtitle="View room type information">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (!roomType) {
    return (
      <PageWrapper title="Room Type Details" subtitle="Room type not found">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">Room type not found</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Room Type Details"
      subtitle={roomType.name}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/room-types")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Room Types
          </Button>
          <Button variant="outline" onClick={() => navigate(`/room-types/${roomType.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Room Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Type Information</CardTitle>
            <CardDescription>Basic information about this room type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code</p>
                <p className="text-lg">{roomType.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{roomType.name}</p>
              </div>
              {roomType.maxOccupancy && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Occupancy</p>
                  <p className="text-lg">{roomType.maxOccupancy} guests</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge>{roomType.status}</Badge>
              </div>
            </div>
            {roomType.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{roomType.description}</p>
              </div>
            )}
            {roomType.amenities && roomType.amenities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assigned Rate Plans</CardTitle>
                <CardDescription>Rate plans available for this room type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ratePlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
              </div>
            ) : (
              <div className="space-y-4">
                {ratePlans.map((ratePlan) => (
                  <Card key={ratePlan.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{ratePlan.name}</h4>
                            <Badge variant="outline">{ratePlan.code}</Badge>
                            {ratePlan.isDefault && <Badge>Default</Badge>}
                            {ratePlan.isPublic && <Badge variant="secondary">Public</Badge>}
                          </div>
                          {ratePlan.rateType && (
                            <p className="text-sm text-muted-foreground">
                              Rate Type: {ratePlan.rateType.name}
                            </p>
                          )}
                          {ratePlan.validFrom && ratePlan.validTo && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(ratePlan.validFrom), "MMM dd, yyyy")} - {format(new Date(ratePlan.validTo), "MMM dd, yyyy")}
                            </div>
                          )}
                          {ratePlan.minStayNights && (
                            <p className="text-sm text-muted-foreground">
                              Min Stay: {ratePlan.minStayNights} nights
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/rate-plans/${ratePlan.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {roomRates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Room Rates</CardTitle>
              <CardDescription>Historical and scheduled rates for this room type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rate Plan</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Rate Amount</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomRates.slice(0, 10).map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.ratePlan.name}</TableCell>
                        <TableCell>{format(new Date(rate.rateDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {rate.currency || 'USD'} {rate.rateAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>{rate.availabilityCount ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={rate.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {rate.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

