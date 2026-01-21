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

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

async function getUidFromSessionCookie() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

// ✅ GET (só pra testar no navegador)
export async function GET() {
  return POST();
}

// ✅ POST (cria somente pastas que faltam)
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

    // 1) buscar pastas existentes
    const snap = await foldersCol.get();

    const existingNames = new Set<string>();
    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (typeof data?.name === "string") {
        existingNames.add(normalizeName(data.name));
      }
    });

    // 2) filtrar somente as que faltam
    const missing = DEFAULT_FOLDERS.filter(
      (f) => !existingNames.has(normalizeName(f.name))
    );

    if (missing.length === 0) {
      return NextResponse.json({
        ok: true,
        seeded: false,
        created: 0,
        reason: "nothing-to-create",
        uid,
      });
    }

    // 3) criar somente as faltantes
    const now = Date.now();
    const batch = adminDb.batch();

    // pega maior order atual (pra não bagunçar)
    const existingOrders = snap.docs
      .map((d) => d.data()?.order)
      .filter((o) => typeof o === "number") as number[];

    let startOrder =
      existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 0;

    missing.forEach((f, index) => {
      const ref = foldersCol.doc();

      batch.set(ref, {
        name: f.name,
        icon: f.icon,
        color: f.color,
        createdAt: now,
        order: startOrder + index,
        isDefault: true,
      });
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      seeded: true,
      uid,
      created: missing.length,
      createdNames: missing.map((m) => m.name),
    });
  } catch (err: any) {
    console.error("Seed folders error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "seed-error" },
      { status: 500 }
    );
  }
}
