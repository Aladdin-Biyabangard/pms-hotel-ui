import {useLocation, useNavigate} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {RateManagementDashboard} from '@/components/rate/RateManagementDashboard';
import {Calendar, FileText, FolderTree, Layers, LayoutDashboard, Package, TrendingUp} from 'lucide-react';
import {cn} from '@/lib/utils';

const navigationItems = [
  { path: '/rate-management', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/rate-matrix', label: 'Rate Calendar', icon: Calendar },
  { path: '/rate-plans', label: 'Rate Plans', icon: FileText },
  { path: '/rate-tiers', label: 'Rate Tiers', icon: Layers },
  { path: '/rate-package-components', label: 'Package Components', icon: Package },
  { path: '/rate-classification', label: 'Classification', icon: FolderTree },
  { path: '/rate-overrides', label: 'Rate Overrides', icon: TrendingUp },
];

export default function RateManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageWrapper
      title="Rate Management"
      subtitle="Manage rates, rate plans, and pricing"
    >
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-2',
                  isActive && 'shadow-sm'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Dashboard Content */}
        <RateManagementDashboard />
      </div>
    </PageWrapper>
  );
}
