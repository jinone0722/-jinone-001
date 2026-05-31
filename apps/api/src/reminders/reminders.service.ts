import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReminderDto, UpdateReminderDto } from "./reminders.dto";

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, today?: string) {
    const where: Prisma.ReminderWhereInput = { userId };
    if (today === "true") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.remindAt = { gte: start, lt: end };
    }
    return this.prisma.reminder.findMany({ where, orderBy: { remindAt: "asc" } });
  }

  create(userId: string, dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        remindAt: new Date(dto.remindAt)
      }
    });
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    await this.findOwned(userId, id);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.remindAt !== undefined ? { remindAt: new Date(dto.remindAt) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {})
      }
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.reminder.delete({ where: { id } });
    return { ok: true };
  }

  private async findOwned(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findFirst({ where: { id, userId } });
    if (!reminder) throw new NotFoundException("Reminder not found");
    return reminder;
  }
}
