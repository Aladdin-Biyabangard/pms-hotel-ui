import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AuthLayout} from '@/components/auth/AuthLayout';
import {OtpVerificationForm} from '@/components/auth/OtpVerificationForm';
import {authApi} from '@/api/auth';
import {Link, useNavigate} from 'react-router-dom';

// Schemas
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

type EmailValues = z.infer<typeof emailSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [stage, setStage] = useState<'REQUEST' | 'VERIFY' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // 1. Request Form
  const requestForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });

  const handleRequestSubmit = async (data: EmailValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setStage('VERIFY');
      setSuccessMsg("Reset code sent to your email.");
    } catch (err: any) {
      setError("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Handler
  const handleVerifySubmit = async (verifyCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.verifyResetCode({ email, code: verifyCode });
      setCode(verifyCode);
      setStage('RESET');
      setSuccessMsg("Code verified. Please set your new password.");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset Password Form
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleResetSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        email,
        newPassword: data.password,
        retryPassword: data.passwordConfirm
      });
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render Content based on stage
  let content;

  if (stage === 'REQUEST') {
    content = (
      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(handleRequestSubmit)} className="space-y-4">
          <FormField
            control={requestForm.control}
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Code"}
          </Button>
          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </Form>
    );
  } else if (stage === 'VERIFY') {
    content = (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-500">
          Enter the code sent to {email}.
        </div>
        <OtpVerificationForm
          onSubmit={handleVerifySubmit}
          isLoading={isLoading}
          error={error}
        />
        <div className="text-center">
          <Button variant="link" onClick={() => setStage('REQUEST')}>Change Valid Email</Button>
        </div>
      </div>
    );
  } else if (stage === 'RESET') {
    content = (
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
          <FormField
            control={resetForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resetForm.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      description={stage === 'REQUEST' ? "Enter your email to receive a reset code" : "Complete the password reset process"}
    >
      {error && stage !== 'VERIFY' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMsg && !error && (
        <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}
      {content}
    </AuthLayout>
  );
};

export default ForgotPassword;
