"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import type { Reminder } from "@/lib/types";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remindAt, setRemindAt] = useState(() => toDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)));

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    const data = await apiFetch<Reminder[]>("/reminders");
    setReminders(data);
  }

  async function createReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await apiFetch<Reminder>("/reminders", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        remindAt: new Date(remindAt).toISOString()
      })
    });
    setReminders((items) => [...items, created].sort((a, b) => +new Date(a.remindAt) - +new Date(b.remindAt)));
    setTitle("");
    setDescription("");
  }

  async function markDone(reminder: Reminder) {
    const updated = await apiFetch<Reminder>(`/reminders/${reminder.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: reminder.status === "done" ? "pending" : "done" })
    });
    setReminders((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function remove(id: string) {
    await apiFetch(`/reminders/${id}`, { method: "DELETE" });
    setReminders((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div>
      <PageHeader title="提醒系统" />

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>新建提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createReminder}>
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remindAt">提醒时间</Label>
                <Input id="remindAt" type="datetime-local" value={remindAt} onChange={(event) => setRemindAt(event.target.value)} required />
              </div>
              <Button className="w-full" type="submit">
                <Plus className="h-4 w-4" />
                保存提醒
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>按时间展示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((reminder) => (
              <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4" key={reminder.id}>
                <button className="mt-0.5 text-marine" onClick={() => markDone(reminder)} type="button" title="标记完成">
                  <CheckCircle2 className={reminder.status === "done" ? "h-5 w-5 fill-marine text-white" : "h-5 w-5"} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${reminder.status === "done" ? "text-neutral-400 line-through" : "text-ink"}`}>{reminder.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{new Date(reminder.remindAt).toLocaleString()}</p>
                  {reminder.description ? <p className="mt-2 text-sm text-neutral-600">{reminder.description}</p> : null}
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(reminder.id)} title="删除提醒">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}
