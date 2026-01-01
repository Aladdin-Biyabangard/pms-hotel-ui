import {cn} from "@/lib/utils";
import {Card, CardContent} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Calendar, Mail, MapPin, Phone} from "lucide-react";

interface GuestCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  totalStays: number;
  vipStatus?: boolean;
  lastVisit?: Date;
  onClick?: () => void;
  className?: string;
}

export const GuestCard = ({
  name,
  email,
  phone,
  country,
  totalStays,
  vipStatus = false,
  lastVisit,
  onClick,
  className,
}: GuestCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-elevated group",
        "border-border/50 hover:border-accent/50",
        vipStatus && "border-l-4 border-l-accent",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className={cn(
              "text-sm font-semibold",
              vipStatus 
                ? "bg-accent text-accent-foreground" 
                : "bg-primary/10 text-primary"
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                {name}
              </h3>
              {vipStatus && (
                <Badge className="bg-accent text-accent-foreground text-xs px-1.5">
                  VIP
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{country}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{totalStays} stays</span>
          </div>
          {lastVisit && (
            <span className="text-xs text-muted-foreground">
              Last: {lastVisit.toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
