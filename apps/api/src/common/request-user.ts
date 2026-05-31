import type { Request } from "express";

export type RequestUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type AuthenticatedRequest = Request & {
  user: RequestUser;
};
