import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { publicUploadUrl, removeStoredUpload } from "../common/upload.util";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, search?: string) {
    const where: Prisma.FileAssetWhereInput = { userId };
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { extractedText: { contains: search, mode: "insensitive" } },
        { aiSummary: { contains: search, mode: "insensitive" } }
      ];
    }
    return this.prisma.fileAsset.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  upload(userId: string, file: Express.Multer.File) {
    return this.prisma.fileAsset.create({
      data: {
        userId,
        filename: file.originalname,
        fileUrl: publicUploadUrl("files", file.filename),
        fileType: file.mimetype,
        tags: []
      }
    });
  }

  async remove(userId: string, id: string) {
    const file = await this.findOwned(userId, id);
    await this.prisma.fileAsset.delete({ where: { id } });
    await removeStoredUpload(file.fileUrl);
    return { ok: true };
  }

  private async findOwned(userId: string, id: string) {
    const file = await this.prisma.fileAsset.findFirst({ where: { id, userId } });
    if (!file) throw new NotFoundException("File not found");
    return file;
  }
}
