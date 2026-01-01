import React from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {InputOTP, InputOTPGroup, InputOTPSlot} from '@/components/ui/input-otp';
import {Alert, AlertDescription} from '@/components/ui/alert';

const otpSchema = z.object({
    code: z.string().length(6, {
        message: "Your specific code should be 6 digits.",
    }),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpVerificationFormProps {
    onSubmit: (code: string) => void;
    isLoading: boolean;
    error?: string | null;
    onResend?: () => void;
    resendDisabled?: boolean; // For countdowns if implemented
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
    onSubmit,
    isLoading,
    error,
    onResend
}) => {
    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            code: "",
        },
    });

    const handleSubmit = (data: OtpFormValues) => {
        onSubmit(data.code);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                                <div className="flex justify-center">
                                    <InputOTP maxLength={6} {...field}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>

                    {onResend && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={onResend}
                            disabled={isLoading}
                        >
                            Resend Code
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
};
