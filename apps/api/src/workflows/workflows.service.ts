import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWorkflowDto, RunWorkflowDto, UpdateWorkflowDto } from "./workflows.dto";

type WorkflowResultRow = Record<string, string>;

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
  }

  create(userId: string, dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        userId,
        name: dto.name,
        inputType: dto.inputType,
        extractionPrompt: dto.extractionPrompt,
        outputFormat: dto.outputFormat
      }
    });
  }

  async get(userId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({ where: { id, userId } });
    if (!workflow) throw new NotFoundException("Workflow not found");
    return workflow;
  }

  async update(userId: string, id: string, dto: UpdateWorkflowDto) {
    await this.get(userId, id);
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.inputType !== undefined ? { inputType: dto.inputType } : {}),
        ...(dto.extractionPrompt !== undefined ? { extractionPrompt: dto.extractionPrompt } : {}),
        ...(dto.outputFormat !== undefined ? { outputFormat: dto.outputFormat } : {})
      }
    });
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.workflow.delete({ where: { id } });
    return { ok: true };
  }

  async run(userId: string, workflowId: string, dto: RunWorkflowDto) {
    const workflow = await this.get(userId, workflowId);
    const rows = this.mockRows(dto);
    const result = {
      columns: ["customerName", "phone", "need", "budget", "followUpAt"],
      prompt: workflow.extractionPrompt,
      outputFormat: workflow.outputFormat,
      rows
    };

    return this.prisma.workflowRun.create({
      data: {
        workflowId,
        userId,
        inputFiles: (dto.inputFiles ?? []) as Prisma.InputJsonValue,
        result: result as Prisma.InputJsonValue,
        status: "completed"
      }
    });
  }

  async runs(userId: string, workflowId: string) {
    await this.get(userId, workflowId);
    return this.prisma.workflowRun.findMany({
      where: { userId, workflowId },
      orderBy: { createdAt: "desc" }
    });
  }

  async csv(userId: string, runId: string) {
    const run = await this.prisma.workflowRun.findFirst({ where: { id: runId, userId } });
    if (!run) throw new NotFoundException("Workflow run not found");

    const result = run.result as { columns?: string[]; rows?: WorkflowResultRow[] } | null;
    const columns = result?.columns?.length ? result.columns : ["customerName", "phone", "need", "budget", "followUpAt"];
    const rows = result?.rows ?? [];
    return [columns.join(","), ...rows.map((row) => columns.map((key) => this.csvCell(row[key] ?? "")).join(","))].join("\n");
  }

  private mockRows(dto: RunWorkflowDto): WorkflowResultRow[] {
    const count = Math.max(dto.inputFiles?.length ?? 0, dto.text ? 1 : 0, 1);
    return Array.from({ length: count }, (_, index) => ({
      customerName: `示例客户${index + 1}`,
      phone: `1380000000${index}`,
      need: dto.text?.slice(0, 40) || "根据上传资料提取客户需求",
      budget: index % 2 === 0 ? "待确认" : "5000-10000",
      followUpAt: new Date(Date.now() + (index + 1) * 86400000).toISOString()
    }));
  }

  private csvCell(value: string) {
    const text = String(value);
    if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }
}
