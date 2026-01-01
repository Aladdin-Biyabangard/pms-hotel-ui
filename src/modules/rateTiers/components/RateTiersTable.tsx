import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ArrowDown, ArrowUp, Edit, Eye, Trash2} from 'lucide-react';
import {RateTierResponse} from '../api/rateTiers.api';

interface RateTiersTableProps {
  tiers: RateTierResponse[];
  onView: (tier: RateTierResponse) => void;
  onEdit: (tier: RateTierResponse) => void;
  onDelete?: (tier: RateTierResponse) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export function RateTiersTable({
  tiers,
  onView,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown
}: RateTiersTableProps) {
  const getAdjustmentTypeBadge = (type: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PERCENTAGE: { variant: 'secondary', label: 'Percentage' },
      FIXED: { variant: 'default', label: 'Fixed' },
      MULTIPLIER: { variant: 'outline', label: 'Multiplier' },
    };
    return variants[type] || { variant: 'outline' as const, label: type };
  };

  const formatNightsRange = (minNights: number, maxNights?: number) => {
    if (maxNights) {
      return `${minNights}-${maxNights} nights`;
    }
    return `${minNights}+ nights`;
  };

  const formatAdjustmentValue = (value: number, type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return `${value}%`;
      case 'MULTIPLIER':
        return `×${value}`;
      default:
        return `$${value.toFixed(2)}`;
    }
  };

  if (tiers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No rate tiers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Priority</TableHead>
            <TableHead>Nights Range</TableHead>
            <TableHead>Adjustment Type</TableHead>
            <TableHead className="text-right">Adjustment Value</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier, index) => {
            const typeBadge = getAdjustmentTypeBadge(tier.adjustmentType);
            return (
              <TableRow key={tier.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{tier.priority || 0}</span>
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => onMoveUp?.(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => onMoveDown?.(index)}
                        disabled={index === tiers.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatNightsRange(tier.minNights, tier.maxNights)}
                </TableCell>
                <TableCell>
                  <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatAdjustmentValue(tier.adjustmentValue, tier.adjustmentType)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={tier.status === 'ACTIVE' ? 'default' : 'secondary'}
                  >
                    {tier.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(tier)} className="h-8 w-8" title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tier)} className="h-8 w-8" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(tier)} className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
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
