import { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-marine">WorkSphere AI</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1>
      </div>
      {children}
    </div>
  );
}
