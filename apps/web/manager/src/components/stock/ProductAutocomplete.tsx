'use client';

import { Input } from '@/components/ui/input';
import { logger } from "@/lib/logger";
import type { LocalProduct } from "@mfc/database";
import { useQuery } from '@mfc/data-access';
import { useEffect, useRef, useState } from 'react';

type ProductAutocompleteProps = {
  value: string;
  onChange: (name: string, productId: string | null) => void;
  onEnterKey?: () => void;
  placeholder?: string;
  className?: string;
  emptyState?: React.ReactNode;
  createAction?: React.ReactNode;
  staticSuggestions?: LocalProduct[];
};

export function ProductAutocomplete({
  value,
  onChange,
  onEnterKey,
  placeholder = 'Search product...',
  className,
  emptyState,
  createAction,
  staticSuggestions,
}: ProductAutocompleteProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Use useQuery to fetch products with search filter
  const { data: products = [], loading } = useQuery('products', {
    filters: searchTerm.length > 1 ? {
      name: { $ilike: `${searchTerm}%` }
    } : undefined,
    limit: 10,
    enabled: searchTerm.length > 1,
  });

  // Update search term when value changes
  useEffect(() => {
    setSearchTerm(value);
    if (value.length > 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [value]);

  const availableProducts = staticSuggestions ?? products;
  const hasExactMatch = value.length > 1
    ? availableProducts.some((product) => product.name.toLowerCase() === value.toLowerCase())
    : false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: any) => {
    onChange(product.name, product.id);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    logger.info({ newValue }, 'ProductAutocomplete input changed');
    onChange(newValue, null);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          logger.info({ value }, 'ProductAutocomplete focused');
          if (value.length > 1) setOpen(true);
        }}
        onKeyDown={(e) => {
          logger.info({ key: e.key }, 'ProductAutocomplete key');
          if (e.key === 'Enter' && onEnterKey) {
            e.preventDefault();
            onEnterKey();
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        data-testid="product-autocomplete-input"
      />
      {open && availableProducts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {availableProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSelect(product)}
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              {product.name}
            </div>
          ))}
          {value.length > 1 && !hasExactMatch ? (
            createAction ? (
              <div
                className="border-t border-border"
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
              >
                {createAction}
              </div>
            ) : (
              <div
                onClick={() => {
                  onChange(value, null);
                  setOpen(false);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground border-t border-border text-primary"
              >
                ➕ Create new product: "{value}"
              </div>
            )
          ) : null}
        </div>
      )}
      {open && availableProducts.length === 0 && value.length > 1 && !loading ? (
        emptyState ? (
          <div
            className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            {emptyState}
          </div>
        ) : (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
            <div
              onClick={() => {
                onChange(value, null);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-primary"
            >
              ➕ Create new product: "{value}"
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
