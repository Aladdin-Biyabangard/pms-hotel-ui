import {useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";
import {
    BarChart3,
    BedDouble,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    DollarSign,
    Globe,
    Hotel,
    LayoutDashboard,
    Moon,
    Package,
    Receipt,
    Settings,
    Sparkles,
    Sun,
    Target,
    UserCog,
    Users,
    UsersRound,
    Workflow,
    Wrench,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon: Icon, label, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const content = (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "hover:bg-sidebar-accent group",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary-foreground")} />
      {!isCollapsed && (
        <span className="font-medium text-sm truncate">{label}</span>
      )}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

interface NavGroupProps {
  group: string;
  items: Array<{ to: string; icon: React.ElementType; label: string }>;
  isCollapsed: boolean;
}

const NavGroup = ({ group, items, isCollapsed }: NavGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const hasActiveItem = items.some(item => location.pathname === item.to);

  if (isCollapsed) {
    return (
      <>
        {items.map((item) => (
          <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
        ))}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider",
          "text-sidebar-foreground/60 hover:text-sidebar-foreground/80 transition-colors"
        )}
      >
        <span>{group}</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {isExpanded && (
        <div className="space-y-1 pl-1">
          {items.map((item) => (
            <NavItem key={item.to} {...item} isCollapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar = ({ isDarkMode, onToggleDarkMode }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      group: "Core Operations",
      items: [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/calendar", icon: CalendarDays, label: "Calendar" },
        { to: "/workflow", icon: Workflow, label: "Workflow Queue" },
      ],
    },
    {
      group: "Property Management",
      items: [
        { to: "/hotels", icon: Hotel, label: "Hotels" },
        { to: "/rooms", icon: BedDouble, label: "Rooms" },
        { to: "/room-types", icon: BedDouble, label: "Room Types" },
        { to: "/guests", icon: Users, label: "Guests" },
        { to: "/rate-management", icon: DollarSign, label: "Rate Management" },
        { to: "/pricing-rules", icon: DollarSign, label: "Pricing Rules" },
      ],
    },
    {
      group: "Services",
      items: [
        { to: "/services", icon: Package, label: "Services" },
        { to: "/housekeeping", icon: Sparkles, label: "Housekeeping" },
        { to: "/maintenance", icon: Wrench, label: "Maintenance" },
        { to: "/billing", icon: Receipt, label: "Billing" },
      ],
    },
    {
      group: "Package Analytics",
      items: [
        { to: "/package-performance", icon: BarChart3, label: "Package Performance" },
        { to: "/package-comparison", icon: Workflow, label: "Package Comparison" },
        { to: "/package-revenue", icon: Target, label: "Revenue Analytics" },
      ],
    },
    {
      group: "Administration",
      items: [
        { to: "/revenue", icon: DollarSign, label: "Revenue Management" },
        { to: "/groups", icon: UsersRound, label: "Group Management" },
        { to: "/channels", icon: Globe, label: "Channel Management" },
        { to: "/reports", icon: BarChart3, label: "Reports & Analytics" },
        { to: "/employees", icon: UserCog, label: "Employees" },
        { to: "/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-md">
            <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground text-sm">Ingress</span>
              <span className="text-xs text-sidebar-foreground/60">Hotel PMS</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroup
            key={group.group}
            group={group.group}
            items={group.items}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className={cn(
                "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center px-0"
              )}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              {!isCollapsed && (
                <span className="ml-3 text-sm">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          )}
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-3 text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};
