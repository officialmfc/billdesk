"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/use-permissions";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@mfc/data-access";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  is_stock_tracked: boolean;
};

export function ProductCreationForm(): React.JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);

  const nameRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const descRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { role, loading: permissionsLoading } = usePermissions();
  const { mutate, loading: saving } = useMutation<ProductRow>('products');

  useEffect(() => {
    if (products.length === 0) {
      addProduct();
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const lastProduct = products[products.length - 1];
      setTimeout(() => lastProduct && nameRefs.current[lastProduct.id]?.focus(), 50);
    }
  }, [products, products.length]);

  const addProduct = useCallback(() => {
    const newProduct: ProductRow = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      is_stock_tracked: true,
    };
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProduct = useCallback((id: string, field: keyof ProductRow, value: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const handleNameEnter = useCallback((id: string) => {
    descRefs.current[id]?.focus();
  }, []);

  const handleDescEnter = useCallback((id: string) => {
    setProducts((prev) => {
      const currentProduct = prev.find((p) => p.id === id);
      if (currentProduct && currentProduct.name.trim()) {
        const newProduct: ProductRow = {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          is_stock_tracked: true,
        };
        return [...prev, newProduct];
      }
      return prev;
    });
  }, []);

  const handleSubmit = async () => {
    const validProducts = products.filter((p) => p.name.trim());

    if (validProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product with a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = validProducts.map((p) => ({
        name: p.name.trim(),
        description: p.description.trim() || null,
        is_stock_tracked: p.is_stock_tracked,
      }));

      // Use mutate with bulk insert operation
      await mutate(payload as any, {
        operation: 'insert',
      });

      toast({
        title: "Success",
        description: `${validProducts.length} product(s) created successfully!`,
      });

      router.push("/products");
    } catch (error: any) {
      console.error('❌ Product creation error:', error);

      // Handle specific error types
      if (error.message?.includes('duplicate') || error.code === "23505") {
        toast({
          title: "Duplicate Product",
          description: "One or more product names already exist",
          variant: "destructive",
        });
      } else if (error.message?.includes('permission') || error.code === "42501") {
        toast({
          title: "Permission Denied",
          description: `You don't have permission to create products. Role: ${role}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create products",
          variant: "destructive",
        });
      }
    }
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Create New Products</h1>
          <p className="text-sm text-muted-foreground">
            Add multiple products to the catalog
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4 md:p-6 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Products ({products.length})
          </h3>
          <Button onClick={addProduct} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </div>

        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="border border-border rounded-lg p-3 bg-muted/40 space-y-2"
              data-item-card
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
                {products.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(product.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Product Name *
                  </label>
                  <Input
                    ref={(el) => {
                      nameRefs.current[product.id] = el;
                    }}
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(product.id, "name", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleNameEnter(product.id);
                      }
                    }}
                    placeholder="e.g., Pomfret, King Fish..."
                    className="h-10"
                    enterKeyHint="next"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Description
                  </label>
                  <Input
                    ref={(el) => {
                      descRefs.current[product.id] = el;
                    }}
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(product.id, "description", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleDescEnter(product.id);
                      }
                    }}
                    placeholder="Optional description..."
                    className="h-10"
                    enterKeyHint="done"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving || products.length === 0}
          className="w-full h-11"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Products
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full h-11"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
