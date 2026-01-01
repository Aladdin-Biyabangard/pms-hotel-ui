import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {Button} from '@/components/ui/button';
import {GuestDetails as GuestDetailsComponent} from '@/components/guest/GuestDetails';
import {GuestResponse, guestsApi} from '@/api/guests';
import {toast} from 'sonner';
import {ArrowLeft, Edit, Trash2} from 'lucide-react';
import {ConfirmDialog} from '@/components/staff/ConfirmDialog';

const GuestDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [guest, setGuest] = useState<GuestResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            loadGuest(parseInt(id, 10));
        }
    }, [id]);

    const loadGuest = async (guestId: number) => {
        try {
            setIsLoading(true);
            const data = await guestsApi.getGuestById(guestId);
            setGuest(data);
        } catch (error: any) {
            console.error('Failed to load guest', error);
            const errorMessage = error.response?.data?.message || 
                (error.response?.status === 404 ? "Guest not found" :
                 error.response?.status === 401 ? "Please log in again" :
                 "Failed to load guest");
            toast.error(errorMessage);
            if (error.response?.status === 404) {
                navigate('/guests');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!guest) return;

        try {
            setIsDeleting(true);
            await guestsApi.deleteGuest(guest.id);
            toast.success('Guest deleted successfully');
            navigate('/guests');
        } catch (error: any) {
            console.error('Failed to delete guest', error);
            toast.error(error.response?.data?.message || 'Failed to delete guest');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper title="Guest Details" subtitle="View guest information">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading guest details...</p>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (!guest) {
        return (
            <PageWrapper title="Guest Details" subtitle="View guest information">
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg font-medium mb-2">Guest not found</p>
                    <Button onClick={() => navigate('/guests')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Guests
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper 
            title="Guest Details" 
            subtitle={`${guest.firstName} ${guest.lastName}`}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => navigate('/guests')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Guests
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(`/guests/${guest.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Guest
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Guest
                        </Button>
                    </div>
                </div>

                <GuestDetailsComponent guest={guest} />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Guest"
                    description={`Are you sure you want to delete ${guest.firstName} ${guest.lastName}? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    isLoading={isDeleting}
                />
            </div>
        </PageWrapper>
    );
};

export default GuestDetailsPage;

