import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { CreateLinkDto } from "./links.dto";
import { LinksService } from "./links.service";

@Controller("links")
@UseGuards(JwtAuthGuard)
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.linksService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateLinkDto) {
    return this.linksService.create(user.id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.linksService.remove(user.id, id);
  }
}
