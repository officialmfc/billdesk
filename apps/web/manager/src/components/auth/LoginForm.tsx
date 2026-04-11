// File: apps/web/manager/src/components/auth/LoginForm.tsx
// This is the corrected login form.
// It removes all direct RPC calls and ONLY uses the `useAuth()` hook.

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@mfc/auth'; // Use the shared auth package
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { signIn } = useAuth(); // Use the signIn function from your context
  const { toast } = useToast();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the signIn function from the context
      const errorMessage = await signIn(email, password);

      // 2. The signIn function now returns an error message if it fails
      if (errorMessage) {
        console.error('Login Error:', errorMessage);
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);
      } else {
        // 3. Success! The AuthContext's navigation effect will handle the redirect.
        // We don't need to call router.push('/') here.
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        // The AuthContext will set the profile and session,
        // and its useEffect will redirect to the dashboard.
      }
    } catch (err: any) {
      // Catch any other unexpected errors
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="manager@mfc.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
}
