import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);

    // MP pode enviar id pelo query ou no body
    const body = await req.json().catch(() => ({}));

    const paymentId =
      url.searchParams.get("data.id") ||
      body?.data?.id ||
      body?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "MERCADOPAGO_ACCESS_TOKEN ausente" },
        { status: 500 }
      );
    }

    const mpClient = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(mpClient);

    const info = await payment.get({ id: String(paymentId) });

    const status = info.status; // approved, pending, rejected...
    const externalReference = info.external_reference;

    // se ainda não estiver aprovado, ok
    if (status !== "approved") {
      return NextResponse.json({ ok: true, status });
    }

    // aqui precisamos saber QUAL user pagou
    if (!externalReference) {
      return NextResponse.json({
        ok: true,
        status,
        warning: "Aprovado, mas external_reference está vazio",
      });
    }

    const uid = String(externalReference);

    // salva no firestore
    await adminDb.collection("users").doc(uid).set(
      {
        planStatus: "active",
        paidAt: new Date().toISOString(),
        mpPaymentId: String(paymentId),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, status, uid });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
