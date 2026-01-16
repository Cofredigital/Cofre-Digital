import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Missing idToken" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("session", idToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  return res;
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
