import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {roomTypeApi, RoomTypeResponse} from "@/api/roomType";
import {ArrowLeft, Calendar, Edit, Link2} from "lucide-react";
import {format} from "date-fns";
import {RatePlanPageLayout, BackButton, useRatePlan} from "../..";

export default function RatePlanDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {ratePlan, isLoading, error, notFound} = useRatePlan(id);
    const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    useEffect(() => {
        if (id && ratePlan) {
            loadRoomTypes();
        }
    }, [id, ratePlan]);

    const loadRoomTypes = async () => {
        if (!ratePlan) return;

        try {
            const roomTypesPage = await roomTypeApi.getAllRoomTypesByRatePlanId(
                ratePlan.id,
                page,
                size
            );
            setRoomTypes(roomTypesPage.content);
        } catch (error: any) {
            console.error("Failed to load room types", error);
        }
    };

    return (
        <RatePlanPageLayout
            title="Rate Plan Details"
            subtitle={ratePlan?.name || "View rate plan information"}
            isLoading={isLoading}
            error={error}
            notFound={notFound}
            notFoundMessage="Rate plan not found"
            loadingTitle="Loading rate plan details..."
        >
            {ratePlan && (
                <div className="space-y-6">
                    {/* Header Buttons */}
                    <div className="flex items-center justify-between">
                        <BackButton
                            onClick={() => navigate("/rate-plans")}
                            label="Back to Rate Plans"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/rate-plans/${ratePlan.id}/assign-room-types`)}
                            >
                                <Link2 className="mr-2 h-4 w-4" /> Assign Room Types
                            </Button>
                            <Button variant="outline" onClick={() => navigate(`/rate-plans/${ratePlan.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Rate Plan
                            </Button>
                        </div>
                    </div>

                {/* Rate Plan Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rate Plan Information</CardTitle>
                        <CardDescription>Basic information about this rate plan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Code</p>
                                <p className="text-lg">{ratePlan.code}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Name</p>
                                <p className="text-lg">{ratePlan.name}</p>
                            </div>
                            {ratePlan.rateType && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rate Type</p>
                                    <p className="text-lg">{ratePlan.rateType.name}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge>{ratePlan.status}</Badge>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {ratePlan.isDefault && <Badge>Default</Badge>}
                            {ratePlan.isPublic && <Badge variant="secondary">Public</Badge>}
                            {ratePlan.isPackage && <Badge variant="outline">Package</Badge>}
                            {ratePlan.requiresGuarantee && <Badge variant="destructive">Requires Guarantee</Badge>}
                            {ratePlan.nonRefundable && <Badge variant="destructive">Non-Refundable</Badge>}
                        </div>

                        {ratePlan.validFrom && ratePlan.validTo && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Valid from {format(new Date(ratePlan.validFrom), "MMM dd, yyyy")} to{" "}
                                {format(new Date(ratePlan.validTo), "MMM dd, yyyy")}
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Assigned Room Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Room Types</CardTitle>
                        <CardDescription>Room types this rate plan is available for</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {roomTypes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No room types assigned to this rate plan.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {roomTypes.map((roomType) => (
                                    <div
                                        key={roomType.id}
                                        className="flex items-center justify-between p-3 border rounded-md"
                                    >
                                        <div>
                                            <p className="font-medium">{roomType.name}</p>
                                            <p className="text-sm text-muted-foreground">{roomType.code}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/room-types/${roomType.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
            )}
        </RatePlanPageLayout>
    );
}
