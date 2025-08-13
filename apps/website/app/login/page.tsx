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
import { loginSchema } from '@raffle-spinner/auth';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate input
    try {
      loginSchema.parse({ email, password, rememberMe });
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

    // Attempt login
    try {
      await login({ email, password, rememberMe });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your DrawDay account to continue
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@drawday.app"
                disabled={isLoading}
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="inline-block w-4 h-4 mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className={validationErrors.password ? 'border-red-500' : ''}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
              <div className="text-sm text-gray-500">
                Dev account: admin@drawday.app / drawday
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="ml-2 text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500">Or</span>
              </div>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}