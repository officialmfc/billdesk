'use client';

import { Button } from '@/components/ui/button';
import { logger } from "@/lib/logger";
import { PDFService } from '@/lib/pdf/pdf-service';
import { Download, Loader2, Printer } from 'lucide-react';
import { useState } from 'react';

interface ChalanPrintButtonProps {
  chalanId: string;
  chalanNumber: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showDownload?: boolean;
}

export function ChalanPrintButton({
  chalanId,
  chalanNumber,
  variant = 'outline',
  size = 'sm',
  showDownload = true,
}: ChalanPrintButtonProps): React.ReactElement {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    setIsPrinting(true);
    setError(null);

    try {
      await PDFService.printChalan(chalanId, chalanNumber);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to print chalan';
      setError(errorMessage);
      logger.error(err, 'Print error');

      // Show error to user
      alert(`Print failed: ${errorMessage}`);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      await PDFService.downloadChalan(chalanId, chalanNumber);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to download chalan';
      setError(errorMessage);
      logger.error(err, 'Download error');

      // Show error to user
      alert(`Download failed: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Print Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handlePrint}
        disabled={isPrinting || isDownloading}
        title="Print Chalan">
        {isPrinting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Printing...
          </>
        ) : (
          <>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </>
        )}
      </Button>

      {/* Download Button */}
      {showDownload && (
        <Button
          variant={variant}
          size={size}
          onClick={handleDownload}
          disabled={isPrinting || isDownloading}
          title="Download Chalan PDF">
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      )}
    </div>
  );
}
