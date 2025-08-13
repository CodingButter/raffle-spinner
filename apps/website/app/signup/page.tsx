'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@raffle-spinner/ui';
import { Button } from '@raffle-spinner/ui';
import { Input } from '@raffle-spinner/ui';
import { Label } from '@raffle-spinner/ui';
import { Alert, AlertDescription } from '@raffle-spinner/ui';
import { useAuth } from '@raffle-spinner/auth';
import { signupSchema } from '@raffle-spinner/auth';
import { Mail, Lock, User, Building, AlertCircle, Loader2, Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate input
    try {
      signupSchema.parse(formData);
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        if (error.path) {
          errors[error.path[0]] = error.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    // Attempt signup
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || undefined,
        acceptTerms: formData.acceptTerms,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { met: /\d/.test(formData.password), text: 'One number' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Start your free DrawDay account today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="inline-block w-4 h-4 mr-2" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  disabled={isLoading}
                  className={validationErrors.firstName ? 'border-red-500' : ''}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-500">{validationErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  disabled={isLoading}
                  className={validationErrors.lastName ? 'border-red-500' : ''}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-500">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={isLoading}
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">
                <Building className="inline-block w-4 h-4 mr-2" />
                Company Name (Optional)
              </Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your Raffle Company Ltd"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="inline-block w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                disabled={isLoading}
                className={validationErrors.password ? 'border-red-500' : ''}
              />
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center text-sm">
                      {req.met ? (
                        <Check className="w-3 h-3 mr-2 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 mr-2 rounded-full border border-gray-400" />
                      )}
                      <span className={req.met ? 'text-green-500' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
                className={validationErrors.confirmPassword ? 'border-red-500' : ''}
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="acceptTerms" className="ml-2 text-sm cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {validationErrors.acceptTerms && (
                <p className="text-sm text-red-500">{validationErrors.acceptTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.acceptTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}