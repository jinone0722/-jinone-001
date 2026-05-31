import { IsArray, IsIn, IsOptional, IsString } from "class-validator";

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsIn(["image", "pdf", "text"])
  inputType: string;

  @IsString()
  extractionPrompt: string;

  @IsString()
  outputFormat: string;
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(["image", "pdf", "text"])
  inputType?: string;

  @IsOptional()
  @IsString()
  extractionPrompt?: string;

  @IsOptional()
  @IsString()
  outputFormat?: string;
}

export class RunWorkflowDto {
  @IsOptional()
  @IsArray()
  inputFiles?: unknown[];

  @IsOptional()
  @IsString()
  text?: string;
}
