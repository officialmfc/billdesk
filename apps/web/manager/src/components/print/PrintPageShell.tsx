"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PrintDocumentFrame } from "@/components/print/PrintDocumentFrame";

export function PrintPageShell({
  backHref,
  children,
  description,
  title,
}: {
  backHref: string;
  children: React.ReactNode;
  description: string;
  title: string;
}): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={backHref}>Back</Link>
          </Button>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>
      <div className="mx-auto max-w-6xl">
        <PrintDocumentFrame title={title}>{children}</PrintDocumentFrame>
      </div>
    </div>
  );
}
