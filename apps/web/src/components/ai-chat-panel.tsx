"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button, Textarea } from "@worksphere/ui";
import { apiFetch } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好，我可以整理记录、查找资料、提取图片文字、生成日报或创建提醒草稿。" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setMessages((items) => [...items, { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    try {
      const response = await apiFetch<{ answer: string }>("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message })
      });
      setMessages((items) => [...items, { role: "assistant", content: response.answer }]);
    } catch (err) {
      setMessages((items) => [
        ...items,
        { role: "assistant", content: err instanceof Error ? err.message : "AI 请求失败" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="fixed right-0 top-0 z-20 hidden h-screen w-96 flex-col border-l border-neutral-200 bg-white/92 backdrop-blur xl:flex">
      <div className="flex h-16 items-center gap-3 border-b border-neutral-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">AI 助手</p>
          <p className="text-xs text-neutral-500">仅检索当前用户资料</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message, index) => (
          <div
            className={
              message.role === "user"
                ? "ml-8 rounded-lg bg-ink px-3 py-2 text-sm text-white"
                : "mr-8 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
            }
            key={`${message.role}-${index}`}
          >
            {message.content}
          </div>
        ))}
        {loading ? (
          <div className="mr-8 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
            <Sparkles className="h-4 w-4" />
            生成中...
          </div>
        ) : null}
      </div>
      <form className="border-t border-neutral-200 p-4" onSubmit={onSubmit}>
        <Textarea
          className="min-h-24 resize-none"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="帮我整理今天记录"
        />
        <Button className="mt-3 w-full" type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
          发送
        </Button>
      </form>
    </aside>
  );
}
