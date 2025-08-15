import React, { useState } from 'react';
import { Button } from '@drawday/ui/button';
import { Input } from '@drawday/ui/input';
import { Label } from '@drawday/ui/label';
import { Alert, AlertDescription } from '@drawday/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { useAuth } from '@drawday/auth';
import { AlertCircle } from 'lucide-react';
import { syncSubscriptionFromAuth } from '../../services/subscription-sync';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      // Sync subscription data to Chrome storage after successful login
      await syncSubscriptionFromAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to DrawDay</CardTitle>
        <CardDescription>Sign in to access your spinner tools</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-sm text-muted-foreground">
            Dev account: admin@drawday.app / drawday
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
