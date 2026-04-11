'use client';

/**
 * New Sale Dialog
 * Shows 3 options for creating different types of sales
 */

import { useRouter } from 'next/navigation';
import { managerSaleFlowDefinitions, type ManagerSaleFlowKey } from '@mfc/manager-ui';
import { Gavel, Users, ShoppingCart, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useDeviceType } from '@/hooks/useDeviceType';

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconByFlow: Record<ManagerSaleFlowKey, typeof Gavel> = {
  auction: Gavel,
  direct: ShoppingCart,
  batch: Users,
  floor: Zap,
};

const variantByFlow: Record<ManagerSaleFlowKey, "default" | "secondary" | "outline"> = {
  auction: "default",
  direct: "secondary",
  batch: "secondary",
  floor: "outline",
};

const iconWrapClassByFlow: Record<ManagerSaleFlowKey, string> = {
  auction: "bg-primary-foreground/20",
  direct: "bg-secondary-foreground/10",
  batch: "bg-secondary-foreground/10",
  floor: "bg-muted",
};

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps): React.JSX.Element {
  const router = useRouter();
  const deviceType = useDeviceType();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const content = (
    <div className="space-y-4 py-4">
      {managerSaleFlowDefinitions.map((flow) => {
        const Icon = iconByFlow[flow.key];

        return (
          <Button
            key={flow.key}
            onClick={() => handleNavigate(flow.desktopHref)}
            className="w-full h-auto flex-col items-start gap-3 p-6"
            variant={variantByFlow[flow.key]}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${iconWrapClassByFlow[flow.key]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-base">{flow.label}</p>
                <p className="text-sm opacity-80 font-normal">{flow.hubMeta}</p>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );

  // Mobile: Use Sheet (drawer from bottom)
  if (deviceType === 'mobile') {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>New Sale</SheetTitle>
            <SheetDescription>
              Choose the type of sale you want to create
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog (modal)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
          <DialogDescription>
            Choose the type of sale you want to create
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
