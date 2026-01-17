import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

// ✅ Mercado Pago SDK precisa de Node runtime (não Edge)
export const runtime = "nodejs";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function annualWithDiscount(monthly: number) {
  // anual = mensal * 12 com 25% OFF
  return round2(monthly * 12 * 0.75);
}

const PLANS: Record<string, { name: string; monthly: number }> = {
  "24h": { name: "Plano 24 horas", monthly: 9.9 },
  mensal: { name: "Plano Mensal", monthly: 19.9 },
  premium: { name: "Plano Premium", monthly: 29.9 },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const plan = body?.plan as string;
    const type = (body?.type as "standard" | "annual") || "standard";
    const uid = body?.uid as string;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    if (!uid || typeof uid !== "string") {
      return NextResponse.json(
        { error: "UID do usuário não enviado (uid)!" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "MERCADOPAGO_ACCESS_TOKEN não configurado na Vercel" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ✅ Cliente Mercado Pago
    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    let price = PLANS[plan].monthly;
    let title = PLANS[plan].name;

    // Anual com 25% OFF (somente mensal/premium)
    if (plan !== "24h" && type === "annual") {
      price = annualWithDiscount(PLANS[plan].monthly);
      title = `${PLANS[plan].name} (Anual - 25% OFF)`;
    }

    const result = await preference.create({
      body: {
        items: [
          {
            id: `${plan}-${type}`,
            title,
            quantity: 1,
            unit_price: round2(price),
            currency_id: "BRL",
          },
        ],

        notification_url: `${appUrl}/api/mp/webhook`,
        external_reference: uid,

        back_urls: {
          success: `${appUrl}/checkout/success`,
          pending: `${appUrl}/checkout/pending`,
          failure: `${appUrl}/checkout/failure`,
        },

        auto_return: "approved",
      },
    });

    return NextResponse.json({
      ok: true,
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (err: any) {
    // ✅ Isso vai fazer o erro REAL aparecer no LOG da Vercel
    console.error("MP create-preference ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Erro ao criar preferência no Mercado Pago",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
