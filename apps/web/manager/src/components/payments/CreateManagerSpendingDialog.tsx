"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

const CATEGORY_OPTIONS = [
  "tea-snacks",
  "transport",
  "loading",
  "packing",
  "utilities",
  "misc",
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "UPI", value: "upi" },
  { label: "Check", value: "check" },
] as const;

type Props = {
  onSuccess?: () => void | Promise<void>;
  presetDate?: string;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
};

function toDate(value?: string): Date {
  if (!value) {
    return new Date();
  }

  return new Date(`${value}T00:00:00`);
}

export function CreateManagerSpendingDialog({
  onSuccess,
  presetDate,
  triggerLabel = "Add spend",
  triggerVariant = "default",
  triggerSize = "default",
}: Props): React.JSX.Element {
  const supabase = createClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("misc");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [spentDate, setSpentDate] = useState<Date>(toDate(presetDate));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSpentDate(toDate(presetDate));
    }
  }, [open, presetDate]);

  const resetForm = () => {
    setTitle("");
    setCategory("misc");
    setAmount("");
    setPaymentMethod("cash");
    setSpentDate(toDate(presetDate));
    setNote("");
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Add a short spending title before submitting.",
      });
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Enter a spending amount greater than zero.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.rpc("create_manager_spending", {
        p_title: title.trim(),
        p_category: category,
        p_amount: parsedAmount,
        p_note: note.trim() || null,
        p_payment_method: paymentMethod,
        p_spent_date: format(spentDate, "yyyy-MM-dd"),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Spending added",
        description: "The spending entry has been saved.",
      });

      resetForm();
      setOpen(false);
      await onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Could not save spending",
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size={triggerSize} variant={triggerVariant}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add spending</DialogTitle>
          <DialogDescription>
            Record a manager-side operational spend without leaving payments.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="spending-title">Title</Label>
            <Input
              id="spending-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Tea for staff, fuel, loading, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Spent date</Label>
            <Calendar selected={spentDate} onSelect={(date) => date && setSpentDate(date)} />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replaceAll("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spending-amount">Amount</Label>
              <Input
                id="spending-amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="spending-note">Note</Label>
            <Textarea
              id="spending-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional internal note"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save spending
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
