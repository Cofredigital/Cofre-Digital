import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);

    // ✅ MP pode mandar payloads diferentes
    // vamos tentar ler JSON, mas sem quebrar se vier vazio
    const body = await req.json().catch(() => ({}));

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id;

    // Se não veio ID, não fazemos nada
    if (!paymentId) {
      console.log("MP webhook ignored (no paymentId). body:", body);
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

    // ✅ status do pagamento
    const status = info.status; // approved, pending, rejected...
    const statusDetail = info.status_detail;

    // ✅ normalmente guardamos o uid no external_reference
    const externalReference = info.external_reference;

    // ✅ extras úteis
    const preferenceId = info?.order?.id || null; // nem sempre vem
    const transactionAmount = info.transaction_amount ?? null;
    const dateApproved = info.date_approved ?? null;

    console.log("MP webhook payment:", {
      paymentId,
      status,
      statusDetail,
      externalReference,
      transactionAmount,
      dateApproved,
    });

    // Se ainda não estiver aprovado, só registramos e saímos
    if (status !== "approved") {
      return NextResponse.json({ ok: true, status });
    }

    if (!externalReference) {
      return NextResponse.json({
        ok: true,
        status,
        warning: "Aprovado, mas external_reference está vazio",
      });
    }

    const uid = String(externalReference);

    // ✅ grava no Firestore
    await adminDb.collection("users").doc(uid).set(
      {
        planStatus: "active",
        paidAt: new Date().toISOString(),

        mp: {
          paymentId: String(paymentId),
          status,
          statusDetail: statusDetail || null,
          transactionAmount,
          preferenceId,
          dateApproved,
          rawExternalReference: externalReference,
        },
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, status, uid });
  } catch (err: any) {
    console.error("MP webhook ERROR:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
