/**
 * Registration Page
 *
 * User registration with email/password using Directus
 */

'use client';

import { useState } from 'react';
import { Button } from '@drawday/ui/button';
import { Input } from '@drawday/ui/input';
import { Label } from '@drawday/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@drawday/ui/card';
import { Alert, AlertDescription } from '@drawday/ui/alert';
import { Chrome, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@drawday/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Parse full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await register({
        email: formData.email,
        password: formData.password,
        first_name: firstName,
        last_name: lastName,
        // TODO: Store company name in a custom field or separate table
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <img src="/logo.svg" alt="DrawDay" className="w-12 h-12" />
            <span className="text-2xl font-bold">DrawDay</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
          <p className="text-gray-400">14 days free • No credit card required</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Join thousands of UK raffle companies using DrawDay</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Your Competition Company"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>14-day free trial, no credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Cancel anytime, no questions asked</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Full access to all features</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300">
                  Sign in
                </Link>
              </div>

              <div className="text-xs text-center text-gray-500">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-gray-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-gray-400">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <Chrome className="w-4 h-4" />
            <span>Chrome extension included with all plans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
