"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Play, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea
} from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import type { Workflow, WorkflowRun } from "@/lib/types";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selected, setSelected] = useState<Workflow | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [name, setName] = useState("客户截图提取");
  const [inputType, setInputType] = useState<Workflow["inputType"]>("image");
  const [extractionPrompt, setExtractionPrompt] = useState("从客户聊天截图中提取客户姓名、电话、需求、预算、跟进时间。");
  const [outputFormat, setOutputFormat] = useState("customerName, phone, need, budget, followUpAt");
  const [runText, setRunText] = useState("");
  const [runFiles, setRunFiles] = useState<File[]>([]);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (!selected) return;
    apiFetch<WorkflowRun[]>(`/workflows/${selected.id}/runs`).then(setRuns).catch(console.error);
  }, [selected]);

  async function loadWorkflows() {
    const data = await apiFetch<Workflow[]>("/workflows");
    setWorkflows(data);
    setSelected((current) => current ?? data[0] ?? null);
  }

  async function createWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await apiFetch<Workflow>("/workflows", {
      method: "POST",
      body: JSON.stringify({ name, inputType, extractionPrompt, outputFormat })
    });
    setWorkflows((items) => [created, ...items]);
    setSelected(created);
  }

  function onFiles(event: ChangeEvent<HTMLInputElement>) {
    setRunFiles(Array.from(event.target.files ?? []));
  }

  async function runWorkflow() {
    if (!selected) return;
    const run = await apiFetch<WorkflowRun>(`/workflows/${selected.id}/run`, {
      method: "POST",
      body: JSON.stringify({
        text: runText,
        inputFiles: runFiles.map((file) => ({ name: file.name, size: file.size, type: file.type }))
      })
    });
    setRuns((items) => [run, ...items]);
  }

  async function exportCsv(runId: string) {
    const csv = await apiFetch<string>(`/workflows/runs/${runId}/export-csv`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workflow-run-${runId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  const latestRun = runs[0];
  const columns = useMemo(() => latestRun?.result?.columns ?? ["customerName", "phone", "need", "budget", "followUpAt"], [latestRun]);
  const rows = latestRun?.result?.rows ?? [];

  return (
    <div>
      <PageHeader title="DIY Workflow Studio" />

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>工作流模板</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createWorkflow}>
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inputType">输入类型</Label>
                <select
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
                  id="inputType"
                  value={inputType}
                  onChange={(event) => setInputType(event.target.value as Workflow["inputType"])}
                >
                  <option value="image">图片</option>
                  <option value="pdf">PDF 占位</option>
                  <option value="text">文本</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">提取 Prompt</Label>
                <Textarea id="prompt" value={extractionPrompt} onChange={(event) => setExtractionPrompt(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output">输出格式</Label>
                <Input id="output" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)} />
              </div>
              <Button className="w-full" type="submit">
                <Plus className="h-4 w-4" />
                创建模板
              </Button>
            </form>
            <div className="mt-5 space-y-2">
              {workflows.map((workflow) => (
                <button
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                    selected?.id === workflow.id ? "border-ink bg-neutral-50" : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                  key={workflow.id}
                  onClick={() => setSelected(workflow)}
                  type="button"
                >
                  <span className="font-medium text-ink">{workflow.name}</span>
                  <span className="ml-2 text-xs text-neutral-500">{workflow.inputType}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{selected ? `运行：${selected.name}` : "批量运行"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={runText} onChange={(event) => setRunText(event.target.value)} placeholder="粘贴客户聊天内容或补充说明" />
              <Input type="file" multiple accept="image/*,.pdf,text/plain" onChange={onFiles} />
              <div className="flex flex-wrap gap-2">
                <Button onClick={runWorkflow} disabled={!selected}>
                  <Play className="h-4 w-4" />
                  批量运行
                </Button>
                {latestRun ? (
                  <Button variant="outline" onClick={() => exportCsv(latestRun.id)}>
                    <Download className="h-4 w-4" />
                    CSV 导出
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>输出表格结果</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    {columns.map((column) => (
                      <TH key={column}>{column}</TH>
                    ))}
                  </TR>
                </THead>
                <TBody>
                  {rows.map((row, index) => (
                    <TR key={index}>
                      {columns.map((column) => (
                        <TD key={column}>{row[column] ?? ""}</TD>
                      ))}
                    </TR>
                  ))}
                </TBody>
              </Table>
              {!rows.length ? <p className="mt-4 text-sm text-neutral-500">暂无运行结果</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
