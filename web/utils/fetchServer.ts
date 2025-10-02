"use server"

import { cookies, headers } from "next/headers";

export type ApiResponse<TBody> = {
  success: boolean;
  message: string;
  data: TBody | null;
  errors: FormErrors | null;
};

export type FormErrors = {
  errorMessage: string;
  fieldName: string;
}[] | null;

export type EmptyBody = Record<string, unknown>;

async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function fetchGET<T>(
  path: string,
  options: Omit<RequestInit, "method" | "headers"> = {}
): Promise<ApiResponse<T>> {
  const baseUrl = await getRequestOrigin();
  const setCookie = await cookies()

  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Cookie": setCookie.toString(),
    },
    ...options
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
