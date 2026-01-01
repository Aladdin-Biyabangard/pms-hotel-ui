import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Calendar, Edit, Plus, Trash2} from "lucide-react";
import {format} from "date-fns";

interface RatePlan {
  id: number;
  name: string;
  roomType: string;
  baseRate: number;
  currency: string;
  validFrom: string;
  validTo: string;
  restrictions?: {
    minStay?: number;
    maxStay?: number;
    advanceBooking?: number;
    cancellationPolicy?: string;
  };
  status: "active" | "inactive" | "scheduled";
}

interface RateManagementProps {
  ratePlans?: RatePlan[];
  onAddRate?: () => void;
  onEditRate?: (rate: RatePlan) => void;
  onDeleteRate?: (rateId: number) => void;
}

export function RateManagement({
  ratePlans = [],
  onAddRate,
  onEditRate,
  onDeleteRate,
}: RateManagementProps) {
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "scheduled">("all");

  const filteredRates = ratePlans.filter(rate => {
    if (filter === "all") return true;
    return rate.status === filter;
  });

  const defaultRates: RatePlan[] = [
    {
      id: 1,
      name: "Standard Rate",
      roomType: "Standard Double",
      baseRate: 150,
      currency: "USD",
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      restrictions: {
        minStay: 1,
        maxStay: 30,
        advanceBooking: 365,
        cancellationPolicy: "24 hours",
      },
      status: "active",
    },
    {
      id: 2,
      name: "Weekend Special",
      roomType: "Deluxe Suite",
      baseRate: 250,
      currency: "USD",
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      restrictions: {
        minStay: 2,
        cancellationPolicy: "48 hours",
      },
      status: "active",
    },
  ];

  const displayRates = ratePlans.length > 0 ? filteredRates : defaultRates;

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Rate Management</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rates</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onAddRate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Rate Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rate Plan</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No rate plans found
                  </TableCell>
                </TableRow>
              ) : (
                displayRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell>{rate.roomType}</TableCell>
                    <TableCell>
                      {rate.currency} {rate.baseRate.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(rate.validFrom), "MMM dd, yyyy")} - {format(new Date(rate.validTo), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rate.restrictions && (
                        <div className="text-xs space-y-1">
                          {rate.restrictions.minStay && (
                            <div>Min Stay: {rate.restrictions.minStay} nights</div>
                          )}
                          {rate.restrictions.maxStay && (
                            <div>Max Stay: {rate.restrictions.maxStay} nights</div>
                          )}
                          {rate.restrictions.cancellationPolicy && (
                            <div>Cancel: {rate.restrictions.cancellationPolicy}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rate.status === "active"
                            ? "default"
                            : rate.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {rate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditRate?.(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteRate?.(rate.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

