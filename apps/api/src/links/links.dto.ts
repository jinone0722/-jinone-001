import { IsOptional, IsString, IsUrl } from "class-validator";

export class CreateLinkDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
