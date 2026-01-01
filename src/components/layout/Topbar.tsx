import {Bell, ChevronDown, LogOut, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useAuth} from "@/context/AuthContext";

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export const Topbar = ({title, subtitle}: TopbarProps) => {
    const {user, logout} = useAuth();
    const userInitials = user
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        : "U";

    const userName = user
        ? `${user.firstName} ${user.lastName}`
        : "User";

    const userRole = user?.role?.[0] || "Staff";

    return (
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-border"/>
                <div>
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground"/>
                            <Badge
                                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0">
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium text-sm">New guest registered</span>
                            <span className="text-xs text-muted-foreground">John Smith completed registration</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium text-sm">Maintenance request</span>
                            <span className="text-xs text-muted-foreground">Room 301 reported plumbing issue</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium text-sm">Housekeeping complete</span>
                            <span className="text-xs text-muted-foreground">Room 301 is now ready</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">{userName}</span>
                                <span
                                    className="text-xs text-muted-foreground">{"Your role is "+userRole.substring(0, 1) + userRole.toLowerCase().substring(1)}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4"/>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Bell className="mr-2 h-4 w-4"/>
                            Preferences
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => logout()}
                        >
                            <LogOut className="mr-2 h-4 w-4"/>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

