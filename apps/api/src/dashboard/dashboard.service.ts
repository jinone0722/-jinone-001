import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [user, todayReminders, todoReminders, recentNotes, recentImages, recentFiles, recentLinks, workflows] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
        this.prisma.reminder.findMany({
          where: { userId, remindAt: { gte: start, lt: end } },
          orderBy: { remindAt: "asc" },
          take: 6
        }),
        this.prisma.reminder.findMany({
          where: { userId, status: "pending" },
          orderBy: { remindAt: "asc" },
          take: 6
        }),
        this.prisma.note.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 6 }),
        this.prisma.imageAsset.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
        this.prisma.fileAsset.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
        this.prisma.link.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 6 }),
        this.prisma.workflow.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 })
      ]);

    return {
      greeting: `你好，${user?.name || user?.email?.split("@")[0] || "WorkSphere 用户"}`,
      todayReminders,
      todayTodos: todoReminders,
      recentNotes,
      recentImages,
      recentFiles,
      recentLinks,
      workflows,
      stats: {
        remindersToday: todayReminders.length,
        pendingTodos: todoReminders.length,
        recentNotes: recentNotes.length,
        recentImages: recentImages.length
      }
    };
  }
}
