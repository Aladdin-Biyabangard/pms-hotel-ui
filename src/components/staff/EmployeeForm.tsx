import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';

import {hotelApi, HotelResponse} from '@/api/hotel';
import {useAuth} from '@/context/AuthContext';
import {hasRole} from '@/utils/roleUtils';

/* =========================
   Schema
========================= */

const employeeSchema = z
    .object({
        firstName: z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must be at most 50 characters')
            .regex(/^[A-Za-z]+$/, 'First name can only contain letters'),

        lastName: z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must be at most 50 characters')
            .regex(/^[A-Za-z]+$/, 'Last name can only contain letters'),

        email: z
            .string()
            .email('Invalid email format')
            .max(100, 'Email cannot be longer than 100 characters'),

        password: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(30, 'Password must be at most 30 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
            ),

        passwordConfirm: z.string(),

        role: z.string().min(1, 'Role is required'),

        hotelId: z.number({
            required_error: 'Hotel is required',
            invalid_type_error: 'Hotel is required',
        }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords don't match",
        path: ['passwordConfirm'],
    });

type EmployeeFormValues = z.infer<typeof employeeSchema>;

/* =========================
   Props
========================= */

interface EmployeeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeFormValues) => Promise<void>;
}

const AVAILABLE_ROLES = [
    'ADMIN',
    'FRONT_DESK',
    'HOUSEKEEPING',
    'MANAGER',
    'ACCOUNTING',
];

/* =========================
   Component
========================= */

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSubmit,
                                                          }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hotels, setHotels] = useState<HotelResponse[]>([]);
    const [isLoadingHotels, setIsLoadingHotels] = useState(false);

    const { user } = useAuth();
    const isDirector = user?.role && hasRole(user.role, 'DIRECTOR');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirm: '',
            role: '',
            hotelId: undefined,
        },
    });

    const selectedRole = watch('role');
    const selectedHotelId = watch('hotelId');

    /* =========================
       Load Hotels
    ========================= */

    useEffect(() => {
        if (isOpen && isDirector) {
            loadHotels();
        }
    }, [isOpen, isDirector]);

    const loadHotels = async () => {
        setIsLoadingHotels(true);
        try {
            const hotelsData = await hotelApi.getAllHotels();
            setHotels(hotelsData);
        } catch (error) {
            console.error('Failed to load hotels', error);
        } finally {
            setIsLoadingHotels(false);
        }
    };

    /* =========================
       Auto select hotel
    ========================= */

    useEffect(() => {
        if (isDirector && hotels.length > 0 && !selectedHotelId) {
            setValue('hotelId', hotels[0].id, { shouldValidate: true });
        }
    }, [hotels, isDirector]);

    /* =========================
       Submit
    ========================= */

    const handleFormSubmit = async (data: EmployeeFormValues) => {
        setIsLoading(true);
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create employee', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            reset();
            onClose();
        }
    };

    /* =========================
       Render
    ========================= */

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogDescription>
                        Add a new employee to the system. All fields are required.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input id="firstName" {...register('firstName')} disabled={isLoading} />
                            {errors.firstName && (
                                <p className="text-sm text-destructive">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" {...register('lastName')} disabled={isLoading} />
                            {errors.lastName && (
                                <p className="text-sm text-destructive">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" {...register('email')} disabled={isLoading} />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select value={selectedRole} onValueChange={(v) => setValue('role', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role.message}</p>
                        )}
                    </div>

                    {isDirector && (
                        <div className="space-y-2">
                            <Label htmlFor="hotelId">Hotel *</Label>
                            <Select
                                value={selectedHotelId?.toString()}
                                onValueChange={(v) => setValue('hotelId', Number(v))}
                                disabled={isLoading || isLoadingHotels}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hotels.map((hotel) => (
                                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                                            {hotel.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.hotelId && (
                                <p className="text-sm text-destructive">{errors.hotelId.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                        <Input id="passwordConfirm" type="password" {...register('passwordConfirm')} />
                        {errors.passwordConfirm && (
                            <p className="text-sm text-destructive">
                                {errors.passwordConfirm.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Employee'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
