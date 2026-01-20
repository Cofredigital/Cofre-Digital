import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const DEFAULT_FOLDERS = [
  { name: "Bancos", icon: "🏦", color: "blue" },
  { name: "Escrituras", icon: "📜", color: "gold" },
  { name: "Cartório", icon: "🏛️", color: "gray" },
  { name: "Documentos", icon: "📁", color: "blue" },
  { name: "Médicos", icon: "🩺", color: "red" },
  { name: "Impostos", icon: "🧾", color: "green" },
  { name: "Casa", icon: "🏠", color: "gold" },
  { name: "Trabalho", icon: "💼", color: "blue" },
  { name: "Igreja", icon: "⛪", color: "gold" },
  { name: "Diversão", icon: "🎮", color: "purple" },
];

export async function POST() {
  try {
    // ✅ Next.js novo: cookies() é async
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { ok: false, error: "not-authenticated" },
        { status: 401 }
      );
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const foldersRef = adminDb.collection("users").doc(uid).collection("folders");

    const existing = await foldersRef.limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ ok: true, alreadySeeded: true });
    }

    const batch = adminDb.batch();
    const now = new Date();

    DEFAULT_FOLDERS.forEach((f, index) => {
      const docRef = foldersRef.doc();
      batch.set(docRef, {
        name: f.name,
        icon: f.icon,
        color: f.color,
        createdAt: now,
        order: index,
      });
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      seeded: true,
      count: DEFAULT_FOLDERS.length,
    });
  } catch (err: any) {
    console.error("Seed folders error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "seed-error" },
      { status: 500 }
    );
  }
}
