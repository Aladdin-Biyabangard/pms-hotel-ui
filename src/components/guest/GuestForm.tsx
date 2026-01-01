import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {CreateGuestRequest, GuestResponse, guestsApi, UpdateGuestRequest} from '@/api/guests';
import {GuestType} from '@/types/enums';
import {Form} from '@/components/ui/form';
import {FormPanel, FormSection} from '@/components/ui/form-panel';
import {Save, X} from 'lucide-react';
import {PersonalInfoSection} from './PersonalInfoSection';
import {AddressSection} from './AddressSection';
import {IdentificationSection} from './IdentificationSection';
import {LoyaltySection} from './LoyaltySection';
import {PreferencesSection} from './PreferencesSection';
import {CorporateInfoSection} from './CorporateInfoSection';

const guestSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name must not exceed 100 characters'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must not exceed 100 characters'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().min(1, 'Phone is required').max(20, 'Phone must not exceed 20 characters'),
    alternatePhone: z.string().max(20, 'Alternate phone must not exceed 20 characters').optional().or(z.literal('')),
    address: z.string().max(500, 'Address must not exceed 500 characters').optional().or(z.literal('')),
    city: z.string().max(100, 'City must not exceed 100 characters').optional().or(z.literal('')),
    state: z.string().max(100, 'State must not exceed 100 characters').optional().or(z.literal('')),
    country: z.string().max(100, 'Country must not exceed 100 characters').optional().or(z.literal('')),
    zipCode: z.string().max(20, 'Zip code must not exceed 20 characters').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    nationality: z.string().max(100, 'Nationality must not exceed 100 characters').optional().or(z.literal('')),
    passportNumber: z.string().max(50, 'Passport number must not exceed 50 characters').optional().or(z.literal('')),
    passportExpiryDate: z.string().optional(),
    idNumber: z.string().max(50, 'ID number must not exceed 50 characters').optional().or(z.literal('')),
    guestType: z.nativeEnum(GuestType).optional(),
    loyaltyMember: z.boolean().optional(),
    loyaltyPoints: z.number().int().min(0).optional(),
    loyaltyTier: z.string().max(50, 'Loyalty tier must not exceed 50 characters').optional().or(z.literal('')),
    preferredLanguage: z.string().max(50, 'Preferred language must not exceed 50 characters').optional().or(z.literal('')),
    dietaryPreferences: z.string().max(200, 'Dietary preferences must not exceed 200 characters').optional().or(z.literal('')),
    specialNeeds: z.string().max(500, 'Special needs must not exceed 500 characters').optional().or(z.literal('')),
    notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional().or(z.literal('')),
    companyName: z.string().max(200, 'Company name must not exceed 200 characters').optional().or(z.literal('')),
    companyAddress: z.string().max(500, 'Company address must not exceed 500 characters').optional().or(z.literal('')),
    taxId: z.string().max(100, 'Tax ID must not exceed 100 characters').optional().or(z.literal('')),
});

type GuestFormValues = z.infer<typeof guestSchema>;

interface GuestFormProps {
    guest?: GuestResponse;
    onSuccess?: (guest: GuestResponse) => void;
    onCancel?: () => void;
}

