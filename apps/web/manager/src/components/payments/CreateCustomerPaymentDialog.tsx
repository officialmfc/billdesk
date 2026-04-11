"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@mfc/data-access";
import type { LocalDailyBill } from "@mfc/database";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Receipt, Wallet } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const formSchema = z
  .object({
    paymentMode: z.enum(["lump_sum", "single_bill"]),
    customerId: z.string().min(1, "Customer is required"),
    billId: z.string().optional(),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    paymentMethod: z.enum(["cash", "bank_transfer", "upi", "check"]),
    paymentDate: z.date(),
  })
  .superRefine((value, ctx) => {
    if (value.paymentMode === "single_bill" && !value.billId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bill is required",
        path: ["billId"],
      });
    }
  });

type PaymentMethod = z.infer<typeof formSchema>["paymentMethod"];
type PaymentMode = z.infer<typeof formSchema>["paymentMode"];
type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

interface CreateCustomerPaymentDialogProps {
  onSuccess?: () => void | Promise<void>;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  presetCustomerId?: string;
  presetCustomerName?: string;
  presetPaymentDate?: Date;
}

type SpecificPaymentRpcResult = {
  success?: boolean;
  error?: string;
};

type LumpSumPaymentRpcResult = SpecificPaymentRpcResult & {
  total_applied?: number | string;
  unapplied_amount?: number | string;
  payments_made?: unknown[];
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CreateCustomerPaymentDialog({
  onSuccess,
  triggerLabel = "Record Payment",
  triggerVariant = "default",
  triggerSize = "default",
  presetCustomerId,
  presetCustomerName,
  presetPaymentDate,
}: CreateCustomerPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const [customerName, setCustomerName] = useState(presetCustomerName ?? "");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      paymentMode: "lump_sum",
      customerId: presetCustomerId ?? "",
      billId: "",
      amount: 0,
      paymentMethod: "cash",
      paymentDate: presetPaymentDate ?? new Date(),
    },
  });

  const paymentMode = form.watch("paymentMode");
  const selectedCustomerId = form.watch("customerId");
  const selectedBillId = form.watch("billId");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (presetCustomerId) {
      form.setValue("customerId", presetCustomerId);
      setCustomerName(presetCustomerName ?? "");
    }

    if (presetPaymentDate) {
      form.setValue("paymentDate", presetPaymentDate);
    }
  }, [form, open, presetCustomerId, presetCustomerName, presetPaymentDate]);

  const { data: customerBills = [], loading: loadingBills } = useQuery<LocalDailyBill>(
    "daily_bills",
    {
      where: selectedCustomerId ? { customer_id: selectedCustomerId } : undefined,
      orderBy: { field: "bill_date", direction: "asc" },
      enabled: !!selectedCustomerId,
    }
  );

  const unpaidBills = useMemo(
    () =>
      customerBills
        .filter((bill) => bill.status !== "paid")
        .sort((a, b) => a.bill_date.localeCompare(b.bill_date)),
    [customerBills]
  );

  const customerOutstandingDue = useMemo(
    () =>
      unpaidBills.reduce(
        (sum, bill) => sum + Math.max(Number(bill.total_amount) - Number(bill.amount_paid), 0),
        0
      ),
    [unpaidBills]
  );

  const oldestDueBill = unpaidBills[0];

  const selectedBill = useMemo(
    () => unpaidBills.find((bill) => bill.id === selectedBillId),
    [selectedBillId, unpaidBills]
  );

  const selectedBillDue = selectedBill
    ? Math.max(Number(selectedBill.total_amount) - Number(selectedBill.amount_paid), 0)
    : 0;

  useEffect(() => {
    if (paymentMode !== "single_bill") {
      form.setValue("billId", "");
      return;
    }

    if (!selectedBill) {
      form.setValue("amount", 0);
      return;
    }

    form.setValue("amount", selectedBillDue);
  }, [form, paymentMode, selectedBill, selectedBillDue]);

  const resetFormState = () => {
    form.reset({
      paymentMode: "lump_sum",
      customerId: presetCustomerId ?? "",
      billId: "",
      amount: 0,
      paymentMethod: "cash",
      paymentDate: presetPaymentDate ?? new Date(),
    });
    setCustomerName(presetCustomerName ?? "");
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const maxAllowed = values.paymentMode === "single_bill" ? selectedBillDue : customerOutstandingDue;

    if (maxAllowed <= 0) {
      toast({
        variant: "destructive",
        title: "No due available",
        description:
          values.paymentMode === "single_bill"
            ? "Choose a bill that still has due before recording payment."
            : "This customer does not have any open due to collect.",
      });
      return;
    }

    if (values.paymentMode === "single_bill" && !selectedBill) {
      toast({
        variant: "destructive",
        title: "Bill required",
        description: "Choose a due bill before recording payment.",
      });
      return;
    }

    if (values.amount > maxAllowed) {
      toast({
        variant: "destructive",
        title: "Amount too high",
        description:
          values.paymentMode === "single_bill"
            ? `The selected bill only has ${formatCurrency(selectedBillDue)} due.`
            : `This customer only has ${formatCurrency(customerOutstandingDue)} due in total.`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const paymentDate = format(values.paymentDate, "yyyy-MM-dd");
      const paymentMethod = values.paymentMethod as PaymentMethod;

      if (values.paymentMode === "single_bill") {
        const { data, error } = await supabase.rpc("submit_specific_bill_payment", {
          p_daily_bill_id: values.billId,
          p_amount: values.amount,
          p_payment_method: paymentMethod,
          p_payment_date: paymentDate,
        });

        if (error) {
          throw error;
        }

        const result = (data ?? {}) as SpecificPaymentRpcResult;
        if (result.success === false) {
          throw new Error(result.error || "Failed to record payment");
        }

        toast({
          title: "Payment Success",
          description: `${formatCurrency(values.amount)} added to bill ${selectedBill?.bill_number}.`,
        });
      } else {
        const { data, error } = await supabase.rpc("submit_lump_sum_payment", {
          p_customer_id: values.customerId,
          p_total_amount: values.amount,
          p_payment_method: paymentMethod,
          p_payment_date: paymentDate,
        });

        if (error) {
          throw error;
        }

        const result = (data ?? {}) as LumpSumPaymentRpcResult;
        if (result.success === false) {
          throw new Error(result.error || "Failed to record payment");
        }

        const appliedAmount = Number(result.total_applied ?? 0);
        const unappliedAmount = Number(result.unapplied_amount ?? 0);

        if (appliedAmount <= 0) {
          console.error("[CreateCustomerPaymentDialog] Lump sum payment was not applied", {
            customerId: values.customerId,
            paymentDate,
            paymentMethod,
            requestedAmount: values.amount,
            result,
          });

          toast({
            variant: "destructive",
            title: "Payment Failed",
            description:
              "No eligible due bill was updated. If you need one specific bill, use Single Bill mode.",
          });
          return;
        }

        toast({
          title: "Payment Success",
          description:
            unappliedAmount > 0
              ? `${formatCurrency(appliedAmount)} applied oldest due first. ${formatCurrency(unappliedAmount)} left unapplied.`
              : `${formatCurrency(appliedAmount)} applied oldest due first across open bills.`,
        });
      }

      setOpen(false);
      resetFormState();
      await Promise.resolve(onSuccess?.());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to record payment";

      console.error("[CreateCustomerPaymentDialog] Payment submit failed", {
        customerId: values.customerId,
        paymentMode: values.paymentMode,
        billId: values.billId,
        paymentMethod: values.paymentMethod,
        paymentDate: format(values.paymentDate, "yyyy-MM-dd"),
        amount: values.amount,
        selectedBillDue,
        customerOutstandingDue,
        error,
      });

      toast({
        variant: "destructive",
        title: "Payment Failed",
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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Record Customer Payment</DialogTitle>
          <DialogDescription>
            Use Lump Sum to apply payment oldest due first, or switch to Single Bill to pay one bill directly.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Handling</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="grid gap-3 sm:grid-cols-2"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Label
                        htmlFor="customer-payment-lump-sum"
                        className={cn(
                          "items-start rounded-lg border p-3",
                          field.value === "lump_sum" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="lump_sum" id="customer-payment-lump-sum" />
                        <div className="space-y-1">
                          <p className="font-medium">Lump Sum</p>
                          <p className="text-xs text-muted-foreground">
                            Allocate payment oldest due first using the SQL payment function.
                          </p>
                        </div>
                      </Label>

                      <Label
                        htmlFor="customer-payment-single-bill"
                        className={cn(
                          "items-start rounded-lg border p-3",
                          field.value === "single_bill" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="single_bill" id="customer-payment-single-bill" />
                        <div className="space-y-1">
                          <p className="font-medium">Single Bill</p>
                          <p className="text-xs text-muted-foreground">
                            Choose one bill and record payment only against that bill.
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Lump Sum is the default for collections. Single Bill is for targeted adjustment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={() => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <UserAutocomplete
                      value={customerName}
                      onChange={(name: string, id: string | null) => {
                        setCustomerName(name);
                        form.setValue("customerId", id || "");
                        form.setValue("billId", "");
                        form.setValue("amount", 0);
                      }}
                      placeholder="Search customer..."
                      userType="business"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCustomerId ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    {paymentMode === "lump_sum" ? (
                      <Wallet className="h-4 w-4" />
                    ) : (
                      <Receipt className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    {paymentMode === "lump_sum" ? (
                      <>
                        <p className="font-medium">
                          Outstanding due {formatCurrency(customerOutstandingDue)}
                        </p>
                        <p className="text-muted-foreground">
                          {unpaidBills.length} open bills. Lump Sum applies payment oldest due first.
                        </p>
                        {oldestDueBill ? (
                          <p className="text-muted-foreground">
                            Oldest due {oldestDueBill.bill_number} on{" "}
                            {format(new Date(oldestDueBill.bill_date), "dd MMM yyyy")}
                          </p>
                        ) : null}
                      </>
                    ) : selectedBill ? (
                      <>
                        <p className="font-medium">{selectedBill.bill_number}</p>
                        <p className="text-muted-foreground">
                          Bill date {format(new Date(selectedBill.bill_date), "dd MMM yyyy")}
                        </p>
                        <p className="text-muted-foreground">
                          Due now {formatCurrency(selectedBillDue)} of{" "}
                          {formatCurrency(Number(selectedBill.total_amount))}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Choose a due bill</p>
                        <p className="text-muted-foreground">
                          Single Bill mode needs one open bill before you can submit payment.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {paymentMode === "single_bill" ? (
              <FormField
                control={form.control}
                name="billId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Bill</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCustomerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedCustomerId
                                ? "Select a due bill"
                                : "Select customer first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingBills ? (
                          <SelectItem value="loading" disabled>
                            Loading due bills...
                          </SelectItem>
                        ) : unpaidBills.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No due bills
                          </SelectItem>
                        ) : (
                          unpaidBills.map((bill) => {
                            const dueAmount = Math.max(
                              Number(bill.total_amount) - Number(bill.amount_paid),
                              0
                            );

                            return (
                              <SelectItem key={bill.id} value={bill.id}>
                                {bill.bill_number} • {format(new Date(bill.bill_date), "dd MMM")} •{" "}
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
                  <FormDescription>
                    {paymentMode === "lump_sum"
                      ? "Enter the total collection amount to distribute across due bills."
                      : "Enter the amount to apply to the selected bill."}
                  </FormDescription>
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
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
