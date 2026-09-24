export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === "object" && "code" in error && error.code === "ERR_CANCELED") {
    return true;
  }
  if (error instanceof Error && error.name === "CanceledError") return true;
  if (typeof error === "object" && "name" in error && error.name === "AbortError") {
    return true;
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
