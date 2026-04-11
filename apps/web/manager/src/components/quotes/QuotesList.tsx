"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSupabaseLoader } from "@/hooks/useSupabaseLoader";
import {
  type WebQuoteRecord,
  loadWebQuotesReadModel,
} from "@/lib/web-remote-read-model";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { FileText, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { QuoteCreationForm } from "./QuoteCreationForm";

type QuoteWithDetails = WebQuoteRecord & {
  customer_name?: string;
  seller_name?: string;
};

export function QuotesList(): React.JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const quotesLoader = useCallback(
    (supabase: Parameters<typeof loadWebQuotesReadModel>[0]) =>
      loadWebQuotesReadModel(supabase),
    []
  );
  const { data: quoteData, loading, refetch } = useSupabaseLoader(quotesLoader, {
    initialData: {
      users: [],
      mfcStaff: [],
      quotes: [],
    },
  });

  const enrichedQuotes = useMemo<QuoteWithDetails[]>(() => {
    const userMap = new Map(quoteData.users.map((user) => [user.id, user]));
    const staffMap = new Map(quoteData.mfcStaff.map((staff) => [staff.id, staff]));

    return quoteData.quotes.map((quote) => ({
      ...quote,
      customer_name:
        userMap.get(quote.customer_id)?.business_name ||
        userMap.get(quote.customer_id)?.name ||
        "Unknown",
      seller_name:
        (quote.assigned_mfc_seller_id
          ? staffMap.get(quote.assigned_mfc_seller_id)?.full_name
          : undefined) || "Unknown",
    }));
  }, [quoteData.mfcStaff, quoteData.quotes, quoteData.users]);

  const filteredQuotes = useMemo(() => {
    return enrichedQuotes.filter((quote) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        quote.quote_number.toLowerCase().includes(searchLower) ||
        quote.customer_name?.toLowerCase().includes(searchLower) ||
        quote.seller_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [enrichedQuotes, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <QuoteCreationForm
              onSuccess={() => {
                setIsCreateOpen(false);
                void refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading quotes...
                </TableCell>
              </TableRow>
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>No quotes found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    {quote.quote_number}
                  </TableCell>
                  <TableCell>{quote.customer_name}</TableCell>
                  <TableCell>{quote.seller_name}</TableCell>
                  <TableCell>
                    {format(new Date(quote.delivery_date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    }).format(quote.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(quote.status) + " text-white hover:opacity-80"}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
