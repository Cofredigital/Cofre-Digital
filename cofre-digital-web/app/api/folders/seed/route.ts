// cofre-digital-web/app/api/folders/seed/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

type DefaultFolder = {
  name: string;
  icon: string;
  color: "blue" | "gold";
};

const DEFAULT_FOLDERS: DefaultFolder[] = [
  { name: "Bancos", icon: "bank", color: "blue" },
  { name: "Igreja", icon: "church", color: "gold" },
  { name: "Escrituras", icon: "book", color: "blue" },
  { name: "Cartório", icon: "file", color: "gold" },
  { name: "Saúde / Médicos", icon: "health", color: "blue" },
  { name: "Contas a pagar", icon: "bill", color: "gold" },
  { name: "Senhas", icon: "lock", color: "blue" },
  { name: "Trabalho", icon: "briefcase", color: "gold" },
  { name: "Veículos", icon: "car", color: "blue" },
  { name: "Família", icon: "family", color: "gold" },
  { name: "Impostos", icon: "tax", color: "blue" },
];

async function getUidFromSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

// ✅ GET (para testar no browser)
export async function GET() {
  try {
    const uid = await getUidFromSessionCookie();
    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "not-authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Seed endpoint OK. Use POST to seed default folders.",
      uid,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "seed-get-error" },
      { status: 500 }
    );
  }
}

// ✅ POST (cria as pastas padrão)
export async function POST() {
  try {
    const uid = await getUidFromSessionCookie();

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "not-authenticated" },
        { status: 401 }
      );
    }

    const foldersCol = adminDb
      .collection("users")
      .doc(uid)
      .collection("folders");

    // se já tem pasta, não recria
    const existing = await foldersCol.limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({
        ok: true,
        seeded: false,
        reason: "already-has-folders",
      });
    }

    const now = Date.now();
    const batch = adminDb.batch();

    DEFAULT_FOLDERS.forEach((f, index) => {
      const ref = foldersCol.doc();

      batch.set(ref, {
        name: f.name,
        icon: f.icon,
        color: f.color,
        createdAt: now,
        order: index,
        isDefault: true,
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
