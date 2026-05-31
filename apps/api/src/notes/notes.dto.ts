import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
