import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {FormPanel, FormSection} from '@/components/ui/form-panel';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent} from '@/components/ui/card';
import {Loader2, Save, X} from 'lucide-react';
import {ratePlanApi, RatePlanRequest, RatePlanResponse,} from '@/api/ratePlan';
import {rateTypeApi, RateTypeResponse} from '@/api/rateType';
import {rateCategoryApi, RateCategoryResponse} from '@/api/rateCategory';
import {rateClassApi, RateClassResponse} from '@/api/rateClass';
import {toast} from 'sonner';

const ratePlanSchema = z.object({
    code: z.string().min(1, 'Rate code is required').max(50),
    name: z.string().min(1, 'Rate name is required').max(200),
    description: z.string().max(1000).optional(),
    rateTypeId: z.number().min(1, 'Rate type is required'),
    rateCategoryId: z.number().optional(),
    rateClassId: z.number().optional(),
    isDefault: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    isPackage: z.boolean().optional(),
    minStayNights: z.number().int().min(1).optional(),
    requiresGuarantee: z.boolean().optional(),
    nonRefundable: z.boolean().optional(),
    applicableDays: z.array(z.string()).optional(),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    viewedFrom: z.string().optional(),
    viewedTo: z.string().optional(),

    // Yeni sahələr
    rateTier: z.number().int().optional(),
    restrictions: z.object({
        minGuests: z.number().int().optional(),
        maxGuests: z.number().int().optional(),
        extraGuestCharge: z.number().optional(),
        includesExtraBed: z.boolean().optional(),
        extraBedCharge: z.number().optional(),
        maxOccupancy: z.number().optional(),
        childAgeLimit: z.number().optional(),
        applicableDayNames: z.array(z.string()).optional(),
        season: z.string().optional(),
        holidayMultiplier: z.number().optional(),
        weekendMultiplier: z.number().optional(),
        minLengthOfStay: z.number().optional(),
        maxLengthOfStay: z.number().optional(),
        advancePurchaseRequired: z.boolean().optional(),
        advancePurchaseDays: z.number().optional(),
        lastMinuteDiscount: z.number().optional(),
        earlyBirdDiscount: z.number().optional(),
        groupDiscount: z.number().optional(),
        corporateDiscount: z.number().optional(),
        loyaltyDiscount: z.number().optional(),
    }).optional(),
});

type RatePlanFormValues = z.infer<typeof ratePlanSchema>;

interface RatePlanFormProps {
    ratePlan?: RatePlanResponse;
    onSuccess?: (ratePlan: RatePlanResponse) => void;
    onCancel?: () => void;
}

