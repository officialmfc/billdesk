"use client";

import { UserAutocomplete } from "@/components/sales/auction-sale/UserAutocomplete";
import { ProductAutocomplete } from "@/components/stock/ProductAutocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createManagedUser } from "@/lib/create-managed-user";
import { createManagedProduct } from "@/lib/create-managed-product";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@mfc/data-access";
import type { LocalMfcStaff, LocalProduct } from "@mfc/database";
import {
  buildManagerQuoteNumber,
  calculateManagerQuoteTotal,
  prepareManagerQuoteItems,
} from "@mfc/manager-workflows";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const quoteFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  sellerId: z.string().min(1, "Seller is required"),
  deliveryDate: z.date(),
  quoteNumber: z.string().min(1, "Quote number is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productDescription: z.string().min(1, "Description is required"),
    weightKg: z.coerce.number().min(0.01, "Weight must be positive"),
    pricePerKg: z.coerce.number().min(0.01, "Price must be positive"),
  })).min(1, "At least one item is required"),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

interface QuoteCreationFormProps {
  onSuccess?: () => void;
}

interface InlineCustomerDraft {
  businessName: string;
  fullName: string;
  phone: string;
}

interface InlineProductDraft {
  name: string;
  description: string;
}

function buildQuoteDefaults(): Partial<QuoteFormValues> {
  return {
    quoteNumber: buildManagerQuoteNumber(),
    items: [{ productDescription: "", weightKg: 0, pricePerKg: 0 }],
  };
}

