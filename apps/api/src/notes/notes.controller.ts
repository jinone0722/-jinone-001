import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { CreateNoteDto, UpdateNoteDto } from "./notes.dto";
import { NotesService } from "./notes.service";

@Controller("notes")
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: { search?: string; tag?: string; favorite?: string }) {
    return this.notesService.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateNoteDto) {
    return this.notesService.create(user.id, dto);
  }

  @Get(":id")
  get(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.notesService.get(user.id, id);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.notesService.remove(user.id, id);
  }
}
