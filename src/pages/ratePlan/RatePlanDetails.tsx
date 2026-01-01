import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {PageWrapper} from "@/components/layout/PageWrapper";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ratePlanApi, RatePlanResponse} from "@/api/ratePlan";
import {roomTypeApi, RoomTypeResponse} from "@/api/roomType";
import {toast} from "sonner";
import {ArrowLeft, Calendar, Edit, Link2} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {format} from "date-fns";

export default function RatePlanDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [ratePlan, setRatePlan] = useState<RatePlanResponse | null>(null);
    const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            const ratePlanData = await ratePlanApi.getRatePlan(Number(id));

            const roomTypesPage = await roomTypeApi.getAllRoomTypesByRatePlanId(
                ratePlanData.id,
                page,
                size
            );

            setRatePlan(ratePlanData);
            setRoomTypes(roomTypesPage.content);
        } catch (error: any) {
            console.error("Failed to load rate plan", error);
            toast.error(error?.response?.data?.message || "Failed to load rate plan");
            navigate("/rate-plans");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper title="Rate Plan Details" subtitle="View rate plan information">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-96 w-full" />
                </div>
            </PageWrapper>
        );
    }

    if (!ratePlan) {
        return (
            <PageWrapper title="Rate Plan Details" subtitle="Rate plan not found">
                <div className="max-w-6xl mx-auto">
                    <p className="text-muted-foreground">Rate plan not found</p>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Rate Plan Details" subtitle={ratePlan.name}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Buttons */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigate("/rate-plans")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Rate Plans
                    </Button>
                    <div className="flex gap-2">
                        {/* Yalnız bu düymə saxlanılır */}
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
        </PageWrapper>
    );
}