export function QuoteCreationForm({ onSuccess }: QuoteCreationFormProps) {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [createCustomerInlineOpen, setCreateCustomerInlineOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [customerCreateError, setCustomerCreateError] = useState<string | null>(null);
  const [createdProducts, setCreatedProducts] = useState<LocalProduct[]>([]);
  const [createProductInlineOpen, setCreateProductInlineOpen] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productCreateError, setProductCreateError] = useState<string | null>(null);
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);
  const [customerDraft, setCustomerDraft] = useState<InlineCustomerDraft>({
    businessName: "",
    fullName: "",
    phone: "",
  });
  const [productDraft, setProductDraft] = useState<InlineProductDraft>({
    name: "",
    description: "",
  });
  const { showToast } = useToast();
  const supabase = createClient();

  // Fetch staff for sellers from the canonical staff table
  const { data: staff = [] } = useQuery<LocalMfcStaff>('mfc_staff', {
    filters: { role: 'mfc_seller', is_active: true },
    orderBy: { field: 'full_name', direction: 'asc' }
  });

  // Fetch products
  const { data: products = [] } = useQuery<LocalProduct>('products', {
    orderBy: { field: 'name', direction: 'asc' }
  });

  const allProducts = useMemo(() => {
    const merged = [...createdProducts, ...products];
    return Array.from(
      new Map(merged.map((product: LocalProduct) => [product.id, product])).values()
    );
  }, [createdProducts, products]);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema) as never,
    defaultValues: buildQuoteDefaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch product selection to auto-fill description and price
  const watchItems = form.watch("items");

  const handleProductChange = (index: number, productId: string) => {
    const product = allProducts.find((entry) => entry.id === productId);
    if (product) {
      form.setValue(`items.${index}.productDescription`, product.name);
      // form.setValue(`items.${index}.pricePerKg`, product.price); // If product has price
    }
  };

  async function onSubmit(data: QuoteFormValues) {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc("create_quote", {
        p_customer_id: data.customerId,
        p_assigned_mfc_seller_id: data.sellerId,
        p_delivery_date: format(data.deliveryDate, 'yyyy-MM-dd'),
        p_quote_number: data.quoteNumber,
        p_items: prepareManagerQuoteItems(
          data.items.map((item) => ({
            productId: item.productId === "custom" ? undefined : item.productId,
            productDescription: item.productDescription,
            weightKg: item.weightKg,
            pricePerKg: item.pricePerKg,
          }))
        ),
        p_notes: data.notes || "",
      });

      if (error) throw error;

      showToast("success", "Quote created successfully");
      form.reset(buildQuoteDefaults());
      setCustomerName("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating quote:", error);
      showToast("error", error instanceof Error ? error.message : "Failed to create quote");
    } finally {
      setLoading(false);
    }
  }

  const totalAmount = calculateManagerQuoteTotal(watchItems);

  const openInlineCustomerCreate = () => {
    const seededName = customerName.trim();
    setCustomerCreateError(null);
    setCustomerDraft((previous) => ({
      businessName: seededName || previous.businessName,
      fullName: seededName || previous.fullName,
      phone: previous.phone,
    }));
    setCreateCustomerInlineOpen(true);
  };

  const closeInlineCustomerCreate = () => {
    setCreateCustomerInlineOpen(false);
    setCustomerCreateError(null);
  };

  const openInlineProductCreate = (index: number) => {
    const seededName = watchItems[index]?.productDescription?.trim() || "";
    setActiveProductIndex(index);
    setProductCreateError(null);
    setProductDraft((previous) => ({
      name: seededName || previous.name,
      description: previous.description,
    }));
    setCreateProductInlineOpen(true);
  };

  const closeInlineProductCreate = () => {
    setCreateProductInlineOpen(false);
    setProductCreateError(null);
    setActiveProductIndex(null);
  };

  const handleInlineCustomerCreate = async () => {
    const businessName = customerDraft.businessName.trim();
    const fullName = customerDraft.fullName.trim();
    const phone = customerDraft.phone.trim();

    if (businessName.length < 2) {
      setCustomerCreateError("Business name must be at least 2 characters.");
      return;
    }

    if (fullName.length < 2) {
      setCustomerCreateError("Contact name must be at least 2 characters.");
      return;
    }

    if (phone.length < 10) {
      setCustomerCreateError("Phone number must be at least 10 digits.");
      return;
    }

    setCreatingCustomer(true);
    setCustomerCreateError(null);

    try {
      const createdUser = await createManagedUser(supabase, {
        fullName,
        businessName,
        phone,
        userType: "business",
        defaultRole: "buyer",
      });

      const displayName = createdUser.business_name || createdUser.name;
      setCustomerName(displayName);
      form.setValue("customerId", createdUser.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setCustomerDraft({
        businessName: displayName,
        fullName: createdUser.name,
        phone: createdUser.phone ?? "",
      });
      setCreateCustomerInlineOpen(false);
      showToast("success", "Customer created successfully");
    } catch (error) {
      console.error("Error creating quote customer:", error);
      setCustomerCreateError(
        error instanceof Error ? error.message : "Failed to create customer"
      );
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleInlineProductCreate = async () => {
    const name = productDraft.name.trim();
    const description = productDraft.description.trim();

    if (name.length < 2) {
      setProductCreateError("Product name must be at least 2 characters.");
      return;
    }

    setCreatingProduct(true);
    setProductCreateError(null);

    try {
      const createdProduct = await createManagedProduct(supabase, {
        description,
        isStockTracked: true,
        name,
      });

      setCreatedProducts((previous) => [createdProduct, ...previous]);

      if (activeProductIndex !== null) {
        form.setValue(`items.${activeProductIndex}.productId`, createdProduct.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.setValue(`items.${activeProductIndex}.productDescription`, createdProduct.name, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      setCreateProductInlineOpen(false);
      setActiveProductIndex(null);
      showToast("success", "Product created successfully");
    } catch (error) {
      console.error("Error creating quote product:", error);
      setProductCreateError(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quoteNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Date</FormLabel>
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </FormControl>
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
                      setCustomerCreateError(null);
                      if (id) {
                        setCreateCustomerInlineOpen(false);
                      }
                      form.setValue("customerId", id || "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder="Search customer..."
                    userType="business"
                    emptyState={
                      <div className="flex items-center justify-between gap-3 px-3 py-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium">No matching customer</div>
                          <div className="text-xs text-muted-foreground">
                            Create a new customer for this quote.
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={openInlineCustomerCreate}
                        >
                          Create
                        </Button>
                      </div>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MFC Seller</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {createCustomerInlineOpen ? (
          <Card className="gap-4 border-dashed">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Create Customer Without Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add the customer here and continue the quote without leaving this popup.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={customerDraft.businessName}
                    onChange={(event) =>
                      setCustomerDraft((previous) => ({
                        ...previous,
                        businessName: event.target.value,
                      }))
                    }
                    placeholder="Business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={customerDraft.fullName}
                    onChange={(event) =>
                      setCustomerDraft((previous) => ({
                        ...previous,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={customerDraft.phone}
                    onChange={(event) =>
                      setCustomerDraft((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {customerCreateError ? (
                <p className="text-sm font-medium text-destructive">{customerCreateError}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeInlineCustomerCreate}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleInlineCustomerCreate}
                  disabled={creatingCustomer}
                >
                  {creatingCustomer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {createProductInlineOpen ? (
          <Card className="gap-4 border-dashed">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-base">Create Product</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a product here and continue the quote without leaving this popup.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={productDraft.name}
                    onChange={(event) =>
                      setProductDraft((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={productDraft.description}
                    onChange={(event) =>
                      setProductDraft((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {productCreateError ? (
                <p className="text-sm font-medium text-destructive">{productCreateError}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeInlineProductCreate}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleInlineProductCreate}
                  disabled={creatingProduct}
                >
                  {creatingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Product
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productDescription: "", weightKg: 0, pricePerKg: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md">
                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <FormControl>
                          <ProductAutocomplete
                            value={watchItems[index]?.productDescription ?? ""}
                            onChange={(name, productId) => {
                              form.setValue(`items.${index}.productDescription`, name, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              field.onChange(productId || undefined);
                              if (productId) {
                                handleProductChange(index, productId);
                              }
                            }}
                            placeholder="Search product..."
                            staticSuggestions={allProducts}
                            emptyState={
                              <div className="flex items-center justify-between gap-3 px-3 py-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">No matching product</div>
                                  <div className="text-xs text-muted-foreground">
                                    Create a new product for this quote.
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openInlineProductCreate(index)}
                                >
                                  Create
                                </Button>
                              </div>
                            }
                            createAction={
                              <div className="flex items-center justify-between gap-3 px-3 py-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium">Create product</div>
                                  <div className="text-xs text-muted-foreground">
                                    Use the current name and add this product inline.
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openInlineProductCreate(index)}
                                >
                                  Create
                                </Button>
                              </div>
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productDescription`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.weightKg`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.pricePerKg`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price/kg</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end text-lg font-bold">
            Total Amount: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Quote
          </Button>
        </div>
      </form>
    </Form>
  );
}
