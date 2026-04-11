"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { managerSaleFlowDefinitions, type ManagerSaleFlowKey } from "@mfc/manager-ui";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Gavel, Store, Users, Zap } from "lucide-react";

const iconByFlow: Record<ManagerSaleFlowKey, typeof Gavel> = {
  auction: Gavel,
  direct: Store,
  batch: Users,
  floor: Zap,
};

export function NewSaleButton(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 gap-2">
          <Plus className="h-4 w-4" />
          New Sale
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Sale Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {managerSaleFlowDefinitions.map((flow) => {
          const Icon = iconByFlow[flow.key];

          return (
            <DropdownMenuItem
              key={flow.key}
              onClick={() => handleNavigation(flow.desktopHref)}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{flow.label}</span>
                <span className="text-xs text-muted-foreground">{flow.hubMeta}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
