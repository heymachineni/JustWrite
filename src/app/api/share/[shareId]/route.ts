export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSharedPage } from "@/lib/firebase/shared-pages";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    if (!shareId || !/^s_[a-zA-Z0-9_-]+$/.test(shareId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const page = await getSharedPage(shareId);
    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("[share/get]", error);
    return NextResponse.json(
      { error: "Could not load shared page." },
      { status: 500 }
    );
  }
}