export const GuestForm: React.FC<GuestFormProps> = ({ guest, onSuccess, onCancel }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const isEditMode = !!guest;

    const form = useForm<GuestFormValues>({
        resolver: zodResolver(guestSchema),
        defaultValues: {
            firstName: guest?.firstName || '',
            lastName: guest?.lastName || '',
            email: guest?.email || '',
            phone: guest?.phone || '',
            alternatePhone: guest?.alternatePhone || '',
            address: guest?.address || '',
            city: guest?.city || '',
            state: guest?.state || '',
            country: guest?.country || '',
            zipCode: guest?.zipCode || '',
            dateOfBirth: guest?.dateOfBirth ? guest.dateOfBirth.split('T')[0] : '',
            nationality: guest?.nationality || '',
            passportNumber: guest?.passportNumber || '',
            passportExpiryDate: guest?.passportExpiryDate ? guest.passportExpiryDate.split('T')[0] : '',
            idNumber: guest?.idNumber || '',
            guestType: guest?.guestType || GuestType.INDIVIDUAL,
            loyaltyMember: guest?.loyaltyMember || false,
            loyaltyPoints: guest?.loyaltyPoints || undefined,
            loyaltyTier: guest?.loyaltyTier || '',
            preferredLanguage: guest?.preferredLanguage || '',
            dietaryPreferences: guest?.dietaryPreferences || '',
            specialNeeds: guest?.specialNeeds || '',
            notes: guest?.notes || '',
            companyName: guest?.companyName || '',
            companyAddress: guest?.companyAddress || '',
            taxId: guest?.taxId || '',
        },
    });

    useEffect(() => {
        if (guest) {
            form.reset({
                firstName: guest.firstName || '',
                lastName: guest.lastName || '',
                email: guest.email || '',
                phone: guest.phone || '',
                alternatePhone: guest.alternatePhone || '',
                address: guest.address || '',
                city: guest.city || '',
                state: guest.state || '',
                country: guest.country || '',
                zipCode: guest.zipCode || '',
                dateOfBirth: guest.dateOfBirth ? guest.dateOfBirth.split('T')[0] : '',
                nationality: guest.nationality || '',
                passportNumber: guest.passportNumber || '',
                passportExpiryDate: guest.passportExpiryDate ? guest.passportExpiryDate.split('T')[0] : '',
                idNumber: guest.idNumber || '',
                guestType: guest.guestType || GuestType.INDIVIDUAL,
                loyaltyMember: guest.loyaltyMember || false,
                loyaltyPoints: guest.loyaltyPoints || undefined,
                loyaltyTier: guest.loyaltyTier || '',
                preferredLanguage: guest.preferredLanguage || '',
                dietaryPreferences: guest.dietaryPreferences || '',
                specialNeeds: guest.specialNeeds || '',
                notes: guest.notes || '',
                companyName: guest.companyName || '',
                companyAddress: guest.companyAddress || '',
                taxId: guest.taxId || '',
            });
        }
    }, [guest, form]);

    const onSubmit = async (data: GuestFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            let response: GuestResponse;
            if (isEditMode && guest) {
                const payload: UpdateGuestRequest = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email || undefined,
                    phone: data.phone,
                    alternatePhone: data.alternatePhone || undefined,
                    address: data.address || undefined,
                    city: data.city || undefined,
                    state: data.state || undefined,
                    country: data.country || undefined,
                    zipCode: data.zipCode || undefined,
                    dateOfBirth: data.dateOfBirth || undefined,
                    nationality: data.nationality || undefined,
                    passportNumber: data.passportNumber || undefined,
                    passportExpiryDate: data.passportExpiryDate || undefined,
                    idNumber: data.idNumber || undefined,
                    guestType: data.guestType,
                    loyaltyMember: data.loyaltyMember,
                    loyaltyPoints: data.loyaltyPoints,
                    loyaltyTier: data.loyaltyTier || undefined,
                    preferredLanguage: data.preferredLanguage || undefined,
                    dietaryPreferences: data.dietaryPreferences || undefined,
                    specialNeeds: data.specialNeeds || undefined,
                    notes: data.notes || undefined,
                    companyName: data.companyName || undefined,
                    companyAddress: data.companyAddress || undefined,
                    taxId: data.taxId || undefined,
                };
                response = await guestsApi.updateGuest(guest.id, payload);
            } else {
                const payload: CreateGuestRequest = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email || undefined,
                    phone: data.phone,
                    alternatePhone: data.alternatePhone || undefined,
                    address: data.address || undefined,
                    city: data.city || undefined,
                    state: data.state || undefined,
                    country: data.country || undefined,
                    zipCode: data.zipCode || undefined,
                    dateOfBirth: data.dateOfBirth || undefined,
                    nationality: data.nationality || undefined,
                    passportNumber: data.passportNumber || undefined,
                    passportExpiryDate: data.passportExpiryDate || undefined,
                    idNumber: data.idNumber || undefined,
                    guestType: data.guestType,
                    loyaltyMember: data.loyaltyMember,
                    loyaltyPoints: data.loyaltyPoints,
                    loyaltyTier: data.loyaltyTier || undefined,
                    preferredLanguage: data.preferredLanguage || undefined,
                    dietaryPreferences: data.dietaryPreferences || undefined,
                    specialNeeds: data.specialNeeds || undefined,
                    notes: data.notes || undefined,
                    companyName: data.companyName || undefined,
                    companyAddress: data.companyAddress || undefined,
                    taxId: data.taxId || undefined,
                };
                response = await guestsApi.createGuest(payload);
            }

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'create'} guest. Please try again.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <FormPanel title="Personal Information" description="Basic guest information">
                    <FormSection>
                        <PersonalInfoSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Address Information" description="Guest address and location">
                    <FormSection>
                        <AddressSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Identification" description="Passport, ID, and identification documents">
                    <FormSection>
                        <IdentificationSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Guest Type & Corporate Information" description="Guest classification and corporate details">
                    <FormSection>
                        <CorporateInfoSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Loyalty Program" description="Loyalty membership and preferences">
                    <FormSection>
                        <LoyaltySection control={form.control} />
                    </FormSection>
                </FormPanel>

                <FormPanel title="Preferences & Notes" description="Guest preferences, special needs, and notes">
                    <FormSection>
                        <PreferencesSection control={form.control} />
                    </FormSection>
                </FormPanel>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Guest' : 'Create Guest')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
