import {cn} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {RoomStatusBadge} from "./RoomStatusBadge";
import {EntityStatusBadge} from "./EntityStatusBadge";
import {BedDouble, DollarSign, Image as ImageIcon} from "lucide-react";
import {RoomResponse} from "@/api/hotel";

interface RoomCardProps {
  room: RoomResponse;
  onClick?: () => void;
  className?: string;
}

export const RoomCard = ({
  room,
  onClick,
  className,
}: RoomCardProps) => {
  const roomStatus = room.roomStatus || 'AVAILABLE';
  const isActive = room.status === 'ACTIVE';
  const mainPhoto = room.photoUrls && room.photoUrls.length > 0 ? room.photoUrls[0] : null;
  
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-elevated group border-border/50",
        "hover:border-accent/50",
        !isActive && "opacity-60",
        (roomStatus === "OCCUPIED_CLEAN" || roomStatus === "OCCUPIED_DIRTY") && "border-l-4 border-l-primary",
        (roomStatus === "VACANT_CLEAN" || roomStatus === "VACANT_DIRTY") && "border-l-4 border-l-success",
        (roomStatus === "OUT_OF_SERVICE" || roomStatus === "OUT_OF_ORDER") && "border-l-4 border-l-destructive",
        className
      )}
    >
      {mainPhoto ? (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <img
            src={mainPhoto}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
          <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
              Room {room.roomNumber}
            </h3>
            <p className="text-sm text-muted-foreground">{room.roomType} • Floor {room.floor}</p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <EntityStatusBadge status={room.status} />
            {room.roomStatus && <RoomStatusBadge status={room.roomStatus} />}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            <span>{room.bedCount} bed{room.bedCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>${room.pricePerNight.toFixed(2)}/night</span>
          </div>
        </div>

        {room.description && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {room.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

