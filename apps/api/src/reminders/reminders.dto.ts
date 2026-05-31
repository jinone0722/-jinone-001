import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remindAt: string;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsString()
  status?: "pending" | "done";
}
