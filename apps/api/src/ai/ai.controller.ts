import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { AiChatDto, AiTextDto } from "./ai.dto";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat")
  chat(@CurrentUser() user: RequestUser, @Body() dto: AiChatDto) {
    return this.aiService.chat(user.id, dto);
  }

  @Post("summarize")
  summarize(@CurrentUser() user: RequestUser, @Body() dto: AiTextDto) {
    return this.aiService.summarize(user.id, dto);
  }

  @Post("extract-reminder")
  extractReminder(@CurrentUser() user: RequestUser, @Body() dto: AiTextDto) {
    return this.aiService.extractReminder(user.id, dto);
  }

  @Post("extract-image-data")
  extractImageData(@CurrentUser() user: RequestUser, @Body() dto: AiTextDto) {
    return this.aiService.extractImageData(user.id, dto);
  }
}
