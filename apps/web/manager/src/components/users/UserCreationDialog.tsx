"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/toast";
import {
  createManagedUser,
  createManagedUserInvitation,
} from "@/lib/create-managed-user";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LocalUser } from "@mfc/database";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const userFormSchema = z.object({
  authMode: z.enum(["with_invite", "without_auth"]),
  email: z.string().optional(),
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  businessName: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  userType: z.enum(["vendor", "business"]),
  defaultRole: z.enum(["buyer", "seller"]),
}).superRefine((value, ctx) => {
  if (value.authMode !== "with_invite") {
    return;
  }

  if (!value.email?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email is required when creating login access",
      path: ["email"],
    });
  } else if (!z.string().email().safeParse(value.email).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid email address",
      path: ["email"],
    });
  }

});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserCreationDialogProps {
  onSuccess?: () => void;
  onCreated?: (user: LocalUser) => void;
  trigger?: React.ReactNode;
  triggerLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  submitLabel?: string;
  initialValues?: Partial<UserFormValues>;
  lockedUserType?: UserFormValues["userType"];
  lockedDefaultRole?: UserFormValues["defaultRole"];
  initialAuthMode?: UserFormValues["authMode"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const baseDefaults: UserFormValues = {
  authMode: "with_invite",
  email: "",
  fullName: "",
  businessName: "",
  phone: "",
  userType: "business",
  defaultRole: "buyer",
};

export function UserCreationDialog({
  onSuccess,
  onCreated,
  trigger,
  triggerLabel = "Create User",
  dialogTitle = "Create User",
  dialogDescription,
  submitLabel = "Create User",
  initialValues,
  lockedUserType,
  lockedDefaultRole,
  initialAuthMode,
  open,
  onOpenChange,
}: UserCreationDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : uncontrolledOpen;

  const setDialogOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const mergedDefaults = useMemo<UserFormValues>(
    () => ({
      ...baseDefaults,
      ...initialValues,
      ...(initialAuthMode ? { authMode: initialAuthMode } : {}),
      ...(lockedUserType ? { userType: lockedUserType } : {}),
      ...(lockedDefaultRole ? { defaultRole: lockedDefaultRole } : {}),
    }),
    [initialAuthMode, initialValues, lockedDefaultRole, lockedUserType]
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: mergedDefaults,
  });

  const authMode = form.watch("authMode");

  useEffect(() => {
    if (dialogOpen) {
      form.reset(mergedDefaults);
    }
  }, [dialogOpen, form, mergedDefaults]);

  async function onSubmit(data: UserFormValues) {
    setLoading(true);
    try {
      if (data.authMode === "with_invite") {
        const invite = await createManagedUserInvitation(supabase, {
          email: data.email?.trim() || "",
          fullName: data.fullName,
          businessName: data.businessName,
          phone: data.phone,
          userType: data.userType,
          defaultRole: data.defaultRole,
          requestedPlatform: "mobile",
        });

        const inviteUrl = new URL(invite.signup_path, window.location.origin).toString();
        try {
          await navigator.clipboard.writeText(inviteUrl);
          showToast("success", "Invite created and copied to clipboard");
        } catch {
          showToast("success", "Invite created successfully");
        }
      } else {
        const createdUser: LocalUser = await createManagedUser(supabase, {
          fullName: data.fullName,
          businessName: data.businessName,
          phone: data.phone,
          userType: data.userType,
          defaultRole: data.defaultRole,
        });

        showToast("success", "User created successfully");
        onCreated?.(createdUser);
      }

      setDialogOpen(false);
      form.reset(mergedDefaults);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating user:", error);
      showToast("error", error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger !== null ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {triggerLabel}
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription ? <p className="text-sm text-muted-foreground">{dialogDescription}</p> : null}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="authMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Access</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="grid gap-3 sm:grid-cols-2"
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "without_auth") {
                          form.setValue("email", "");
                        }
                      }}
                      value={field.value}
                    >
                      <Label
                        htmlFor="create-user-with-invite"
                        className={cn(
                          "items-start rounded-lg border p-3",
                          field.value === "with_invite" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="with_invite" id="create-user-with-invite" />
                        <div className="space-y-1">
                          <p className="font-medium">With invite</p>
                        </div>
                      </Label>

                      <Label
                        htmlFor="create-user-without-auth"
                        className={cn(
                          "items-start rounded-lg border p-3",
                          field.value === "without_auth" && "border-primary bg-primary/5"
                        )}
                      >
                        <RadioGroupItem value="without_auth" id="create-user-without-auth" />
                        <div className="space-y-1">
                          <p className="font-medium">Without login</p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authMode === "with_invite" ? (
              <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              </>
            ) : null}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!lockedUserType || !lockedDefaultRole ? (
              <div className="grid grid-cols-2 gap-4">
                {!lockedUserType ? (
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                {!lockedDefaultRole ? (
                  <FormField
                    control={form.control}
                    name="defaultRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="seller">Seller</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
