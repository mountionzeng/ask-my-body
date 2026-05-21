import { NextRequest } from "next/server";

/** Verify Vercel Cron secret from Authorization header */
export function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // misconfigured — reject
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

/** Verify iOS Shortcut secret from x-shortcut-secret header or query param */
export function verifyShortcutSecret(req: NextRequest): boolean {
  const secret = process.env.SHORTCUT_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-shortcut-secret") ?? "";
  const param = new URL(req.url).searchParams.get("secret") ?? "";
  return header === secret || param === secret;
}
