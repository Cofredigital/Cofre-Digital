// cofre-digital-web/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs"; // importante (Cloudinary precisa Node runtime)

export async function POST(req: Request) {
  try {
    // ✅ autenticação via cookie de sessão (igual search/seed)
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // ✅ limite (para evitar abuso)
    const MAX_MB = 15;
    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: `Arquivo muito grande. Máximo: ${MAX_MB}MB.` },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Cloudinary não configurado. Verifique CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET no Vercel.",
        },
        { status: 500 }
      );
    }

    // ✅ converte file -> base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // ✅ Cloudinary upload (sem SDK, via HTTP)
    const folder = `cofre-digital/users/${uid}`;

    const timestamp = Math.floor(Date.now() / 1000);
    const publicIdBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);

    // assinatura (Cloudinary)
    const crypto = await import("crypto");
    const signString = `folder=${folder}&public_id=${publicIdBase}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signString).digest("hex");

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", dataUri);
    cloudinaryForm.append("api_key", apiKey);
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("signature", signature);
    cloudinaryForm.append("folder", folder);
    cloudinaryForm.append("public_id", publicIdBase);

    // ✅ auto-detect resource_type: image/video/raw (PDF vai como raw ou auto)
    cloudinaryForm.append("resource_type", "auto");

    const uploadResp = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const uploadData = await uploadResp.json();

    if (!uploadResp.ok) {
      console.error("Cloudinary upload error:", uploadData);
      return NextResponse.json(
        { ok: false, error: "Falha ao enviar arquivo para Cloudinary." },
        { status: 500 }
      );
    }

    // url segura
    const secureUrl = uploadData?.secure_url || uploadData?.url;
    const bytes = uploadData?.bytes ?? file.size;

    return NextResponse.json({
      ok: true,
      url: secureUrl,
      originalFilename: uploadData?.original_filename || file.name,
      format: uploadData?.format || "",
      bytes,
      resourceType: uploadData?.resource_type || "auto",
      mimeType: file.type || "",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "upload-error" },
      { status: 500 }
    );
  }
}
