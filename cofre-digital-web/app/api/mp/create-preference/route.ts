import { NextResponse } from "next/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";

// ========================
// FUNÇÕES AUXILIARES
// ========================

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function annualWithDiscount(monthly: number) {
  return round2(monthly * 12 * 0.75); // 25% OFF
}

function normalizeUrl(url: string) {
  let u = String(url || "").trim();
  return u.replace(/\/+$/, "");
}

// ========================
// PLANOS (OFICIAL)
// ========================

const PLANS: Record<
  string,
  { name: string; monthly: number; allowAnnual?: boolean }
> = {
  "24h": {
    name: "Plano 24 horas",
    monthly: 9.9,
    allowAnnual: false,
  },

  mensal: {
    name: "Plano Mensal",
    monthly: 19.9,
    allowAnnual: true,
  },

  premium: {
    name: "Plano Premium",
    monthly: 39.9, // ✅ PREÇO CERTO AGORA
    allowAnnual: true,
  },
};

// ========================
// POST
// ========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const plan = body?.plan as string;
    const type = (body?.type as "standard" | "annual") || "standard";
    const uid = body?.uid as string;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    if (!uid) {
      return NextResponse.json(
        { error: "UID do usuário não enviado" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token Mercado Pago não configurado" },
        { status: 500 }
      );
    }

    const rawAppUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const appUrl = normalizeUrl(rawAppUrl);

    if (!appUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL inválida", details: appUrl },
        { status: 500 }
      );
    }

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);

    let price = PLANS[plan].monthly;
    let title = PLANS[plan].name;

    // 🎯 Plano anual com desconto
    if (type === "annual" && PLANS[plan].allowAnnual) {
      price = annualWithDiscount(price);
      title = `${title} (Anual - 25% OFF)`;
    }

    const successUrl = `${appUrl}/checkout/success`;
    const pendingUrl = `${appUrl}/checkout/pending`;
    const failureUrl = `${appUrl}/checkout/failure`;

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

        external_reference: uid,

        notification_url: `${appUrl}/api/mp/webhook`,

        back_urls: {
          success: successUrl,
          pending: pendingUrl,
          failure: failureUrl,
        },

        auto_return: "approved",
      },
    });

    return NextResponse.json({
      ok: true,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });

  } catch (err: any) {
    console.error("Mercado Pago error:", err);

    return NextResponse.json(
      {
        ok: false,
        error: "Erro ao criar pagamento",
        details: err?.message || err,
      },
      { status: 500 }
    );
  }
}
