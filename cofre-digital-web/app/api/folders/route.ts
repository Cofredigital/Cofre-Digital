// cofre-digital-web/app/api/folders/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const SESSION_COOKIE_NAME = "session";

export async function GET() {
  try {
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

    const foldersCol = adminDb.collection("users").doc(uid).collection("folders");

    // ✅ pega TUDO sem orderBy (evita query falhar/excluir docs)
    const snap = await foldersCol.get();

    const folders = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const ao = typeof a.order === "number" ? a.order : 999999;
        const bo = typeof b.order === "number" ? b.order : 999999;
        return ao - bo;
      });

    return NextResponse.json({
      ok: true,
      uid,
      count: folders.length,
      folders,
    });
  } catch (err: any) {
    console.error("List folders error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "list-folders-error" },
      { status: 500 }
    );
  }
}
