import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { fileUploadOptions } from "../common/upload.util";
import { FilesService } from "./files.service";

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query("search") search?: string) {
    return this.filesService.list(user.id, search);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", fileUploadOptions))
  upload(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.filesService.upload(user.id, file);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.filesService.remove(user.id, id);
  }
}
