import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { imageUploadOptions } from "../common/upload.util";
import { ImagesService } from "./images.service";

@Controller("images")
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query("search") search?: string) {
    return this.imagesService.list(user.id, search);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", imageUploadOptions))
  upload(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.imagesService.upload(user.id, file);
  }

  @Post("upload/batch")
  @UseInterceptors(FilesInterceptor("files", 20, imageUploadOptions))
  uploadBatch(@CurrentUser() user: RequestUser, @UploadedFiles() files: Express.Multer.File[]) {
    return this.imagesService.uploadBatch(user.id, files);
  }

  @Post(":id/ocr")
  runOcr(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.imagesService.runOcr(user.id, id);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.imagesService.remove(user.id, id);
  }
}
