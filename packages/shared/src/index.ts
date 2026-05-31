export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export type SearchResult = {
  type: "note" | "image" | "file" | "link" | "reminder";
  id: string;
  title: string;
  snippet: string;
  createdAt?: string;
};

export const WORKFLOW_INPUT_TYPES = ["image", "pdf", "text"] as const;
export type WorkflowInputType = (typeof WORKFLOW_INPUT_TYPES)[number];
