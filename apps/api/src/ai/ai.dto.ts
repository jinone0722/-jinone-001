import { IsOptional, IsString } from "class-validator";

export class AiChatDto {
  @IsString()
  message: string;
}

export class AiTextDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  prompt?: string;
}
