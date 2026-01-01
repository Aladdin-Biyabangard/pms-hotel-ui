import React from 'react';
import { RatePackageComponentResponse } from '@/api/ratePackageComponent';
import { PackageComponentForm } from './PackageComponentForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';

interface EditPackageComponentDialogProps {
    component: RatePackageComponentResponse | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const EditPackageComponentDialog: React.FC<EditPackageComponentDialogProps> = ({
    component,
    open,
    onOpenChange,
    onSuccess,
}) => {
    const handleClose = () => {
        onOpenChange(false);
    };

    const handleSuccess = () => {
        onSuccess?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Edit Package Component</DialogTitle>
                            <DialogDescription>
                                Modify the details of this package component
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <PackageComponentForm
                    open={open}
                    onClose={handleClose}
                    onSuccess={handleSuccess}
                    initialData={component || undefined}
                />
            </DialogContent>
        </Dialog>
    );
};
