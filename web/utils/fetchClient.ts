"use client";

import type { ApiResponse } from "@/types/api";

export async function fetchGET<T>(
  path: string,
  options: Omit<RequestInit, "method" | "headers"> = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const isOK = res.ok;
  const resBody = await res.json();
  return {
    success: isOK,
    message: resBody.message,
    data: isOK ? (resBody.data as T) : null,
    errors: !isOK ? resBody.errors : null,
  };
}

export async function fetchPOST<T = unknown>(
  path: string,
  body: unknown,
  options: Omit<RequestInit, "method"> = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

  const isOK = res.ok;
  const resBody = await res.json();
  return {
    success: isOK,
    message: resBody.message,
    data: isOK ? (resBody.data as T) : null,
    errors: !isOK ? resBody.errors : null,
  };
}
