"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, FileText, Image as ImageIcon, Link2, Sparkles, Workflow } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch, assetUrl } from "@/lib/api";
import type { FileAsset, ImageAsset, LinkAsset, Note, Reminder, Workflow as WorkflowType } from "@/lib/types";

type DashboardData = {
  greeting: string;
  todayReminders: Reminder[];
  todayTodos: Reminder[];
  recentNotes: Note[];
  recentImages: ImageAsset[];
  recentFiles: FileAsset[];
  recentLinks: LinkAsset[];
  workflows: WorkflowType[];
  stats: {
    remindersToday: number;
    pendingTodos: number;
    recentNotes: number;
    recentImages: number;
  };
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [quickNote, setQuickNote] = useState("");
  const [quickNoteId, setQuickNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<DashboardData>("/dashboard").then(setDashboard).catch(console.error);
  }, []);

  useEffect(() => {
    const text = quickNote.trim();
    if (!text) return;
    const timeout = window.setTimeout(async () => {
      setSaving(true);
      const title = text.split("\n")[0].slice(0, 48);
      try {
        const saved = quickNoteId
          ? await apiFetch<Note>(`/notes/${quickNoteId}`, {
              method: "PATCH",
              body: JSON.stringify({ title, content: quickNote })
            })
          : await apiFetch<Note>("/notes", {
              method: "POST",
              body: JSON.stringify({ title, content: quickNote, type: "quick" })
            });
        setQuickNoteId(saved.id);
        setDashboard((current) =>
          current
            ? {
                ...current,
                recentNotes: [saved, ...current.recentNotes.filter((item) => item.id !== saved.id)].slice(0, 6)
              }
            : current
        );
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [quickNote, quickNoteId]);

  const stats = dashboard?.stats;

  return (
    <div>
      <PageHeader title={dashboard?.greeting || "Dashboard"}>
        <Link href="/search">
          <Button variant="outline">
            全局搜索
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="今日提醒" value={stats?.remindersToday ?? 0} icon={<Bell className="h-4 w-4" />} />
        <MetricCard label="今日待办" value={stats?.pendingTodos ?? 0} icon={<FileText className="h-4 w-4" />} />
        <MetricCard label="最近记录" value={stats?.recentNotes ?? 0} icon={<Sparkles className="h-4 w-4" />} />
        <MetricCard label="最近图片" value={stats?.recentImages ?? 0} icon={<ImageIcon className="h-4 w-4" />} />
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>快速记录</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="min-h-40 resize-none text-base"
              value={quickNote}
              onChange={(event) => setQuickNote(event.target.value)}
              placeholder="输入想法、客户信息、会议要点..."
            />
            <p className="mt-3 text-sm text-neutral-500">{saving ? "自动保存中..." : quickNoteId ? "已自动保存" : "输入后自动保存"}</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>今日提醒</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard?.todayReminders ?? []).length ? (
              dashboard?.todayReminders.map((item) => (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3" key={item.id}>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{new Date(item.remindAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">今天暂无提醒</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <ListCard title="今日待办" items={dashboard?.todayTodos.map((item) => item.title) ?? []} href="/reminders" />
        <ListCard title="最近记录" items={dashboard?.recentNotes.map((item) => item.title || item.content.slice(0, 40)) ?? []} href="/notes" />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>最近图片</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {(dashboard?.recentImages ?? []).slice(0, 6).map((item) => (
                <img
                  alt={item.originalName || "uploaded image"}
                  className="aspect-square rounded-lg border border-neutral-200 object-cover"
                  key={item.id}
                  src={assetUrl(item.imageUrl)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <ListCard title="最近文件" items={dashboard?.recentFiles.map((item) => item.filename) ?? []} href="/tools" />
        <ListCard title="最近网址" items={dashboard?.recentLinks.map((item) => item.title || item.url) ?? []} href="/search" />
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <EntryCard href="/search" icon={<Sparkles className="h-5 w-5" />} title="AI 助手入口" />
        <EntryCard href="/workflows" icon={<Workflow className="h-5 w-5" />} title="DIY 工作流入口" />
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-marine">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items, href }: { title: string; items: string[]; href: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Link className="text-sm font-medium text-marine" href={href}>
          查看
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length ? (
          items.slice(0, 5).map((item, index) => (
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700" key={`${item}-${index}`}>
              <Badge>{index + 1}</Badge>
              <span className="truncate">{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500">暂无内容</p>
        )}
      </CardContent>
    </Card>
  );
}

function EntryCard({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-neutral-300 hover:bg-neutral-50">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">{icon}</div>
            <p className="font-semibold text-ink">{title}</p>
          </div>
          <Link2 className="h-4 w-4 text-neutral-400" />
        </CardContent>
      </Card>
    </Link>
  );
}
