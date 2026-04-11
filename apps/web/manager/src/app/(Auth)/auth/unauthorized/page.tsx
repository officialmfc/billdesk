/**
 * Unauthorized Page
 * Shown when user doesn't have required permissions
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription className="mt-2">
              You don't have permission to access the Manager Portal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              This portal is only accessible to staff members with Manager or
              Admin roles.
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">Sign in with different account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
