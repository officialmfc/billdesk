import { QuotesList } from "@/components/quotes/QuotesList";

export default function QuotesPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
        <p className="text-muted-foreground">
          View and manage customer quotes
        </p>
      </div>

      <QuotesList />
    </div>
  );
}
