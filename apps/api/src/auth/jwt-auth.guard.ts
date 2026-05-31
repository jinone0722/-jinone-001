import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthenticatedRequest, RequestUser } from "../common/request-user";

type JwtPayload = {
  sub: string;
  email: string;
  name?: string | null;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) throw new UnauthorizedException("Missing bearer token");

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET")
      });
      const user: RequestUser = { id: payload.sub, email: payload.email, name: payload.name };
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
