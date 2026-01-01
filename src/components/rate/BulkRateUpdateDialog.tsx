import {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {CreateRoomRateRequest} from '@/api/roomRate';
import {toast} from 'sonner';

interface BulkRateUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (updates: Array<{ roomTypeId: number; ratePlanId: number; date: string; data: Partial<CreateRoomRateRequest> }>) => Promise<void>;
  selectedCount: number;
}

export function BulkRateUpdateDialog({ open, onClose, onConfirm, selectedCount }: BulkRateUpdateDialogProps) {
  const [updateType, setUpdateType] = useState<'set' | 'add' | 'subtract' | 'multiply' | 'percentage'>('set');
  const [value, setValue] = useState<string>('');
  const [updateFields, setUpdateFields] = useState({
    rateAmount: true,
    availabilityCount: false,
    stopSell: false,
    closedForArrival: false,
    closedForDeparture: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value) {
      toast.error('Please enter a value');
      return;
    }

    setIsLoading(true);
    try {
      // This will be handled by parent component
      // For now, just close the dialog
      onClose();
      toast.info('Bulk update will be processed');
    } catch (error) {
      toast.error('Failed to process bulk update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Rates</DialogTitle>
          <DialogDescription>
            Update {selectedCount} selected rate(s)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Update Type</Label>
            <Select value={updateType} onValueChange={(v: any) => setUpdateType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="set">Set to value</SelectItem>
                <SelectItem value="add">Add amount</SelectItem>
                <SelectItem value="subtract">Subtract amount</SelectItem>
                <SelectItem value="multiply">Multiply by</SelectItem>
                <SelectItem value="percentage">Change by percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {updateType === 'set' && 'New Value'}
              {updateType === 'add' && 'Amount to Add'}
              {updateType === 'subtract' && 'Amount to Subtract'}
              {updateType === 'multiply' && 'Multiplier'}
              {updateType === 'percentage' && 'Percentage Change (%)'}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
            />
          </div>

          <div className="space-y-2">
            <Label>Fields to Update</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rateAmount"
                  checked={updateFields.rateAmount}
                  onCheckedChange={(checked) =>
                    setUpdateFields(prev => ({ ...prev, rateAmount: checked as boolean }))
                  }
                />
                <Label htmlFor="rateAmount" className="font-normal">Rate Amount</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availabilityCount"
                  checked={updateFields.availabilityCount}
                  onCheckedChange={(checked) =>
                    setUpdateFields(prev => ({ ...prev, availabilityCount: checked as boolean }))
                  }
                />
                <Label htmlFor="availabilityCount" className="font-normal">Availability Count</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stopSell"
                  checked={updateFields.stopSell}
                  onCheckedChange={(checked) =>
                    setUpdateFields(prev => ({ ...prev, stopSell: checked as boolean }))
                  }
                />
                <Label htmlFor="stopSell" className="font-normal">Stop Sell</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="closedForArrival"
                  checked={updateFields.closedForArrival}
                  onCheckedChange={(checked) =>
                    setUpdateFields(prev => ({ ...prev, closedForArrival: checked as boolean }))
                  }
                />
                <Label htmlFor="closedForArrival" className="font-normal">Closed for Arrival</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="closedForDeparture"
                  checked={updateFields.closedForDeparture}
                  onCheckedChange={(checked) =>
                    setUpdateFields(prev => ({ ...prev, closedForDeparture: checked as boolean }))
                  }
                />
                <Label htmlFor="closedForDeparture" className="font-normal">Closed for Departure</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Rates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

