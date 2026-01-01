import {PackageComponentForm} from '../forms/PackageComponentForm';
import {PackageComponentView} from './PackageComponentView';
import {RatePackageComponentResponse} from '../api/packageComponents.api';

interface PackageComponentDialogsProps {
  editingComponent: RatePackageComponentResponse | null;
  viewingComponent: RatePackageComponentResponse | null;
  editDialogOpen: boolean;
  viewDialogOpen: boolean;
  onEditDialogChange: (open: boolean) => void;
  onViewDialogChange: (open: boolean) => void;
  onEditSuccess: () => void;
}

export function PackageComponentDialogs({
  editingComponent,
  viewingComponent,
  editDialogOpen,
  viewDialogOpen,
  onEditDialogChange,
  onViewDialogChange,
  onEditSuccess,
}: PackageComponentDialogsProps) {
  return (
    <>
      <PackageComponentForm
        initialData={editingComponent}
        open={editDialogOpen}
        onClose={() => onEditDialogChange(false)}
        onSuccess={onEditSuccess}
        defaultRatePlanId={editingComponent?.ratePlanId}
      />
      <PackageComponentView
        component={viewingComponent}
        open={viewDialogOpen}
        onOpenChange={onViewDialogChange}
      />
    </>
  );
}
