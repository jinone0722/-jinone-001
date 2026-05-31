import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { basename, extname, isAbsolute, join, relative, resolve } from "node:path";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

export function uploadRoot() {
  const root = resolve(process.env.UPLOAD_DIR ?? "./uploads");
  mkdirSync(root, { recursive: true });
  return root;
}

export function uploadFolder(folder: string) {
  const safeFolder = folder.replace(/[^a-z0-9-_]/gi, "");
  const target = join(uploadRoot(), safeFolder);
  mkdirSync(target, { recursive: true });
  return target;
}

export function storageFor(folder: string) {
  return diskStorage({
    destination: uploadFolder(folder),
    filename: (_req, file, callback) => {
      const rawExt = extname(file.originalname).toLowerCase();
      const ext = rawExt && rawExt.length <= 10 ? rawExt : "";
      const safeBase = basename(file.originalname, rawExt).replace(/[^a-z0-9-_]/gi, "-").slice(0, 60);
      callback(null, `${Date.now()}-${randomUUID()}-${safeBase || "upload"}${ext}`);
    }
  });
}

export const imageUploadOptions = {
  storage: storageFor("images"),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException("Only jpeg, png, webp and gif images are allowed"), false);
      return;
    }
    callback(null, true);
  }
};

export const fileUploadOptions = {
  storage: storageFor("files"),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!FILE_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException("Unsupported file type"), false);
      return;
    }
    callback(null, true);
  }
};

export function publicUploadUrl(folder: "images" | "files", filename: string) {
  return `/uploads/${folder}/${filename}`;
}

export async function removeStoredUpload(publicUrl?: string | null) {
  if (!publicUrl?.startsWith("/uploads/")) return;
  const root = uploadRoot();
  const target = resolve(root, publicUrl.replace(/^\/uploads\/?/, ""));
  const rel = relative(root, target);
  if (rel.startsWith("..") || isAbsolute(rel)) return;
  await unlink(target).catch(() => undefined);
}
