"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FileImage, Search, Trash2, UploadCloud } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch, assetUrl } from "@/lib/api";
import type { ImageAsset } from "@/lib/types";

export default function ImagesPage() {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadImages, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  async function loadImages() {
    const data = await apiFetch<ImageAsset[]>(`/images${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    setImages(data);
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    setUploading(true);
    try {
      const uploaded = await apiFetch<ImageAsset[]>("/images/upload/batch", {
        method: "POST",
        body: form
      });
      setImages((items) => [...uploaded, ...items]);
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function runOcr(id: string) {
    const updated = await apiFetch<ImageAsset>(`/images/${id}/ocr`, { method: "POST" });
    setImages((items) => items.map((item) => (item.id === id ? updated : item)));
  }

  async function remove(id: string) {
    await apiFetch(`/images/${id}`, { method: "DELETE" });
    setImages((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div>
      <PageHeader title="图片中心">
        <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
          <UploadCloud className="h-4 w-4" />
          {uploading ? "上传中..." : "批量上传"}
          <input className="hidden" type="file" accept="image/*" multiple onChange={upload} />
        </label>
      </PageHeader>

      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索 OCR 文本、摘要或文件名"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <img
                alt={image.originalName || "uploaded image"}
                className="aspect-video w-full rounded-lg border border-neutral-200 object-cover"
                src={assetUrl(image.imageUrl)}
              />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{image.originalName || "图片"}</p>
                  <p className="mt-1 line-clamp-3 text-sm text-neutral-500">{image.ocrText || "尚未生成 OCR 文本"}</p>
                </div>
                <Button size="icon" variant="ghost" title="删除图片" onClick={() => remove(image.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => runOcr(image.id)}>
                  <FileImage className="h-4 w-4" />
                  OCR
                </Button>
                {image.aiSummary ? <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600">{image.aiSummary}</span> : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
