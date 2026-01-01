import {RateTierCreate} from './RateTierCreate';
import {RateTierEdit} from './RateTierEdit';
import {RateTierView} from './RateTierView';
import {RateTierResponse} from '../api/rateTiers.api';

interface RateTiersDialogsProps {
  editingTier: RateTierResponse | null;
  viewingTier: RateTierResponse | null;
  creatingTier: boolean;
  editDialogOpen: boolean;
  viewDialogOpen: boolean;
  createDialogOpen: boolean;
  onEditDialogChange: (open: boolean) => void;
  onViewDialogChange: (open: boolean) => void;
  onCreateDialogChange: (open: boolean) => void;
  onEditSuccess: () => void;
  onCreateSuccess: () => void;
  defaultRatePlanId?: number;
}

export function RateTiersDialogs({
  editingTier,
  viewingTier,
  creatingTier,
  editDialogOpen,
  viewDialogOpen,
  createDialogOpen,
  onEditDialogChange,
  onViewDialogChange,
  onCreateDialogChange,
  onEditSuccess,
  onCreateSuccess,
  defaultRatePlanId,
}: RateTiersDialogsProps) {
  return (
    <>
      <RateTierCreate
        open={createDialogOpen}
        onClose={() => onCreateDialogChange(false)}
        onSuccess={onCreateSuccess}
        defaultRatePlanId={defaultRatePlanId}
      />
      <RateTierEdit
        tier={editingTier}
        open={editDialogOpen}
        onClose={() => onEditDialogChange(false)}
        onSuccess={onEditSuccess}
      />
      <RateTierView
        tier={viewingTier}
        open={viewDialogOpen}
        onClose={() => onViewDialogChange(false)}
      />
    </>
  );
}
