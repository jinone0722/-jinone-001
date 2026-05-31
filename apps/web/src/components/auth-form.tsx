"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@worksphere/ui";
import { apiFetch, setToken } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ token: string }>(mode === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name })
      });
      setToken(response.token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-marine">WorkSphere AI</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">{isLogin ? "欢迎回来" : "创建工作台"}</h1>
        </div>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{isLogin ? "登录" : "注册"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              {!isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane" />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "处理中..." : isLogin ? "进入 Dashboard" : "创建账号"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-neutral-500">
              {isLogin ? "还没有账号？" : "已有账号？"}
              <Link className="ml-1 font-medium text-marine" href={isLogin ? "/register" : "/login"}>
                {isLogin ? "注册" : "登录"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
