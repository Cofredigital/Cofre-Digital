import { NextResponse } from "next/server";
import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return;

  const json = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;

  if (!json) {
    throw new Error("Missing FIREBASE_ADMIN_CREDENTIALS_JSON");
  }

  const serviceAccount = JSON.parse(json);

  // ✅ garante quebras de linha do private_key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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

    // duração da sessão: 5 dias
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // ✅ cria o cookie real de sessão do Firebase
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
