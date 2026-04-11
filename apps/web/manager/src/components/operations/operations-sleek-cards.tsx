"use client";

export function OperationsEmptyState({
  title,
  description,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed bg-card/60 px-5 py-8 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
