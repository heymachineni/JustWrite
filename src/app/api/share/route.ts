export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { JSONContent } from "@tiptap/react";
import {
  deleteSharedPage,
  upsertSharedPage,
  type SharedPageRecord,
} from "@/lib/firebase/shared-pages";

const SHARE_ID_RE = /^s_[a-zA-Z0-9_-]+$/;
const MAX_PAYLOAD_BYTES = 512_000;

function isValidShareId(shareId: unknown): shareId is string {
  return typeof shareId === "string" && SHARE_ID_RE.test(shareId);
}

function parseRecord(body: Record<string, unknown>): SharedPageRecord | null {
  const { title, content, createdAt, updatedAt } = body;
  if (typeof updatedAt !== "number") return null;

  return {
    title: typeof title === "string" ? title.slice(0, 200) : "",
    content: (content as JSONContent | null) ?? null,
    createdAt: typeof createdAt === "number" ? createdAt : updatedAt,
    updatedAt,
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ error: "Page is too large to share." }, { status: 413 });
    }

    const body = JSON.parse(raw) as Record<string, unknown>;
    const shareId = body.shareId;

    if (!isValidShareId(shareId)) {
      return NextResponse.json({ error: "Invalid share id." }, { status: 400 });
    }

    const record = parseRecord(body);
    if (!record) {
      return NextResponse.json({ error: "Invalid page data." }, { status: 400 });
    }

    await upsertSharedPage(shareId, record);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[share/publish]", error);
    const message =
      error instanceof Error ? error.message : "Could not publish link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { shareId?: string };
    if (!isValidShareId(body.shareId)) {
      return NextResponse.json({ error: "Invalid share id." }, { status: 400 });
    }

    await deleteSharedPage(body.shareId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[share/unpublish]", error);
    return NextResponse.json(
      { error: "Could not stop sharing." },
      { status: 500 }
    );
  }
}
