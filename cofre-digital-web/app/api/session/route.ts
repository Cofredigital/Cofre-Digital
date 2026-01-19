import { NextResponse } from "next/server";
import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin env vars missing");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function POST(req: Request) {
  try {
    initAdmin();

    const body = await req.json().catch(() => null);
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Missing idToken" },
        { status: 400 }
      );
    }

    // duração da sessão (ex: 5 dias)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // cria cookie de sessão real (seguro)
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return res;
  } catch (err: any) {
    console.error("POST /api/session error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Session error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
