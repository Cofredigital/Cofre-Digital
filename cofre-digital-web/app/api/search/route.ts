// cofre-digital-web/app/api/search/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ ok: true, q, results: [] });
    }

    // ✅ autenticação pelo cookie de sessão
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

    // ✅ 1) Buscar pastas
    const foldersSnap = await adminDb
      .collection("users")
      .doc(uid)
      .collection("folders")
      .get();

    const folderDocs = foldersSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    // ✅ 2) Para cada pasta: buscar itens da pasta + itens das subpastas
    const results: any[] = [];

    for (const folder of folderDocs) {
      const folderId = folder.id;
      const folderName = folder.name || "Pasta sem nome";

      // ✅ itens da pasta
      const itemsSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("pastas")
        .doc(folderId)
        .collection("itens")
        .get();

      for (const it of itemsSnap.docs) {
        const data = it.data() as any;
        const titulo = (data?.titulo || "").toLowerCase();
        const conteudo = (data?.conteudo || "").toLowerCase();

        if (titulo.includes(q) || conteudo.includes(q)) {
          results.push({
            type: "item",
            pastaId: folderId,
            pastaNome: folderName,
            subpastaId: "",
            subpastaNome: "",
            itemId: it.id,
            titulo: data?.titulo || "",
            tipo: data?.tipo || "nota",
            snippet: (data?.conteudo || "").slice(0, 120),
          });
        }
      }

      // ✅ subpastas
      const subSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("pastas")
        .doc(folderId)
        .collection("subpastas")
        .get();

      for (const sub of subSnap.docs) {
        const subData = sub.data() as any;
        const subId = sub.id;
        const subNome = subData?.nome || "Subpasta";

        const subItemsSnap = await adminDb
          .collection("users")
          .doc(uid)
          .collection("pastas")
          .doc(folderId)
          .collection("subpastas")
          .doc(subId)
          .collection("itens")
          .get();

        for (const it of subItemsSnap.docs) {
          const data = it.data() as any;
          const titulo = (data?.titulo || "").toLowerCase();
          const conteudo = (data?.conteudo || "").toLowerCase();

          if (titulo.includes(q) || conteudo.includes(q)) {
            results.push({
              type: "item",
              pastaId: folderId,
              pastaNome: folderName,
              subpastaId: subId,
              subpastaNome: subNome,
              itemId: it.id,
              titulo: data?.titulo || "",
              tipo: data?.tipo || "nota",
              snippet: (data?.conteudo || "").slice(0, 120),
            });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      q,
      count: results.length,
      results: results.slice(0, 50), // limite pra não pesar
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "search-error" },
      { status: 500 }
    );
  }
}
