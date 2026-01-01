import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {authApi, AuthResponse, TwoFactorLoginResponse} from '@/api/auth';
import {OtpVerificationForm} from './OtpVerificationForm';
import {Link} from 'react-router-dom';

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess: (response: AuthResponse) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const [stage, setStage] = useState<1 | 2>(1);
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleStage1Submit = async (data: LoginValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const response: TwoFactorLoginResponse = await authApi.loginStage1(data);

            if (response.status === 'REQUIRES_2FA' && response.tempToken) {
                setTempToken(response.tempToken);
                setStage(2);
            } else {
                // Direct success (no 2FA)
                // Map TwoFactorLoginResponse to AuthResponse
                const authResponse: AuthResponse = {
                    id: response.id,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: response.role,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    requiresTwoFactor: false
                };
                onSuccess(authResponse);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStage2Submit = async (code: string) => {
        if (!tempToken) {
            setError("Session expired. Please login again.");
            setStage(1);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.loginStage2({
                tempToken,
                code
            });
            onSuccess(response);
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Invalid verification code");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (stage === 2) {
        return (
            <div className="space-y-4">
                <div className="text-center text-sm text-gray-500">
                    Enter the 6-digit code sent to your email.
                </div>
                <OtpVerificationForm
                    onSubmit={handleStage2Submit}
                    isLoading={isLoading}
                    error={error}
                    onResend={() => setStage(1)} // Allow going back to retry credential
                />
                <div className="text-center mt-4">
                    <Button variant="link" onClick={() => setStage(1)}>Back to Login</Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStage1Submit)} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Password</FormLabel>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </Form>
    );
};
