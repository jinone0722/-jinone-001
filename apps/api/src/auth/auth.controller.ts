import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "./current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { RequestUser } from "../common/request-user";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.id);
  }
}
