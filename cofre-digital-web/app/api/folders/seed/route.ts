// app/api/folders/seed/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "cofre_session";

const DEFAULT_FOLDERS = [
  { name: "Bancos e cartões", icon: "🏦", color: "blue" },
  { name: "Contas a pagar", icon: "💳", color: "blue" },
  { name: "Documentos pessoais", icon: "🧾", color: "blue" },
  { name: "Cartório e certidões", icon: "🏛️", color: "blue" },
  { name: "Saúde e médicos", icon: "🏥", color: "blue" },
  { name: "Casa e imóveis", icon: "🏠", color: "blue" },
  { name: "Veículos", icon: "🚗", color: "blue" },
  { name: "Streaming e assinaturas", icon: "📺", color: "blue" },
  { name: "Trabalho e renda", icon: "💼", color: "blue" },
  { name: "Senhas e acessos", icon: "🔐", color: "gold" },
  { name: "Igreja", icon: "🙏", color: "gold" },
];

export async function POST() {
  try {
    // ✅ Next.js mais novo: cookies() é async
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

    // ✅ se já tiver pastas, não cria de novo
    const existingSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("folders")
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({
        ok: true,
        seeded: false,
        message: "already-has-folders",
      });
    }

    // ✅ criar pastas padrão
    const batch = adminDb.batch();
    const now = new Date();

    DEFAULT_FOLDERS.forEach((f, index) => {
      const ref = adminDb
        .collection("users")
        .doc(uid)
        .collection("folders")
        .doc();

      batch.set(ref, {
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
