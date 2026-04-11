"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@mfc/data-access";
import type { LocalChalan } from "@mfc/database";
import { format } from "date-fns";
import { CalendarIcon, Loader2, ReceiptIndianRupee } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { UserAutocomplete } from "@/components/sales/auction-sale/UserAutocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  sellerId: z.string().min(1, "Seller is required"),
  chalanId: z.string().min(1, "Chalan is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "upi", "check"]),
  paymentDate: z.date(),
});

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

interface CreateSellerPaymentDialogProps {
  onSuccess?: () => void | Promise<void>;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  presetSellerId?: string;
  presetSellerName?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CreateSellerPaymentDialog({
  onSuccess,
  triggerLabel = "Record Payout",
  triggerVariant = "secondary",
  triggerSize = "default",
  presetSellerId,
  presetSellerName,
}: CreateSellerPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const [sellerName, setSellerName] = useState(presetSellerName ?? "");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      sellerId: presetSellerId ?? "",
      chalanId: "",
      amount: 0,
      paymentMethod: "bank_transfer",
      paymentDate: new Date(),
    },
  });

  const selectedSellerId = form.watch("sellerId");
  const selectedChalanId = form.watch("chalanId");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (presetSellerId) {
      form.setValue("sellerId", presetSellerId);
      setSellerName(presetSellerName ?? "");
    }
  }, [form, open, presetSellerId, presetSellerName]);

  const { data: sellerChalans = [], loading: loadingChalans } = useQuery<LocalChalan>(
    "chalans",
    {
      where: selectedSellerId ? { seller_id: selectedSellerId } : undefined,
      orderBy: { field: "chalan_date", direction: "asc" },
      enabled: !!selectedSellerId,
    }
  );

  const unpaidChalans = useMemo(
    () =>
      sellerChalans
        .filter((chalan) => chalan.status !== "paid")
        .sort((a, b) => a.chalan_date.localeCompare(b.chalan_date)),
    [sellerChalans]
  );

  const selectedChalan = useMemo(
    () => unpaidChalans.find((chalan) => chalan.id === selectedChalanId),
    [selectedChalanId, unpaidChalans]
  );

  const selectedChalanDue = selectedChalan
    ? Math.max(Number(selectedChalan.net_payable) - Number(selectedChalan.amount_paid), 0)
    : 0;

  useEffect(() => {
    if (!selectedChalan) {
      return;
    }

    form.setValue("amount", selectedChalanDue);
  }, [form, selectedChalan, selectedChalanDue]);

  const resetFormState = () => {
    form.reset({
      sellerId: presetSellerId ?? "",
      chalanId: "",
      amount: 0,
      paymentMethod: "bank_transfer",
      paymentDate: new Date(),
    });
    setSellerName(presetSellerName ?? "");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedChalan) {
      toast({
        variant: "destructive",
        title: "Chalan required",
        description: "Choose a due chalan before recording payout.",
      });
      return;
    }

    if (values.amount > selectedChalanDue) {
      toast({
        variant: "destructive",
        title: "Amount too high",
        description: `The selected chalan only has ${formatCurrency(selectedChalanDue)} pending.`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const paymentDate = format(values.paymentDate, "yyyy-MM-dd");
      const { error } = await supabase.rpc("submit_seller_payout", {
        p_chalan_id: values.chalanId,
        p_amount: values.amount,
        p_payment_method: values.paymentMethod,
        p_payment_date: paymentDate,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Payout Success",
        description: `${formatCurrency(values.amount)} added to ${selectedChalan.chalan_number}.`,
      });

      setOpen(false);
      resetFormState();
      await Promise.resolve(onSuccess?.());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to record payout";

      console.error("[CreateSellerPaymentDialog] Payout submit failed", {
        sellerId: values.sellerId,
        chalanId: values.chalanId,
        paymentMethod: values.paymentMethod,
        paymentDate: format(values.paymentDate, "yyyy-MM-dd"),
        amount: values.amount,
        selectedChalanDue,
        error,
      });

      toast({
        variant: "destructive",
        title: "Payout Failed",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetFormState();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Record Seller Payout</DialogTitle>
          <DialogDescription>
            Add payout against a specific chalan so seller balance stays correct.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sellerId"
              render={() => (
                <FormItem>
                  <FormLabel>Seller</FormLabel>
                  <FormControl>
                    <UserAutocomplete
                      value={sellerName}
                      onChange={(name: string, id: string | null) => {
                        setSellerName(name);
                        form.setValue("sellerId", id || "");
                        form.setValue("chalanId", "");
                        form.setValue("amount", 0);
                      }}
                      placeholder="Search seller..."
                      userType="vendor"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chalanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Chalan</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedSellerId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedSellerId
                              ? "Select a due chalan"
                              : "Select seller first"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingChalans ? (
                        <SelectItem value="loading" disabled>
                          Loading chalans...
                        </SelectItem>
                      ) : unpaidChalans.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No pending chalans
                        </SelectItem>
                      ) : (
                        unpaidChalans.map((chalan) => {
                          const dueAmount = Math.max(
                            Number(chalan.net_payable) - Number(chalan.amount_paid),
                            0
                          );

                          return (
                            <SelectItem key={chalan.id} value={chalan.id}>
                              {chalan.chalan_number} • {format(new Date(chalan.chalan_date), "dd MMM")} •{" "}
                              {formatCurrency(dueAmount)}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedChalan ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ReceiptIndianRupee className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedChalan.chalan_number}</p>
                    <p className="text-muted-foreground">
                      Chalan date {format(new Date(selectedChalan.chalan_date), "dd MMM yyyy")}
                    </p>
                    <p className="text-muted-foreground">
                      Due now {formatCurrency(selectedChalanDue)} of{" "}
                      {formatCurrency(Number(selectedChalan.net_payable))}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Record Payout
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
