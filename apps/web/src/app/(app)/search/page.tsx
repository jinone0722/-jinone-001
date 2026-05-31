"use client";

import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Badge, Button, Card, CardContent, Input } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type SearchResult = {
  type: "note" | "image" | "file" | "link" | "reminder";
  id: string;
  title: string;
  snippet: string;
  createdAt?: string;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await apiFetch<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`);
    setResults(response.results);
  }

  return (
    <div>
      <PageHeader title="全局搜索" />
      <Card className="mb-5">
        <CardContent className="p-4">
          <form className="flex gap-3" onSubmit={onSubmit}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input className="pl-9" value={q} onChange={(event) => setQ(event.target.value)} placeholder="搜索记录、图片 OCR、文件、网址、提醒" />
            </div>
            <Button type="submit">搜索</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge>{result.type}</Badge>
                <p className="font-medium text-ink">{result.title}</p>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{result.snippet}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
