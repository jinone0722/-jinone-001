import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ToolsService } from "./tools.service";

@Controller("tools")
@UseGuards(JwtAuthGuard)
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  list() {
    return this.toolsService.list();
  }

  @Post(":toolKey/run")
  run(@Param("toolKey") toolKey: string) {
    return this.toolsService.run(toolKey);
  }
}
