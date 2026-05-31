import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { publicUploadUrl, removeStoredUpload } from "../common/upload.util";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, search?: string) {
    const where: Prisma.ImageAssetWhereInput = { userId };
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { ocrText: { contains: search, mode: "insensitive" } },
        { aiSummary: { contains: search, mode: "insensitive" } }
      ];
    }
    return this.prisma.imageAsset.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  upload(userId: string, file: Express.Multer.File) {
    return this.prisma.imageAsset.create({
      data: {
        userId,
        imageUrl: publicUploadUrl("images", file.filename),
        originalName: file.originalname,
        tags: []
      }
    });
  }

  uploadBatch(userId: string, files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.upload(userId, file)));
  }

  async runOcr(userId: string, id: string) {
    const image = await this.findOwned(userId, id);
    const ocrText = `Mock OCR text from ${image.originalName ?? "uploaded image"}. 客户姓名：示例客户；电话：13800000000；需求：需要整理办公资料。`;
    const aiSummary = "Mock AI summary: 这张图片可能包含客户资料、联系方式和跟进事项。";
    return this.prisma.imageAsset.update({
      where: { id },
      data: {
        ocrText,
        aiSummary,
        extractedData: {
          customerName: "示例客户",
          phone: "13800000000",
          need: "整理办公资料",
          budget: "待确认",
          followUpAt: new Date().toISOString()
        }
      }
    });
  }

  async remove(userId: string, id: string) {
    const image = await this.findOwned(userId, id);
    await this.prisma.imageAsset.delete({ where: { id } });
    await removeStoredUpload(image.imageUrl);
    return { ok: true };
  }

  private async findOwned(userId: string, id: string) {
    const image = await this.prisma.imageAsset.findFirst({ where: { id, userId } });
    if (!image) throw new NotFoundException("Image not found");
    return image;
  }
}
