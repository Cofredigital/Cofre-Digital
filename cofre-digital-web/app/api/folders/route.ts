// app/api/folders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "session";

async function getUidFromSessionCookie() {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch (e) {
    return null;
  }
}

// ✅ GET = listar pastas do usuário
export async function GET() {
  const uid = await getUidFromSessionCookie();
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Not logged" }, { status: 401 });
  }

  const snap = await adminDb
    .collection("users")
    .doc(uid)
    .collection("folders")
    .orderBy("createdAt", "desc")
    .get();

  const folders = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ ok: true, folders });
}

// ✅ POST = criar pasta
export async function POST(req: Request) {
  const uid = await getUidFromSessionCookie();
  if (!uid) {
    return NextResponse.json({ ok: false, error: "Not logged" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing folder name" },
      { status: 400 }
    );
  }

  const docRef = await adminDb
    .collection("users")
    .doc(uid)
    .collection("folders")
    .add({
      name: name.trim(),
      createdAt: new Date(),
    });

  return NextResponse.json({ ok: true, id: docRef.id });
}
