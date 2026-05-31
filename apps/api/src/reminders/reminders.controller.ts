import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { CreateReminderDto, UpdateReminderDto } from "./reminders.dto";
import { RemindersService } from "./reminders.service";

@Controller("reminders")
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query("today") today?: string) {
    return this.remindersService.list(user.id, today);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.id, dto);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateReminderDto) {
    return this.remindersService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.remindersService.remove(user.id, id);
  }
}
