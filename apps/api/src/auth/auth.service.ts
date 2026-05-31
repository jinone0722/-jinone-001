import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./auth.dto";

type AuthUserRecord = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  workspaces?: { id: string; name: string }[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException("Email is already registered");

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name?.trim() || null,
        workspaces: {
          create: {
            name: dto.name?.trim() ? `${dto.name.trim()}'s workspace` : "My workspace"
          }
        }
      },
      include: { workspaces: true }
    });

    return this.authResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { workspaces: true }
    });
    if (!user) throw new UnauthorizedException("Invalid email or password");

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid email or password");

    return this.authResponse(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { workspaces: true }
    });
    return {
      user: this.publicUser(user),
      workspaces: user.workspaces
    };
  }

  private async authResponse(user: AuthUserRecord) {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name
    });

    return {
      token,
      user: this.publicUser(user),
      workspace: user.workspaces?.[0] ?? null
    };
  }

  private publicUser(user: { id: string; email: string; name: string | null; avatar: string | null; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
  }
}
