"use client";

import { useEffect, useState } from "react";
import { FileArchive, FileSpreadsheet, FileText, Image, Wand2 } from "lucide-react";
import { Button, Card, CardContent } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";

type ToolItem = {
  key: string;
  name: string;
  status: string;
};

const iconByKey: Record<string, React.ReactNode> = {
  "image-convert": <Image className="h-5 w-5" />,
  "image-compress": <FileArchive className="h-5 w-5" />,
  "image-ocr": <Wand2 className="h-5 w-5" />,
  "pdf-to-word": <FileText className="h-5 w-5" />,
  "word-to-pdf": <FileText className="h-5 w-5" />,
  "excel-to-csv": <FileSpreadsheet className="h-5 w-5" />,
  "csv-to-excel": <FileSpreadsheet className="h-5 w-5" />
};

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch<ToolItem[]>("/tools").then(setTools).catch(console.error);
  }, []);

  async function run(tool: ToolItem) {
    const response = await apiFetch<{ message: string }>(`/tools/${tool.key}/run`, { method: "POST" });
    setMessage(`${tool.name}: ${response.message}`);
  }

  return (
    <div>
      <PageHeader title="办公工具中心" />
      {message ? <div className="mb-5 rounded-lg border border-marine/20 bg-white px-4 py-3 text-sm text-marine">{message}</div> : null}
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.key}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-marine">{iconByKey[tool.key]}</div>
                <div>
                  <p className="font-semibold text-ink">{tool.name}</p>
                  <p className="text-sm text-neutral-500">{tool.status}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => run(tool)}>
                运行
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
