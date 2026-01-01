import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Edit, Eye, Trash2} from 'lucide-react';
import {RatePackageComponentResponse} from '../api/packageComponents.api';

interface PackageComponentTableProps {
  components: RatePackageComponentResponse[];
  onView: (component: RatePackageComponentResponse) => void;
  onEdit: (component: RatePackageComponentResponse) => void;
  onDelete?: (component: RatePackageComponentResponse) => void;
}

export function PackageComponentTable({
  components,
  onView,
  onEdit,
  onDelete
}: PackageComponentTableProps) {
  const getComponentTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      SERVICE: { variant: 'default', label: 'Service' },
      MEAL: { variant: 'secondary', label: 'Meal' },
      ACTIVITY: { variant: 'outline', label: 'Activity' },
      TRANSPORTATION: { variant: 'outline', label: 'Transportation' },
      AMENITY: { variant: 'secondary', label: 'Amenity' },
      DISCOUNT: { variant: 'destructive', label: 'Discount' },
      OTHER: { variant: 'outline', label: 'Other' }
    };
    return variants[type] || { variant: 'outline' as const, label: type };
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No package components found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component Name</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden lg:table-cell">Code</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="hidden lg:table-cell">Adult Price</TableHead>
            <TableHead className="hidden lg:table-cell">Child Price</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => {
            const typeBadge = getComponentTypeBadge(component.componentType);
            const totalPrice = component.unitPrice && component.quantity ? component.unitPrice * component.quantity : component.unitPrice || 0;

            return (
              <TableRow key={component.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{component.componentName}</div>
                    {component.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{component.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {component.isIncluded ? (
                        <Badge variant="default" className="text-xs">Included</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Additional</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {component.componentCode || <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="text-right">{component.quantity || 1}</TableCell>
                <TableCell className="text-right">
                  {component.unitPrice ? (
                    <div>
                      <div className="font-semibold">${component.unitPrice.toFixed(2)}</div>
                      {component.quantity && component.quantity > 1 && (
                        <div className="text-xs text-muted-foreground">Total: ${totalPrice.toFixed(2)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Free</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right">
                  {component.priceAdult ? <span className="font-semibold">${component.priceAdult.toFixed(2)}</span> : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right">
                  {component.priceChild ? <span className="font-semibold">${component.priceChild.toFixed(2)}</span> : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={component.status === 'ACTIVE' ? 'default' : 'secondary'}>{component.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(component)} className="h-8 w-8" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(component)} className="h-8 w-8" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(component)} className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
