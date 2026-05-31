export type User = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
};

export type Note = {
  id: string;
  title?: string | null;
  content: string;
  type: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ImageAsset = {
  id: string;
  imageUrl: string;
  originalName?: string | null;
  ocrText?: string | null;
  aiSummary?: string | null;
  extractedData?: Record<string, unknown> | null;
  tags: string[];
  createdAt: string;
};

export type FileAsset = {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  extractedText?: string | null;
  aiSummary?: string | null;
  tags: string[];
  createdAt: string;
};

export type LinkAsset = {
  id: string;
  title?: string | null;
  url: string;
  description?: string | null;
  category?: string | null;
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  description?: string | null;
  remindAt: string;
  status: "pending" | "done";
  createdAt: string;
  updatedAt: string;
};

export type Workflow = {
  id: string;
  name: string;
  inputType: "image" | "pdf" | "text";
  extractionPrompt: string;
  outputFormat: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  status: string;
  inputFiles?: unknown;
  result?: {
    columns?: string[];
    rows?: Record<string, string>[];
  };
  createdAt: string;
};
