import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { AiChatDto, AiTextDto } from "./ai.dto";

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async chat(userId: string, dto: AiChatDto) {
    const [notes, images, files, reminders] = await Promise.all([
      this.prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 5 }),
      this.prisma.imageAsset.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
      this.prisma.fileAsset.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
      this.prisma.reminder.findMany({ where: { userId }, orderBy: { remindAt: "asc" }, take: 5 })
    ]);

    const provider = this.detectProvider();
    const contextSummary = [
      `${notes.length} 条最近记录`,
      `${images.length} 张图片`,
      `${files.length} 个文件`,
      `${reminders.length} 个提醒`
    ].join("、");

    return {
      provider,
      answer:
        `我已限定在当前登录用户的数据里检索到 ${contextSummary}。` +
        `针对「${dto.message}」，第一版先返回 mock 结果：可以将最近记录整理为日报、从图片 OCR 文本中抽取客户资料，或生成提醒草稿。`,
      context: {
        notes: notes.map((item) => ({ id: item.id, title: item.title, content: item.content.slice(0, 200) })),
        images: images.map((item) => ({ id: item.id, originalName: item.originalName, ocrText: item.ocrText })),
        files: files.map((item) => ({ id: item.id, filename: item.filename })),
        reminders: reminders.map((item) => ({ id: item.id, title: item.title, remindAt: item.remindAt }))
      }
    };
  }

  summarize(_userId: string, dto: AiTextDto) {
    return {
      provider: this.detectProvider(),
      summary: `Mock summary: ${dto.text.slice(0, 120)}${dto.text.length > 120 ? "..." : ""}`
    };
  }

  extractReminder(_userId: string, dto: AiTextDto) {
    const remindAt = new Date();
    remindAt.setHours(remindAt.getHours() + 2);
    return {
      title: dto.text.slice(0, 40) || "AI 提醒",
      description: dto.text,
      remindAt: remindAt.toISOString()
    };
  }

  extractImageData(_userId: string, dto: AiTextDto) {
    return {
      rows: [
        {
          customerName: "示例客户",
          phone: "13800000000",
          need: dto.prompt || "根据图片文字提取客户需求",
          budget: "待确认",
          followUpAt: new Date().toISOString()
        }
      ]
    };
  }

  private detectProvider() {
    if (this.config.get<string>("OPENAI_API_KEY")) return "openai-ready";
    if (this.config.get<string>("DEEPSEEK_API_KEY")) return "deepseek-ready";
    if (this.config.get<string>("CLAUDE_API_KEY")) return "claude-ready";
    return "mock";
  }
}
