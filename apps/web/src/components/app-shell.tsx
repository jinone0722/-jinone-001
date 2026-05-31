"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Search,
  Settings2,
  Workflow
} from "lucide-react";
import { Button } from "@worksphere/ui";
import { apiFetch, clearToken } from "@/lib/api";
import type { User } from "@/lib/types";
import { AiChatPanel } from "./ai-chat-panel";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "记录", icon: FileText },
  { href: "/images", label: "图片", icon: Image },
  { href: "/reminders", label: "提醒", icon: Bell },
  { href: "/workflows", label: "工作流", icon: Workflow },
  { href: "/search", label: "搜索", icon: Search },
  { href: "/tools", label: "工具", icon: Settings2 }
];

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ user: User }>("/auth/me")
      .then((response) => setUser(response.user))
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-neutral-500">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-neutral-200 bg-white/88 px-4 py-5 backdrop-blur md:block">
        <Link className="flex items-center gap-3 px-2" href="/dashboard">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">WorkSphere AI</p>
            <p className="text-xs text-neutral-500">{user?.name || user?.email}</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  active ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-ink"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button className="absolute bottom-5 left-4 right-4" variant="ghost" onClick={logout}>
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </aside>

      <div className="border-b border-neutral-200 bg-white/88 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link className="font-semibold text-ink" href="/dashboard">
            WorkSphere AI
          </Link>
          <Button size="sm" variant="ghost" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs ${
                pathname === item.href ? "bg-ink text-white" : "bg-white text-neutral-600"
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="min-h-screen px-4 py-6 md:pl-72 md:pr-8 xl:pr-[26rem]">{children}</main>
      <AiChatPanel />
    </div>
  );
}
