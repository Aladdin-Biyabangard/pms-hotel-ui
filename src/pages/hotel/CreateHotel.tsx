import React from 'react';
import {PageWrapper} from '@/components/layout/PageWrapper';
import {HotelForm} from '@/components/hotel/HotelForm';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {HotelResponse} from '@/api/hotel';
import {toast} from 'sonner';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {canManageHotels} from '@/utils/roleUtils';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';

const CreateHotel: React.FC = () => {
    const navigate = useNavigate();
    const {user} = useAuth();

    const handleSuccess = (hotel: HotelResponse) => {
        toast.success(`Hotel "${hotel.name}" created successfully!`);
        navigate(`/hotels/${hotel.id}`); // Navigate to hotel details to upload images
    };

    const handleCancel = () => {
        navigate('/hotels');
    };

    if (!canManageHotels(user?.role || [])) {
        return (
            <PageWrapper title="Create Hotel">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You don't have permission to create hotels. Only Directors can create hotels.
                    </AlertDescription>
                </Alert>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Create Hotel" subtitle="Add a new hotel to the system">
            <div className="max-w-5xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Hotel Details</CardTitle>
                        <CardDescription>
                            Enter the details of the new hotel. Fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HotelForm onSuccess={handleSuccess} onCancel={handleCancel} />
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default CreateHotel;
