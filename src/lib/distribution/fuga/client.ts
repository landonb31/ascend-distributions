import { createHash } from "crypto";
import { readFileSync } from "fs";
import { basename } from "path";
import { getFugaConfig } from "@/lib/distribution/config";

type FugaResponse<T = unknown> = {
  success: boolean;
  statusCode: number | null;
  data?: T;
  error?: { message: string; details?: unknown };
};

export class FugaClient {
  private apiUrl: string;
  private cookie: string | null = null;

  constructor(
    private username: string,
    private password: string,
    apiUrl?: string
  ) {
    const config = getFugaConfig();
    this.apiUrl = (apiUrl || config.apiUrl).replace(/\/$/, "");
  }

  static fromEnv() {
    const config = getFugaConfig();
    if (!config.username || !config.password) {
      throw new Error("FUGA credentials are not configured");
    }
    return new FugaClient(config.username, config.password, config.apiUrl);
  }

  async login() {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: this.username, password: this.password }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`FUGA login failed (${response.status}): ${text}`);
    }

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      this.cookie = setCookie.split(";")[0];
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean>;
    }
  ): Promise<FugaResponse<T>> {
    if (!this.cookie) {
      await this.login();
    }

    const url = new URL(`${this.apiUrl}${endpoint}`);
    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {};
    if (this.cookie) headers.Cookie = this.cookie;

    let body: BodyInit | undefined;
    if (options?.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { method, headers, body });
    const contentType = response.headers.get("content-type") || "";

    let data: unknown;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      return { success: true, statusCode: response.status, data: data as T };
    }

    const errorMessage =
      typeof data === "object" && data !== null
        ? JSON.stringify(data)
        : String(data);

    return {
      success: false,
      statusCode: response.status,
      error: { message: errorMessage, details: data },
    };
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>) {
    return this.request<T>("GET", endpoint, { params });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>("POST", endpoint, { body });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>("PUT", endpoint, { body });
  }

  delete<T>(endpoint: string, body?: unknown) {
    return this.request<T>("DELETE", endpoint, { body });
  }

  async uploadFile(
    filePath: string,
    uploadMeta: Record<string, unknown>,
    chunkSize = 5 * 1024 * 1024
  ) {
    const fileBuffer = readFileSync(filePath);
    return this.uploadBuffer(fileBuffer, basename(filePath), uploadMeta, chunkSize);
  }

  async uploadBuffer(
    fileBuffer: Buffer,
    fileName: string,
    uploadMeta: Record<string, unknown>,
    chunkSize = 5 * 1024 * 1024
  ) {
    const start = await this.post<{ id: string }>("/upload/start", uploadMeta);
    if (!start.success || !start.data) {
      throw new Error(start.error?.message || "FUGA upload start failed");
    }

    const uploadId =
      typeof start.data === "object" && start.data !== null && "id" in start.data
        ? String((start.data as { id: string }).id)
        : null;

    if (!uploadId) {
      throw new Error("FUGA upload session missing id");
    }

    const totalSize = fileBuffer.length;
    const totalParts = Math.ceil(totalSize / chunkSize);
    const md5 = createHash("md5");

    for (let partIndex = 0; partIndex < totalParts; partIndex++) {
      const offset = partIndex * chunkSize;
      const chunk = fileBuffer.subarray(offset, Math.min(offset + chunkSize, totalSize));
      md5.update(chunk);

      const form = new FormData();
      form.append("uuid", uploadId);
      form.append("filename", fileName);
      form.append("totalfilesize", String(totalSize));
      form.append("partindex", String(partIndex));
      form.append("partbyteoffset", String(offset));
      form.append("totalparts", String(totalParts));
      form.append("file", new Blob([new Uint8Array(chunk)]), fileName);

      if (!this.cookie) await this.login();

      const response = await fetch(`${this.apiUrl}/upload`, {
        method: "POST",
        headers: {
          Cookie: this.cookie!,
          "Content-Range": `bytes ${offset}-${offset + chunk.length - 1}/${totalSize}`,
        },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`FUGA chunk upload failed (${response.status}): ${text}`);
      }
    }

    const finish = await this.post("/upload/finish", {
      uuid: uploadId,
      filename: fileName,
      md5sum: md5.digest("hex"),
    });

    if (!finish.success) {
      throw new Error(finish.error?.message || "FUGA upload finish failed");
    }

    return finish;
  }
}
