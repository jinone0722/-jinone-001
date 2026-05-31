"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "@worksphere/ui";
import { PageHeader } from "@/components/page-header";
import { apiFetch } from "@/lib/api";
import type { Note } from "@/lib/types";

type Draft = Pick<Note, "title" | "content" | "tags" | "isFavorite" | "type">;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Note | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadNotes, 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!selected || !draft || !dirty) return;
    const timeout = window.setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await apiFetch<Note>(`/notes/${selected.id}`, {
          method: "PATCH",
          body: JSON.stringify(draft)
        });
        setSelected(saved);
        setNotes((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
        setDirty(false);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [selected, draft, dirty]);

  async function loadNotes() {
    const data = await apiFetch<Note[]>(`/notes${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    setNotes(data);
    if (!selected && data[0]) selectNote(data[0]);
  }

  function selectNote(note: Note) {
    setSelected(note);
    setDraft({
      title: note.title,
      content: note.content,
      tags: note.tags,
      isFavorite: note.isFavorite,
      type: note.type
    });
    setDirty(false);
  }

  async function createNote() {
    const note = await apiFetch<Note>("/notes", {
      method: "POST",
      body: JSON.stringify({ title: "未命名记录", content: "", tags: [] })
    });
    setNotes((items) => [note, ...items]);
    selectNote(note);
  }

  async function deleteNote(id: string) {
    await apiFetch(`/notes/${id}`, { method: "DELETE" });
    setNotes((items) => items.filter((item) => item.id !== id));
    if (selected?.id === id) {
      setSelected(null);
      setDraft(null);
    }
  }

  function updateDraft(update: Partial<Draft>) {
    setDraft((current) => (current ? { ...current, ...update } : current));
    setDirty(true);
  }

  const tagsText = useMemo(() => draft?.tags.join(", ") ?? "", [draft?.tags]);

  return (
    <div>
      <PageHeader title="快速记录">
        <Button onClick={createNote}>
          <Plus className="h-4 w-4" />
          新建记录
        </Button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>记录列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索记录" />
            </div>
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selected?.id === note.id ? "border-ink bg-neutral-50" : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                  key={note.id}
                  onClick={() => selectNote(note)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink">{note.title || "未命名记录"}</p>
                    {note.isFavorite ? <Star className="h-4 w-4 fill-marine text-marine" /> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-neutral-500">{note.content || "空记录"}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[620px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>编辑</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">{saving ? "保存中..." : dirty ? "待保存" : "已保存"}</span>
              {selected ? (
                <Button size="icon" variant="ghost" onClick={() => deleteNote(selected.id)} title="删除记录">
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {draft ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">标题</Label>
                  <Input id="title" value={draft.title ?? ""} onChange={(event) => updateDraft({ title: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    className="min-h-80 resize-none text-base leading-7"
                    value={draft.content}
                    onChange={(event) => updateDraft({ content: event.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="tags">标签</Label>
                    <Input
                      id="tags"
                      value={tagsText}
                      onChange={(event) =>
                        updateDraft({
                          tags: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        })
                      }
                      placeholder="客户, 会议, 报销"
                    />
                  </div>
                  <Button
                    className="self-end"
                    variant={draft.isFavorite ? "default" : "outline"}
                    onClick={() => updateDraft({ isFavorite: !draft.isFavorite })}
                  >
                    <Star className={draft.isFavorite ? "h-4 w-4 fill-white" : "h-4 w-4"} />
                    收藏
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-96 items-center justify-center text-sm text-neutral-500">选择或新建一条记录</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
