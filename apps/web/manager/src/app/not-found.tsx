'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function NotFound(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-background">
      {/* Navbar */}
      <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo/mfclogo.svg"
            alt="MFC"
            width={50}
            height={40}
            className="object-contain"
            style={{ width: "auto", height: "40px" }}
          />
          <span className="text-xl font-semibold text-foreground">
            MFC Billdesk
          </span>
        </div>
        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* 404 Text */}
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-foreground">404</h1>
            <h2 className="text-3xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="default"
              className="w-full sm:w-auto"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
