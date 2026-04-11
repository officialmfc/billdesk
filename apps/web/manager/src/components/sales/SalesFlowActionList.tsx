"use client";

import { managerSaleFlowDefinitions, managerSalesHubOperationsPrompt, type ManagerSaleFlowKey } from "@mfc/manager-ui";
import { Calendar, Gavel, Store, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  onSelectFlow: (href: string) => void;
  showOperationsFooter?: boolean;
  onOpenOperations?: () => void;
};

const iconByFlow: Record<ManagerSaleFlowKey, typeof Gavel> = {
  auction: Gavel,
  direct: Store,
  batch: Users,
  floor: Zap,
};

const colorByFlow: Record<ManagerSaleFlowKey, string> = {
  auction: "text-blue-600",
  direct: "text-emerald-600",
  batch: "text-violet-600",
  floor: "text-amber-600",
};

export function SalesFlowActionList({
  onSelectFlow,
  showOperationsFooter = false,
  onOpenOperations,
}: Props): React.JSX.Element {
  return (
    <div className="space-y-3">
      {managerSaleFlowDefinitions.map((flow) => {
        const Icon = iconByFlow[flow.key];

        return (
          <button
            key={flow.key}
            type="button"
            onClick={() => onSelectFlow(flow.desktopHref)}
            className="w-full text-left"
          >
            <Card className="rounded-[24px] border-border/90 shadow-sm transition-colors hover:bg-muted/30">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8">
                  <Icon className={`h-5 w-5 ${colorByFlow[flow.key]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-semibold text-foreground">{flow.hubTitle}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{flow.hubDescription}</p>
                  <div className="mt-2 text-xs font-medium text-primary">{flow.hubMeta}</div>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}

      {showOperationsFooter ? (
        <Card className="rounded-[24px] border-border/90 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div>
              <div className="text-base font-semibold text-foreground">Need operational context first?</div>
              <p className="mt-1 text-sm text-muted-foreground">{managerSalesHubOperationsPrompt}</p>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={onOpenOperations}>
              <Calendar className="mr-2 h-4 w-4" />
              Open Bill & Chalan
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
