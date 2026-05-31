import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLinkDto } from "./links.dto";

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.link.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  create(userId: string, dto: CreateLinkDto) {
    return this.prisma.link.create({
      data: {
        userId,
        url: dto.url,
        title: dto.title ?? dto.url,
        description: dto.description,
        category: dto.category
      }
    });
  }

  async remove(userId: string, id: string) {
    const link = await this.prisma.link.findFirst({ where: { id, userId } });
    if (!link) throw new NotFoundException("Link not found");
    await this.prisma.link.delete({ where: { id } });
    return { ok: true };
  }
}
