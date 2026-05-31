import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type SearchResult = {
  type: "note" | "image" | "file" | "link" | "reminder";
  id: string;
  title: string;
  snippet: string;
  createdAt?: string;
};

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, q?: string) {
    const query = q?.trim();
    if (!query) return { query: "", results: [] as SearchResult[] };

    const [notes, images, files, links, reminders] = await Promise.all([
      this.prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 8,
        orderBy: { updatedAt: "desc" }
      }),
      this.prisma.imageAsset.findMany({
        where: {
          userId,
          OR: [
            { originalName: { contains: query, mode: "insensitive" } },
            { ocrText: { contains: query, mode: "insensitive" } },
            { aiSummary: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.fileAsset.findMany({
        where: {
          userId,
          OR: [
            { filename: { contains: query, mode: "insensitive" } },
            { extractedText: { contains: query, mode: "insensitive" } },
            { aiSummary: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.link.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 8,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.reminder.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 8,
        orderBy: { remindAt: "asc" }
      })
    ]);

    const results: SearchResult[] = [
      ...notes.map((item) => ({
        type: "note" as const,
        id: item.id,
        title: item.title || "未命名记录",
        snippet: item.content.slice(0, 160),
        createdAt: item.createdAt.toISOString()
      })),
      ...images.map((item) => ({
        type: "image" as const,
        id: item.id,
        title: item.originalName || "图片",
        snippet: item.ocrText || item.aiSummary || "尚未生成 OCR 文本",
        createdAt: item.createdAt.toISOString()
      })),
      ...files.map((item) => ({
        type: "file" as const,
        id: item.id,
        title: item.filename,
        snippet: item.extractedText || item.aiSummary || item.fileType,
        createdAt: item.createdAt.toISOString()
      })),
      ...links.map((item) => ({
        type: "link" as const,
        id: item.id,
        title: item.title || item.url,
        snippet: item.description || item.url,
        createdAt: item.createdAt.toISOString()
      })),
      ...reminders.map((item) => ({
        type: "reminder" as const,
        id: item.id,
        title: item.title,
        snippet: item.description || item.status,
        createdAt: item.createdAt.toISOString()
      }))
    ];

    return { query, results, count: results.length };
  }
}
