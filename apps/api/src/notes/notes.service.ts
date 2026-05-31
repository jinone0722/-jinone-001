import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNoteDto, UpdateNoteDto } from "./notes.dto";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, query?: { search?: string; tag?: string; favorite?: string }) {
    const where: Prisma.NoteWhereInput = { userId };
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } }
      ];
    }
    if (query?.tag) where.tags = { has: query.tag };
    if (query?.favorite === "true") where.isFavorite = true;

    return this.prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" }
    });
  }

  create(userId: string, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        title: dto.title?.trim() || null,
        content: dto.content,
        type: dto.type ?? "text",
        tags: dto.tags ?? [],
        isFavorite: dto.isFavorite ?? false
      }
    });
  }

  async get(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException("Note not found");
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.get(userId, id);
    return this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title?.trim() || null } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.isFavorite !== undefined ? { isFavorite: dto.isFavorite } : {})
      }
    });
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.note.delete({ where: { id } });
    return { ok: true };
  }
}
