import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Star} from "lucide-react";

interface GuestHistoryProps {
  guestId?: number;
  guestName?: string;
  totalSpent?: number;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  preferredRooms?: string[];
  specialRequests?: string[];
  totalVisits?: number;
  lastVisit?: string;
}

export function GuestHistory({
  guestId,
  guestName = "Guest",
  totalSpent = 0,
  loyaltyTier = "Standard",
  loyaltyPoints = 0,
  preferredRooms = [],
  specialRequests = [],
  totalVisits = 0,
  lastVisit,
}: GuestHistoryProps) {

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Guest History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{guestName}</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Star className="h-3 w-3" />
            {loyaltyTier} Member
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border border-border/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Total Visits</div>
                <div className="text-2xl font-bold">{totalVisits}</div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Loyalty Points</div>
                <div className="text-2xl font-bold">{loyaltyPoints}</div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Last Visit</div>
                <div className="text-sm font-bold">{lastVisit || 'N/A'}</div>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="preferences" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Preferred Rooms</h4>
                {preferredRooms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {preferredRooms.map((room, index) => (
                      <Badge key={index} variant="outline">
                        {room}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No preferences set</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Special Requests</h4>
                {specialRequests.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {specialRequests.map((request, index) => (
                      <li key={index}>{request}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No special requests</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 border border-border/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Loyalty Points</span>
                  <Badge variant="default">{loyaltyPoints} pts</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Tier: {loyaltyTier}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