export const RatePlanForm: React.FC<RatePlanFormProps> = ({ratePlan, onSuccess, onCancel}) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
    const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([]);
    const [rateClasses, setRateClasses] = useState<RateClassResponse[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [loadingData, setLoadingData] = useState(true);
    const isEditMode = !!ratePlan;

    const form = useForm<RatePlanFormValues>({
        resolver: zodResolver(ratePlanSchema),
        defaultValues: {
            code: ratePlan?.code || '',
            name: ratePlan?.name || '',
            description: ratePlan?.description || '',
            rateTypeId: ratePlan?.rateType?.id || 0,
            rateCategoryId: ratePlan?.rateCategoryId,
            rateClassId: ratePlan?.rateClassId,
            isDefault: ratePlan?.isDefault || false,
            isPublic: ratePlan?.isPublic ?? true,
            isPackage: ratePlan?.isPackage || false,
            requiresGuarantee: ratePlan?.requiresGuarantee || false,
            nonRefundable: ratePlan?.nonRefundable || false,
            validFrom: ratePlan?.validFrom || '',
            validTo: ratePlan?.validTo || '',
            viewedFrom: ratePlan?.viewedFrom || '',
            viewedTo: ratePlan?.validTo || '',
            // Yeni sahələr
            rateTier: ratePlan?.rateTier,
            restrictions: ratePlan?.restrictions || {},
        }

    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (ratePlan) {
            form.reset({
                code: ratePlan.code || '',
                name: ratePlan.name || '',
                description: ratePlan.description || '',
                rateTypeId: ratePlan.rateType?.id || 0,
                rateCategoryId: ratePlan.rateCategoryId,
                rateClassId: ratePlan.rateClassId,
                isDefault: ratePlan.isDefault || false,
                isPublic: ratePlan.isPublic ?? true,
                isPackage: ratePlan.isPackage || false,
                requiresGuarantee: ratePlan.requiresGuarantee || false,
                nonRefundable: ratePlan.nonRefundable || false,
                validFrom: ratePlan.validFrom || '',
                validTo: ratePlan.validTo || '',
                minStayNights: ratePlan.minStayNights,
            });
        }
    }, [ratePlan, form]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [rateTypesData, rateCategoriesData] = await Promise.all([
                rateTypeApi.getAllRateTypes(0, 1000),
                rateCategoryApi.getAllRateCategories(0, 1000),
            ]);
            setRateTypes(rateTypesData.content);
            setRateCategories(rateCategoriesData.content);

            if (ratePlan?.rateCategoryId) {
                setSelectedCategoryId(ratePlan.rateCategoryId);
                const rateClassesData = await rateClassApi.getAllRateClasses(0, 1000, {
                    rateCategoryId: ratePlan.rateCategoryId
                });
                setRateClasses(rateClassesData.content);
            }
        } catch (err: any) {
            console.error('Failed to load data', err);
            toast.error('Failed to load data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleCategoryChange = async (categoryId: number | undefined) => {
        setSelectedCategoryId(categoryId);
        form.setValue('rateClassId', undefined);

        if (categoryId) {
            try {
                const rateClassesData = await rateClassApi.getAllRateClasses(0, 1000, {
                    rateCategoryId: categoryId
                });
                setRateClasses(rateClassesData.content);
            } catch (err: any) {
                console.error('Failed to load rate classes', err);
            }
        } else {
            setRateClasses([]);
        }
    };

    const onSubmit = async (data: RatePlanFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            let response: RatePlanResponse;
            const payload: RatePlanRequest = {
                code: data.code,
                rateTypeId: data.rateTypeId,
                name: data.name,
                description: data.description || undefined,
                rateCategoryId: data.rateCategoryId,
                rateClassId: data.rateClassId,
                isDefault: data.isDefault,
                isPublic: data.isPublic,
                isPackage: data.isPackage,
                requiresGuarantee: data.requiresGuarantee,
                nonRefundable: data.nonRefundable,
                applicableDays: data.applicableDays && data.applicableDays.length > 0 ? data.applicableDays : undefined,
                validFrom: data.validFrom || undefined,
                validTo: data.validTo || undefined,
                minStayNights: data.minStayNights,
                viewedFrom: data.viewedFrom || undefined,
                viewedTo: data.viewedTo || undefined,

                // Yeni sahələr
                rateTier: data.rateTier,
                restrictions: data.restrictions,
            };


            if (isEditMode && ratePlan) {
                response = await ratePlanApi.updateRatePlan(ratePlan.id, payload as RatePlanRequest);
                toast.success('Rate plan updated successfully');
            } else {
                response = await ratePlanApi.createRatePlan(payload as RatePlanRequest);
                toast.success('Rate plan created successfully');
            }

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(`Failed to ${isEditMode ? 'update' : 'create'} rate plan. Please try again.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Basic Information */}
                <FormPanel title="Basic Information" description="Rate plan identification and type">
                    <FormSection>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rate Code *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., BAR, PROMO, CORP"
                                                {...field}
                                                className="uppercase"
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormDescription>Unique identifier</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rate Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Best Available Rate" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Rate plan description..."
                                            {...field}
                                            rows={2}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rateTypeId"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Rate Type *</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                            value={field.value?.toString() || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rate type"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {rateTypes.map((rt) => (
                                                <SelectItem key={rt.id} value={rt.id.toString()}>
                                                    {rt.name} ({rt.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </FormSection>
                </FormPanel>

                {/* Classification (Optional) */}
                <FormPanel title="Classification" description="Optional category and class for reporting">
                    <FormSection>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="rateCategoryId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rate Category</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                const categoryId = value ? parseInt(value, 10) : undefined;
                                                field.onChange(categoryId);
                                                handleCategoryChange(categoryId);
                                            }}
                                            value={field.value?.toString() || ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category (optional)"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {rateCategories.map((rc) => (
                                                    <SelectItem key={rc.id}
                                                                value={rc.id.toString()}>{rc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rateClassId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Rate Class</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                                            value={field.value?.toString() || ''}
                                            disabled={!selectedCategoryId}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={selectedCategoryId ? "Select class" : "Select category first"}/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {rateClasses.map((rc) => (
                                                    <SelectItem key={rc.id}
                                                                value={rc.id.toString()}>{rc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>
                </FormPanel>

                {/* Settings */}
                <FormPanel title="Settings" description="options and policies">
                    <FormSection>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <FormField
                                control={form.control}
                                name="isDefault"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">Default</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">Public</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isPackage"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">Package</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="requiresGuarantee"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">Guarantee</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nonRefundable"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">Non-Refund</FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>
                </FormPanel>

                {/* Restrictions */}
                <FormPanel title="Restrictions" description="Booking and stay restrictions">
                    <FormSection>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="minStayNights"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Min Stay</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="1"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                            />
                                        </FormControl>
                                        <FormDescription>Nights</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </FormSection>
                </FormPanel>

                {/* Validity & Days */}
                <FormPanel title="Validity and Viewed Period" description="When this rate plan is active">
                    <FormSection>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="validFrom"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Valid From</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="validTo"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Valid To</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-18">
                            <FormField
                                control={form.control}
                                name="viewedFrom"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Viewed From</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="viewedTo"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Viewed To</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                    </FormSection>
                </FormPanel>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
                            <X className="h-4 w-4 mr-2"/>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                        ) : (
                            <Save className="h-4 w-4 mr-2"/>
                        )}
                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Rate Plan' : 'Create Rate Plan')}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
