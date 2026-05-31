"use client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("worksphere_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("worksphere_token", token);
}

export function clearToken() {
  window.localStorage.removeItem("worksphere_token");
}

export function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE === "/api") return `${API_BASE}${cleanPath}`;
  return `${API_BASE.replace(/\/$/, "")}${cleanPath}`;
}

export function assetUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (API_BASE.startsWith("http")) return `${API_BASE.replace(/\/$/, "")}${url}`;
  return url;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  if (!isFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), {
    ...init,
    headers
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) return (await response.text()) as T;
  return response.json() as Promise<T>;
}
