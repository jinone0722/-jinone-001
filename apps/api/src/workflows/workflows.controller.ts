import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RequestUser } from "../common/request-user";
import { CreateWorkflowDto, RunWorkflowDto, UpdateWorkflowDto } from "./workflows.dto";
import { WorkflowsService } from "./workflows.service";

@Controller("workflows")
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.workflowsService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(user.id, dto);
  }

  @Get("runs/:runId/export-csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  async exportCsv(@CurrentUser() user: RequestUser, @Param("runId") runId: string, @Res({ passthrough: true }) res: Response) {
    const csv = await this.workflowsService.csv(user.id, runId);
    res.setHeader("Content-Disposition", `attachment; filename="workflow-run-${runId}.csv"`);
    return csv;
  }

  @Get(":id/runs")
  runs(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.workflowsService.runs(user.id, id);
  }

  @Post(":id/run")
  run(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: RunWorkflowDto) {
    return this.workflowsService.run(user.id, id, dto);
  }

  @Get(":id")
  get(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.workflowsService.get(user.id, id);
  }

  @Patch(":id")
  update(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.workflowsService.remove(user.id, id);
  }
}
