// import React, {useEffect, useState} from 'react';
// import {useForm} from 'react-hook-form';
// import {zodResolver} from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import {Button} from '@/components/ui/button';
// import {Alert, AlertDescription} from '@/components/ui/alert';
// import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
// import {Input} from '@/components/ui/input';
// import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
// import {Checkbox} from '@/components/ui/checkbox';
// import {Textarea} from '@/components/ui/textarea';
// import {Switch} from '@/components/ui/switch';
// import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
// import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
// import {Badge} from '@/components/ui/badge';
// import {ScrollArea} from '@/components/ui/scroll-area';
// import {Separator} from '@/components/ui/separator';
// import {
//     AlertTriangle,
//     Building2,
//     CalendarDays,
//     ChevronRight,
//     FileText,
//     GripVertical,
//     Info,
//     Layers,
//     Package,
//     Plus,
//     Save,
//     Shield,
//     Sparkles,
//     Tag,
//     Trash2,
//     X
// } from 'lucide-react';
// import {RatePlanRequest, ratePlanApi, RatePlanResponse, UpdateRatePlanRequest} from '@/api/ratePlan';
// import {rateTypeApi, RateTypeResponse} from '@/api/rateType';
// import {rateCategoryApi, RateCategoryResponse} from '@/api/rateCategory';
// import {rateClassApi, RateClassResponse} from '@/api/rateClass';
// import {CreateRateTierRequest, rateTierApi, RateTierResponse} from '@/api/rateTier';
// import {
//     COMPONENT_TYPES,
//     CreateRatePackageComponentRequest,
//     ratePackageComponentApi,
//     RatePackageComponentResponse
// } from '@/api/ratePackageComponent';
// import {toast} from 'sonner';
// import {cn} from '@/lib/utils';
//
// // Extended schema with all fields
// const ratePlanSchema = z.object({
//   // Basic Information
//   code: z.string().min(1, 'Rate code is required').max(50),
//   name: z.string().min(1, 'Rate name is required').max(200),
//   description: z.string().max(1000).optional(),
//   rateTypeId: z.number().min(1, 'Rate type is required'),
//
//   // Classification
//   rateCategoryId: z.number().optional(),
//   rateClassId: z.number().optional(),
//
//   // Settings
//   isDefault: z.boolean().optional(),
//   isPublic: z.boolean().optional(),
//   isPackage: z.boolean().optional(),
//
//   // Restrictions
//   cancellationPolicyId: z.number().optional(),
//   minAdvanceBookingDays: z.number().int().min(0).optional(),
//   maxAdvanceBookingDays: z.number().int().min(0).optional(),
//   minStayNights: z.number().int().min(1).optional(),
//   maxStayNights: z.number().int().min(1).optional(),
//   requiresGuarantee: z.boolean().optional(),
//   nonRefundable: z.boolean().optional(),
//
//   // Validity
//   applicableDays: z.array(z.string()).optional(),
//   validFrom: z.string().optional(),
//   validTo: z.string().optional(),
//
//   // Oracle OPERA fields
//   rateCode: z.string().max(50).optional(),
//   marketCode: z.string().max(50).optional(),
//   sourceCode: z.string().max(50).optional(),
//   channelCode: z.string().max(50).optional(),
//   rateTier: z.number().int().min(0).optional(),
//   commissionable: z.boolean().optional(),
//   commissionRate: z.number().min(0).max(100).optional(),
//   taxInclusive: z.boolean().optional(),
//   breakfastIncluded: z.boolean().optional(),
//   mealPlanCode: z.string().max(50).optional(),
//
//   // Dynamic Rate Settings
//   baseRatePlanId: z.number().optional(),
//   isDynamic: z.boolean().optional(),
//   dynamicAdjustmentType: z.string().max(50).optional(),
//   dynamicAdjustmentValue: z.number().optional(),
// });
//
// type RatePlanFormValues = z.infer<typeof ratePlanSchema>;
//
// interface RatePlanFormEnhancedProps {
//   ratePlan?: RatePlanResponse;
//   onSuccess?: (ratePlan: RatePlanResponse) => void;
//   onCancel?: () => void;
// }
//
// const DAYS_OF_WEEK = [
//   { value: 'MONDAY', label: 'Mon', short: 'M' },
//   { value: 'TUESDAY', label: 'Tue', short: 'T' },
//   { value: 'WEDNESDAY', label: 'Wed', short: 'W' },
//   { value: 'THURSDAY', label: 'Thu', short: 'T' },
//   { value: 'FRIDAY', label: 'Fri', short: 'F' },
//   { value: 'SATURDAY', label: 'Sat', short: 'S' },
//   { value: 'SUNDAY', label: 'Sun', short: 'S' },
// ];
//
// const ADJUSTMENT_TYPES = [
//   { value: 'PERCENTAGE', label: 'Percentage' },
//   { value: 'FIXED', label: 'Fixed Amount' },
//   { value: 'MULTIPLIER', label: 'Multiplier' },
// ];
//
// const MEAL_PLAN_CODES = [
//   { value: 'EP', label: 'EP - European Plan (Room Only)' },
//   { value: 'CP', label: 'CP - Continental Plan (Breakfast)' },
//   { value: 'MAP', label: 'MAP - Modified American Plan (Breakfast + Dinner)' },
//   { value: 'AP', label: 'AP - American Plan (All Meals)' },
//   { value: 'BB', label: 'BB - Bed & Breakfast' },
//   { value: 'FB', label: 'FB - Full Board' },
//   { value: 'HB', label: 'HB - Half Board' },
//   { value: 'AI', label: 'AI - All Inclusive' },
// ];
//
// const TABS = [
//   { value: 'basic', label: 'Basic', icon: FileText },
//   { value: 'classification', label: 'Classification', icon: Tag },
//   { value: 'restrictions', label: 'Restrictions', icon: Shield },
//   { value: 'opera', label: 'OPERA Fields', icon: Building2 },
//   { value: 'dynamic', label: 'Dynamic', icon: Sparkles },
//   { value: 'tiers', label: 'Rate Tiers', icon: Layers },
//   { value: 'packages', label: 'Packages', icon: Package },
//   { value: 'validity', label: 'Validity', icon: CalendarDays },
// ];
//
// export const RatePlanFormEnhanced: React.FC<RatePlanFormEnhancedProps> = ({ ratePlan, onSuccess, onCancel }) => {
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);
//   const [activeTab, setActiveTab] = useState('basic');
//
//   // Reference data
//   const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
//   const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([]);
//   const [rateClasses, setRateClasses] = useState<RateClassResponse[]>([]);
//   const [baseRatePlans, setBaseRatePlans] = useState<RatePlanResponse[]>([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
//
//   // Nested data (for existing rate plans)
//   const [rateTiers, setRateTiers] = useState<RateTierResponse[]>([]);
//   const [packageComponents, setPackageComponents] = useState<RatePackageComponentResponse[]>([]);
//
//   // Inline editing for tiers and components
//   const [newTier, setNewTier] = useState<Partial<CreateRateTierRequest>>({});
//   const [newComponent, setNewComponent] = useState<Partial<CreateRatePackageComponentRequest>>({});
//   const [editingTierId, setEditingTierId] = useState<number | null>(null);
//   const [editingComponentId, setEditingComponentId] = useState<number | null>(null);
//
//   const isEditMode = !!ratePlan;
//
//   const form = useForm<RatePlanFormValues>({
//     resolver: zodResolver(ratePlanSchema),
//     defaultValues: {
//       code: '',
//       name: '',
//       description: '',
//       rateTypeId: 0,
//       isDefault: false,
//       isPublic: true,
//       isPackage: false,
//       requiresGuarantee: false,
//       nonRefundable: false,
//       applicableDays: [],
//       commissionable: false,
//       taxInclusive: false,
//       breakfastIncluded: false,
//       isDynamic: false,
//     },
//   });
//
//   useEffect(() => {
//     loadInitialData();
//   }, []);
//
//   useEffect(() => {
//     if (ratePlan) {
//       resetFormWithRatePlan(ratePlan);
//       loadNestedData(ratePlan.id);
//     }
//   }, [ratePlan]);
//
//   const resetFormWithRatePlan = (rp: RatePlanResponse) => {
//     form.reset({
//       code: rp.code || '',
//       name: rp.name || '',
//       description: rp.description || '',
//       rateTypeId: rp.rateType?.id || 0,
//       rateCategoryId: rp.rateCategoryId,
//       rateClassId: rp.rateClassId,
//       isDefault: rp.isDefault || false,
//       isPublic: rp.isPublic ?? true,
//       isPackage: rp.isPackage || false,
//       requiresGuarantee: rp.requiresGuarantee || false,
//       nonRefundable: rp.nonRefundable || false,
//       applicableDays: rp.applicableDays || [],
//       validFrom: rp.validFrom || '',
//       validTo: rp.validTo || '',
//       minStayNights: rp.minStayNights,
//       maxStayNights: rp.maxStayNights,
//       minAdvanceBookingDays: rp.minAdvanceBookingDays,
//       maxAdvanceBookingDays: rp.maxAdvanceBookingDays,
//       rateCode: rp.rateCode || '',
//       marketCode: rp.marketCode || '',
//       sourceCode: rp.sourceCode || '',
//       channelCode: rp.channelCode || '',
//       rateTier: rp.rateTier,
//       commissionable: rp.commissionable || false,
//       commissionRate: rp.commissionRate,
//       taxInclusive: rp.taxInclusive || false,
//       breakfastIncluded: rp.breakfastIncluded || false,
//       mealPlanCode: rp.mealPlanCode || '',
//       baseRatePlanId: rp.baseRatePlanId,
//       isDynamic: rp.isDynamic || false,
//       dynamicAdjustmentType: rp.dynamicAdjustmentType || '',
//       dynamicAdjustmentValue: rp.dynamicAdjustmentValue,
//     });
//
//     if (rp.rateCategoryId) {
//       setSelectedCategoryId(rp.rateCategoryId);
//       loadRateClasses(rp.rateCategoryId);
//     }
//   };
//
//   const loadInitialData = async () => {
//     try {
//       setLoadingData(true);
//       const [rateTypesData, rateCategoriesData, ratePlansData] = await Promise.all([
//         rateTypeApi.getAllRateTypes(0, 1000),
//         rateCategoryApi.getAllRateCategories(0, 1000),
//         ratePlanApi.getAllRatePlans(0, 1000)
//       ]);
//
//       setRateTypes(rateTypesData.content);
//       setRateCategories(rateCategoriesData.content);
//
//       const availableRatePlans = isEditMode && ratePlan
//         ? ratePlansData.content.filter(rp => rp.id !== ratePlan.id)
//         : ratePlansData.content;
//       setBaseRatePlans(availableRatePlans);
//     } catch (err: any) {
//       console.error('Failed to load data', err);
//       toast.error('Failed to load reference data');
//     } finally {
//       setLoadingData(false);
//     }
//   };
//
//   const loadRateClasses = async (categoryId: number) => {
//     try {
//       const rateClassesData = await rateClassApi.getAllRateClasses(0, 1000, { rateCategoryId: categoryId });
//       setRateClasses(rateClassesData.content);
//     } catch (err) {
//       console.error('Failed to load rate classes', err);
//     }
//   };
//
//   const loadNestedData = async (ratePlanId: number) => {
//     try {
//       const [tiersData, componentsData] = await Promise.all([
//         rateTierApi.getAllRateTiers(0, 1000, { ratePlanId }),
//         ratePackageComponentApi.getAllRatePackageComponents(0, 1000, { ratePlanId })
//       ]);
//       setRateTiers(tiersData.content.sort((a, b) => (a.priority || 0) - (b.priority || 0)));
//       setPackageComponents(componentsData.content);
//     } catch (err) {
//       console.error('Failed to load nested data', err);
//     }
//   };
//
//   const handleCategoryChange = async (categoryId: number | undefined) => {
//     setSelectedCategoryId(categoryId);
//     form.setValue('rateClassId', undefined);
//
//     if (categoryId) {
//       await loadRateClasses(categoryId);
//     } else {
//       setRateClasses([]);
//     }
//   };
//
//   const toggleDay = (day: string) => {
//     const currentDays = form.watch('applicableDays') || [];
//     if (currentDays.includes(day)) {
//       form.setValue('applicableDays', currentDays.filter(d => d !== day));
//     } else {
//       form.setValue('applicableDays', [...currentDays, day]);
//     }
//   };
//
//   const selectAllDays = () => {
//     const allDays = DAYS_OF_WEEK.map(d => d.value);
//     form.setValue('applicableDays', allDays);
//   };
//
//   const clearAllDays = () => {
//     form.setValue('applicableDays', []);
//   };
//
//   // Rate Tier Management
//   const handleAddTier = async () => {
//     if (!ratePlan || !newTier.minNights || !newTier.adjustmentType || newTier.adjustmentValue === undefined) {
//       toast.error('Please fill all required tier fields');
//       return;
//     }
//
//     try {
//       const tierData: CreateRateTierRequest = {
//         ratePlanId: ratePlan.id,
//         minNights: newTier.minNights,
//         maxNights: newTier.maxNights,
//         adjustmentType: newTier.adjustmentType,
//         adjustmentValue: newTier.adjustmentValue,
//         priority: rateTiers.length + 1,
//       };
//
//       await rateTierApi.createRateTier(tierData);
//       toast.success('Rate tier added');
//       setNewTier({});
//       loadNestedData(ratePlan.id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to add tier');
//     }
//   };
//
//   const handleDeleteTier = async (tierId: number) => {
//     if (!window.confirm('Are you sure you want to delete this tier?')) return;
//
//     try {
//       await rateTierApi.deleteRateTier(tierId);
//       toast.success('Rate tier deleted');
//       if (ratePlan) loadNestedData(ratePlan.id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to delete tier');
//     }
//   };
//
//   // Package Component Management
//   const handleAddComponent = async () => {
//     if (!ratePlan || !newComponent.componentType || !newComponent.componentName) {
//       toast.error('Please fill all required component fields');
//       return;
//     }
//
//     try {
//       const componentData: CreateRatePackageComponentRequest = {
//         ratePlanId: ratePlan.id,
//         componentType: newComponent.componentType,
//         componentCode: newComponent.componentCode,
//         componentName: newComponent.componentName,
//         quantity: newComponent.quantity || 1,
//         unitPrice: newComponent.unitPrice,
//         isIncluded: newComponent.isIncluded ?? true,
//         description: newComponent.description,
//       };
//
//       await ratePackageComponentApi.createRatePackageComponent(componentData);
//       toast.success('Package component added');
//       setNewComponent({});
//       loadNestedData(ratePlan.id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to add component');
//     }
//   };
//
//   const handleDeleteComponent = async (componentId: number) => {
//     if (!window.confirm('Are you sure you want to delete this component?')) return;
//
//     try {
//       await ratePackageComponentApi.deleteRatePackageComponent(componentId);
//       toast.success('Package component deleted');
//       if (ratePlan) loadNestedData(ratePlan.id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to delete component');
//     }
//   };
//
//   const onSubmit = async (data: RatePlanFormValues) => {
//     setIsLoading(true);
//     setError(null);
//
//     try {
//       const payload: RatePlanRequest | UpdateRatePlanRequest = {
//         code: data.code,
//         rateTypeId: data.rateTypeId,
//         name: data.name,
//         description: data.description || undefined,
//         rateCategoryId: data.rateCategoryId,
//         rateClassId: data.rateClassId,
//         isDefault: data.isDefault,
//         isPublic: data.isPublic,
//         isPackage: data.isPackage,
//         requiresGuarantee: data.requiresGuarantee,
//         nonRefundable: data.nonRefundable,
//         applicableDays: data.applicableDays?.length ? data.applicableDays : undefined,
//         validFrom: data.validFrom || undefined,
//         validTo: data.validTo || undefined,
//         minStayNights: data.minStayNights,
//         maxStayNights: data.maxStayNights,
//         minAdvanceBookingDays: data.minAdvanceBookingDays,
//         maxAdvanceBookingDays: data.maxAdvanceBookingDays,
//         rateCode: data.rateCode || undefined,
//         marketCode: data.marketCode || undefined,
//         sourceCode: data.sourceCode || undefined,
//         channelCode: data.channelCode || undefined,
//         rateTier: data.rateTier,
//         commissionable: data.commissionable,
//         commissionRate: data.commissionRate,
//         taxInclusive: data.taxInclusive,
//         breakfastIncluded: data.breakfastIncluded,
//         mealPlanCode: data.mealPlanCode || undefined,
//         baseRatePlanId: data.baseRatePlanId,
//         isDynamic: data.isDynamic,
//         dynamicAdjustmentType: data.dynamicAdjustmentType || undefined,
//         dynamicAdjustmentValue: data.dynamicAdjustmentValue,
//       };
//
//       let response: RatePlanResponse;
//       if (isEditMode && ratePlan) {
//         response = await ratePlanApi.updateRatePlan(ratePlan.id, payload as UpdateRatePlanRequest);
//         toast.success('Rate plan updated successfully');
//       } else {
//         response = await ratePlanApi.createRatePlan(payload as RatePlanRequest);
//         toast.success('Rate plan created successfully');
//       }
//
//       onSuccess?.(response);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} rate plan`);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   // Tab completion indicators
//   const getTabStatus = (tabValue: string) => {
//     switch (tabValue) {
//       case 'basic':
//         return form.watch('code') && form.watch('name') && form.watch('rateTypeId');
//       case 'classification':
//         return form.watch('rateCategoryId') || form.watch('rateClassId');
//       case 'restrictions':
//         return form.watch('minStayNights') || form.watch('maxStayNights') || form.watch('requiresGuarantee') || form.watch('nonRefundable');
//       case 'opera':
//         return form.watch('marketCode') || form.watch('sourceCode') || form.watch('channelCode');
//       case 'dynamic':
//         return form.watch('isDynamic');
//       case 'tiers':
//         return rateTiers.length > 0;
//       case 'packages':
//         return packageComponents.length > 0;
//       case 'validity':
//         return form.watch('validFrom') || form.watch('validTo') || (form.watch('applicableDays')?.length || 0) > 0;
//       default:
//         return false;
//     }
//   };
//
//   if (loadingData) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="animate-pulse text-muted-foreground">Loading form data...</div>
//       </div>
//     );
//   }
//
//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         {error && (
//           <Alert variant="destructive">
//             <AlertTriangle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
//
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           {/* Custom Tab Navigation */}
//           <ScrollArea className="w-full">
//             <TabsList className="inline-flex h-auto p-1 gap-1 bg-muted/50 rounded-lg">
//               {TABS.map((tab) => {
//                 const Icon = tab.icon;
//                 const isComplete = getTabStatus(tab.value);
//                 return (
//                   <TabsTrigger
//                     key={tab.value}
//                     value={tab.value}
//                     className={cn(
//                       "flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm",
//                       "transition-all duration-200"
//                     )}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="hidden sm:inline">{tab.label}</span>
//                     {isComplete && (
//                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
//                     )}
//                   </TabsTrigger>
//                 );
//               })}
//             </TabsList>
//           </ScrollArea>
//
//           {/* Tab 1: Basic Information */}
//           <TabsContent value="basic" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   Basic Information
//                 </CardTitle>
//                 <CardDescription>
//                   Core rate plan identification and settings
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="code"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Code *</FormLabel>
//                         <FormControl>
//                           <Input placeholder="e.g., BAR_2024" {...field} className="font-mono uppercase" />
//                         </FormControl>
//                         <FormDescription>Unique identifier for this rate plan</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="rateTypeId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Type *</FormLabel>
//                         <Select
//                           onValueChange={(value) => field.onChange(parseInt(value, 10))}
//                           value={field.value?.toString() || ''}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select rate type" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {rateTypes.map((rt) => (
//                               <SelectItem key={rt.id} value={rt.id.toString()}>
//                                 {rt.name} ({rt.code})
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Rate Name *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="e.g., Best Available Rate 2024" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder="Detailed description of this rate plan..."
//                           rows={4}
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//
//                 <Separator />
//
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="isDefault"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Default</FormLabel>
//                           <FormDescription className="text-xs">
//                             Primary rate
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="isPublic"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Public</FormLabel>
//                           <FormDescription className="text-xs">
//                             Visible online
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="isPackage"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Package</FormLabel>
//                           <FormDescription className="text-xs">
//                             Bundled services
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="taxInclusive"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Tax Incl.</FormLabel>
//                           <FormDescription className="text-xs">
//                             Tax included
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="breakfastIncluded"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Breakfast</FormLabel>
//                           <FormDescription className="text-xs">
//                             Meal included
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 2: Classification */}
//           <TabsContent value="classification" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Tag className="h-5 w-5" />
//                   Classification
//                 </CardTitle>
//                 <CardDescription>
//                   Organize rate plans by category and class
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="rateCategoryId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Category</FormLabel>
//                         <Select
//                           onValueChange={(value) => {
//                             const categoryId = value ? parseInt(value, 10) : undefined;
//                             field.onChange(categoryId);
//                             handleCategoryChange(categoryId);
//                           }}
//                           value={field.value?.toString() || ''}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select category" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {rateCategories.map((rc) => (
//                               <SelectItem key={rc.id} value={rc.id.toString()}>
//                                 {rc.name} ({rc.code})
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormDescription>Primary categorization for reporting</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="rateClassId"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Class</FormLabel>
//                         <Select
//                           onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
//                           value={field.value?.toString() || ''}
//                           disabled={!selectedCategoryId}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder={selectedCategoryId ? "Select class" : "Select category first"} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {rateClasses.map((rc) => (
//                               <SelectItem key={rc.id} value={rc.id.toString()}>
//                                 {rc.name} ({rc.code})
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormDescription>Sub-classification within category</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 {/* Visual classification path */}
//                 {(form.watch('rateCategoryId') || form.watch('rateClassId')) && (
//                   <div className="p-4 rounded-lg bg-muted/50 border">
//                     <div className="text-sm text-muted-foreground mb-2">Classification Path:</div>
//                     <div className="flex items-center gap-2">
//                       {form.watch('rateCategoryId') && (
//                         <>
//                           <Badge variant="secondary">
//                             {rateCategories.find(c => c.id === form.watch('rateCategoryId'))?.name}
//                           </Badge>
//                           {form.watch('rateClassId') && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
//                         </>
//                       )}
//                       {form.watch('rateClassId') && (
//                         <Badge variant="outline">
//                           {rateClasses.find(c => c.id === form.watch('rateClassId'))?.name}
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 3: Restrictions & Policies */}
//           <TabsContent value="restrictions" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Shield className="h-5 w-5" />
//                   Restrictions & Policies
//                 </CardTitle>
//                 <CardDescription>
//                   Booking restrictions and policy settings
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="minStayNights"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Min Stay (Nights)</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min={1}
//                             placeholder="1"
//                             {...field}
//                             value={field.value || ''}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="maxStayNights"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Max Stay (Nights)</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min={1}
//                             placeholder="30"
//                             {...field}
//                             value={field.value || ''}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="minAdvanceBookingDays"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Min Advance (Days)</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min={0}
//                             placeholder="0"
//                             {...field}
//                             value={field.value || ''}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="maxAdvanceBookingDays"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Max Advance (Days)</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min={0}
//                             placeholder="365"
//                             {...field}
//                             value={field.value || ''}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="requiresGuarantee"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Requires Guarantee</FormLabel>
//                           <FormDescription>
//                             Credit card or payment guarantee required
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="nonRefundable"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Non-Refundable</FormLabel>
//                           <FormDescription>
//                             No cancellation or refund allowed
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 4: Oracle OPERA Fields */}
//           <TabsContent value="opera" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Building2 className="h-5 w-5" />
//                   Oracle OPERA Fields
//                 </CardTitle>
//                 <CardDescription>
//                   Standard OPERA PMS integration fields
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="rateCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Code (OPERA)</FormLabel>
//                         <FormControl>
//                           <Input placeholder="BAR" {...field} className="font-mono uppercase" />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="marketCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Market Code</FormLabel>
//                         <FormControl>
//                           <Input placeholder="LEI" {...field} className="font-mono uppercase" />
//                         </FormControl>
//                         <FormDescription>e.g., LEI, COR, GRP</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="sourceCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Source Code</FormLabel>
//                         <FormControl>
//                           <Input placeholder="WEB" {...field} className="font-mono uppercase" />
//                         </FormControl>
//                         <FormDescription>e.g., WEB, TA, GDS</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="channelCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Channel Code</FormLabel>
//                         <FormControl>
//                           <Input placeholder="OWS" {...field} className="font-mono uppercase" />
//                         </FormControl>
//                         <FormDescription>e.g., OWS, GDS, OTA</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="mealPlanCode"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Meal Plan</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value || ''}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select meal plan" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {MEAL_PLAN_CODES.map((mp) => (
//                               <SelectItem key={mp.value} value={mp.value}>
//                                 {mp.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="rateTier"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Rate Tier Level</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             min={0}
//                             placeholder="1"
//                             {...field}
//                             value={field.value || ''}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
//                           />
//                         </FormControl>
//                         <FormDescription>Tier priority (lower = higher priority)</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="commissionable"
//                     render={({ field }) => (
//                       <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                         <div className="space-y-0.5">
//                           <FormLabel className="text-base">Commissionable</FormLabel>
//                           <FormDescription>
//                             Rate pays travel agent commission
//                           </FormDescription>
//                         </div>
//                         <FormControl>
//                           <Switch checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//
//                   {form.watch('commissionable') && (
//                     <FormField
//                       control={form.control}
//                       name="commissionRate"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Commission Rate (%)</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               min={0}
//                               max={100}
//                               step={0.1}
//                               placeholder="10"
//                               {...field}
//                               value={field.value || ''}
//                               onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 5: Dynamic Rate Settings */}
//           <TabsContent value="dynamic" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Sparkles className="h-5 w-5" />
//                   Dynamic Rate Settings
//                 </CardTitle>
//                 <CardDescription>
//                   Configure dynamic pricing based on base rates
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <FormField
//                   control={form.control}
//                   name="isDynamic"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                       <div className="space-y-0.5">
//                         <FormLabel className="text-base">Enable Dynamic Pricing</FormLabel>
//                         <FormDescription>
//                           Calculate rates dynamically based on a base rate plan
//                         </FormDescription>
//                       </div>
//                       <FormControl>
//                         <Switch checked={field.value} onCheckedChange={field.onChange} />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//
//                 {form.watch('isDynamic') && (
//                   <>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                       <FormField
//                         control={form.control}
//                         name="baseRatePlanId"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Base Rate Plan *</FormLabel>
//                             <Select
//                               onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
//                               value={field.value?.toString() || ''}
//                             >
//                               <FormControl>
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select base rate" />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 {baseRatePlans.map((rp) => (
//                                   <SelectItem key={rp.id} value={rp.id.toString()}>
//                                     {rp.name} ({rp.code})
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                             <FormDescription>Rate plan to derive pricing from</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//
//                       <FormField
//                         control={form.control}
//                         name="dynamicAdjustmentType"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Adjustment Type *</FormLabel>
//                             <Select onValueChange={field.onChange} value={field.value || ''}>
//                               <FormControl>
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select type" />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 {ADJUSTMENT_TYPES.map((at) => (
//                                   <SelectItem key={at.value} value={at.value}>
//                                     {at.label}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//
//                       <FormField
//                         control={form.control}
//                         name="dynamicAdjustmentValue"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Adjustment Value *</FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 step={0.01}
//                                 placeholder={form.watch('dynamicAdjustmentType') === 'PERCENTAGE' ? '-10' : '50'}
//                                 {...field}
//                                 value={field.value ?? ''}
//                                 onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
//                               />
//                             </FormControl>
//                             <FormDescription>
//                               {form.watch('dynamicAdjustmentType') === 'PERCENTAGE' && 'Negative for discount, positive for increase'}
//                               {form.watch('dynamicAdjustmentType') === 'FIXED' && 'Amount to add/subtract from base rate'}
//                               {form.watch('dynamicAdjustmentType') === 'MULTIPLIER' && 'Factor to multiply base rate by'}
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//
//                     {/* Preview calculation */}
//                     {form.watch('baseRatePlanId') && form.watch('dynamicAdjustmentValue') !== undefined && (
//                       <div className="p-4 rounded-lg bg-muted/50 border">
//                         <div className="text-sm text-muted-foreground mb-2">Example Calculation:</div>
//                         <div className="font-mono text-sm">
//                           Base Rate: $100 → Calculated: $
//                           {(() => {
//                             const value = form.watch('dynamicAdjustmentValue') || 0;
//                             const type = form.watch('dynamicAdjustmentType');
//                             if (type === 'PERCENTAGE') return (100 * (1 + value / 100)).toFixed(2);
//                             if (type === 'FIXED') return (100 + value).toFixed(2);
//                             if (type === 'MULTIPLIER') return (100 * value).toFixed(2);
//                             return '100.00';
//                           })()}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 6: Rate Tiers */}
//           <TabsContent value="tiers" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Layers className="h-5 w-5" />
//                   Rate Tiers
//                 </CardTitle>
//                 <CardDescription>
//                   Length-of-stay based pricing tiers
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {!isEditMode ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     <Info className="h-12 w-12 mx-auto mb-4 opacity-30" />
//                     <p>Save the rate plan first to add rate tiers</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {/* Existing tiers */}
//                     {rateTiers.length > 0 && (
//                       <div className="space-y-2">
//                         {rateTiers.map((tier, index) => (
//                           <div
//                             key={tier.id}
//                             className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
//                           >
//                             <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
//                             <Badge variant="outline" className="font-mono">
//                               #{tier.priority}
//                             </Badge>
//                             <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
//                               <div>
//                                 <span className="text-muted-foreground">Nights:</span>{' '}
//                                 <span className="font-medium">{tier.minNights}{tier.maxNights ? `-${tier.maxNights}` : '+'}</span>
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">Type:</span>{' '}
//                                 <Badge variant="secondary" className="text-xs">{tier.adjustmentType}</Badge>
//                               </div>
//                               <div>
//                                 <span className="text-muted-foreground">Value:</span>{' '}
//                                 <span className="font-medium">
//                                   {tier.adjustmentType === 'PERCENTAGE' ? `${tier.adjustmentValue}%` :
//                                    tier.adjustmentType === 'MULTIPLIER' ? `×${tier.adjustmentValue}` :
//                                    `$${tier.adjustmentValue}`}
//                                 </span>
//                               </div>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleDeleteTier(tier.id)}
//                               className="h-8 w-8 text-destructive hover:text-destructive"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//
//                     {/* Add new tier form */}
//                     <div className="p-4 rounded-lg border border-dashed bg-muted/20">
//                       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
//                         <div>
//                           <Label>Min Nights *</Label>
//                           <Input
//                             type="number"
//                             min={1}
//                             value={newTier.minNights || ''}
//                             onChange={(e) => setNewTier({ ...newTier, minNights: parseInt(e.target.value) || undefined })}
//                             placeholder="1"
//                           />
//                         </div>
//                         <div>
//                           <Label>Max Nights</Label>
//                           <Input
//                             type="number"
//                             min={1}
//                             value={newTier.maxNights || ''}
//                             onChange={(e) => setNewTier({ ...newTier, maxNights: parseInt(e.target.value) || undefined })}
//                             placeholder="Optional"
//                           />
//                         </div>
//                         <div>
//                           <Label>Adjustment Type *</Label>
//                           <Select
//                             value={newTier.adjustmentType || ''}
//                             onValueChange={(v) => setNewTier({ ...newTier, adjustmentType: v })}
//                           >
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {ADJUSTMENT_TYPES.map((at) => (
//                                 <SelectItem key={at.value} value={at.value}>{at.label}</SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div>
//                           <Label>Value *</Label>
//                           <Input
//                             type="number"
//                             step={0.01}
//                             value={newTier.adjustmentValue ?? ''}
//                             onChange={(e) => setNewTier({ ...newTier, adjustmentValue: parseFloat(e.target.value) })}
//                             placeholder="0"
//                           />
//                         </div>
//                         <Button type="button" onClick={handleAddTier}>
//                           <Plus className="h-4 w-4 mr-2" />
//                           Add Tier
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 7: Package Components */}
//           <TabsContent value="packages" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Package className="h-5 w-5" />
//                   Package Components
//                 </CardTitle>
//                 <CardDescription>
//                   Services and amenities included in this rate package
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {!isEditMode ? (
//                   <div className="text-center py-8 text-muted-foreground">
//                     <Info className="h-12 w-12 mx-auto mb-4 opacity-30" />
//                     <p>Save the rate plan first to add package components</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {/* Existing components */}
//                     {packageComponents.length > 0 && (
//                       <div className="space-y-2">
//                         {packageComponents.map((component) => (
//                           <div
//                             key={component.id}
//                             className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
//                           >
//                             <Badge variant={component.isIncluded ? 'default' : 'secondary'}>
//                               {component.isIncluded ? 'Included' : 'Extra'}
//                             </Badge>
//                             <Badge variant="outline">{component.componentType}</Badge>
//                             <div className="flex-1">
//                               <div className="font-medium">{component.componentName}</div>
//                               {component.description && (
//                                 <div className="text-xs text-muted-foreground">{component.description}</div>
//                               )}
//                             </div>
//                             <div className="text-sm">
//                               <span className="text-muted-foreground">Qty:</span>{' '}
//                               <span className="font-medium">{component.quantity}</span>
//                             </div>
//                             {component.unitPrice !== undefined && (
//                               <div className="text-sm">
//                                 <span className="text-muted-foreground">Price:</span>{' '}
//                                 <span className="font-medium">${component.unitPrice}</span>
//                               </div>
//                             )}
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleDeleteComponent(component.id)}
//                               className="h-8 w-8 text-destructive hover:text-destructive"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//
//                     {/* Add new component form */}
//                     <div className="p-4 rounded-lg border border-dashed bg-muted/20">
//                       <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
//                         <div>
//                           <Label>Type *</Label>
//                           <Select
//                             value={newComponent.componentType || ''}
//                             onValueChange={(v) => setNewComponent({ ...newComponent, componentType: v })}
//                           >
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {COMPONENT_TYPES.map((ct) => (
//                                 <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div className="md:col-span-2">
//                           <Label>Name *</Label>
//                           <Input
//                             value={newComponent.componentName || ''}
//                             onChange={(e) => setNewComponent({ ...newComponent, componentName: e.target.value })}
//                             placeholder="e.g., Breakfast Buffet"
//                           />
//                         </div>
//                         <div>
//                           <Label>Quantity</Label>
//                           <Input
//                             type="number"
//                             min={1}
//                             value={newComponent.quantity ?? 1}
//                             onChange={(e) => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 1 })}
//                           />
//                         </div>
//                         <div>
//                           <Label>Unit Price</Label>
//                           <Input
//                             type="number"
//                             step={0.01}
//                             value={newComponent.unitPrice ?? ''}
//                             onChange={(e) => setNewComponent({ ...newComponent, unitPrice: parseFloat(e.target.value) })}
//                             placeholder="Optional"
//                           />
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <div className="flex items-center gap-2 flex-1">
//                             <Checkbox
//                               id="isIncluded"
//                               checked={newComponent.isIncluded ?? true}
//                               onCheckedChange={(checked) => setNewComponent({ ...newComponent, isIncluded: !!checked })}
//                             />
//                             <Label htmlFor="isIncluded" className="text-sm">Included</Label>
//                           </div>
//                           <Button type="button" onClick={handleAddComponent}>
//                             <Plus className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//
//           {/* Tab 8: Validity & Applicable Days */}
//           <TabsContent value="validity" className="mt-6 space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CalendarDays className="h-5 w-5" />
//                   Validity Period & Applicable Days
//                 </CardTitle>
//                 <CardDescription>
//                   Define when this rate plan is valid and which days it applies to
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="validFrom"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Valid From</FormLabel>
//                         <FormControl>
//                           <Input type="date" {...field} />
//                         </FormControl>
//                         <FormDescription>Start date for rate plan validity</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//
//                   <FormField
//                     control={form.control}
//                     name="validTo"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Valid To</FormLabel>
//                         <FormControl>
//                           <Input type="date" {...field} />
//                         </FormControl>
//                         <FormDescription>End date for rate plan validity</FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//
//                 <Separator />
//
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <FormLabel className="text-base">Applicable Days</FormLabel>
//                     <div className="flex gap-2">
//                       <Button type="button" variant="outline" size="sm" onClick={selectAllDays}>
//                         Select All
//                       </Button>
//                       <Button type="button" variant="outline" size="sm" onClick={clearAllDays}>
//                         Clear All
//                       </Button>
//                     </div>
//                   </div>
//
//                   <div className="flex flex-wrap gap-2">
//                     {DAYS_OF_WEEK.map((day) => {
//                       const isSelected = form.watch('applicableDays')?.includes(day.value) || false;
//                       return (
//                         <Button
//                           key={day.value}
//                           type="button"
//                           variant={isSelected ? "default" : "outline"}
//                           className={cn(
//                             "h-16 w-16 flex flex-col items-center justify-center",
//                             isSelected && "bg-primary text-primary-foreground"
//                           )}
//                           onClick={() => toggleDay(day.value)}
//                         >
//                           <span className="text-lg font-bold">{day.short}</span>
//                           <span className="text-xs">{day.label}</span>
//                         </Button>
//                       );
//                     })}
//                   </div>
//
//                   {(form.watch('applicableDays')?.length || 0) === 0 && (
//                     <p className="text-sm text-muted-foreground">
//                       <Info className="h-4 w-4 inline mr-1" />
//                       No days selected means the rate applies to all days
//                     </p>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//
//         {/* Form Actions */}
//         <div className="flex items-center justify-between border-t pt-6">
//           <div className="text-sm text-muted-foreground">
//             {isEditMode ? `Editing: ${ratePlan?.name}` : 'Creating new rate plan'}
//           </div>
//           <div className="flex gap-4">
//             {onCancel && (
//               <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
//                 <X className="h-4 w-4 mr-2" />
//                 Cancel
//               </Button>
//             )}
//             <Button type="submit" disabled={isLoading}>
//               <Save className="h-4 w-4 mr-2" />
//               {isLoading ? 'Saving...' : isEditMode ? 'Update Rate Plan' : 'Create Rate Plan'}
//             </Button>
//           </div>
//         </div>
//       </form>
//     </Form>
//   );
// };
//
