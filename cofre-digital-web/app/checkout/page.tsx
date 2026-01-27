"use client";

import Link from "next/link";
import { useState } from "react";

const PLAN_LABELS: Record<string, string> = {
  "24h": "Plano 24 horas",
  mensal: "Plano Mensal",
  premium: "Plano Premium",
};

const PLAN_PRICES: Record<string, number> = {
  "24h": 5.9,
  mensal: 19.9,
  premium: 39.9, // ✅ VALOR OFICIAL PREMIUM
};

type Props = {
  searchParams?: {
    plan?: string;
    type?: string;
  };
};

export default function CheckoutPage({ searchParams }: Props) {
  const plan = searchParams?.plan || "premium";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          price: PLAN_PRICES[plan],
        }),
      });

      const data = await res.json();

      if (!data.init_point) {
        throw new Error("Erro ao criar pagamento");
      }

      // 👉 Redireciona pro Mercado Pago
      window.location.href = data.init_point;

    } catch (err: any) {
      setError("Erro ao iniciar pagamento. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(180deg, #0d47ff, #001a66)"
    }}>
      <div style={{
        background: "#fff",
        padding: 40,
        borderRadius: 16,
        width: 350,
        textAlign: "center",
        boxShadow: "0 10px 40px rgba(0,0,0,.2)"
      }}>
        <h1 style={{ marginBottom: 10 }}>Checkout</h1>

        <p><strong>{PLAN_LABELS[plan]}</strong></p>
        <p style={{ fontSize: 24, margin: "15px 0" }}>
          R$ {PLAN_PRICES[plan].toFixed(2)}
        </p>

        {error && (
          <p style={{ color: "red", marginBottom: 10 }}>{error}</p>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            background: "#ffcc00",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "Redirecionando..." : "Pagar agora"}
        </button>

        <div style={{ marginTop: 15 }}>
          <Link href="/planos">Voltar para planos</Link>
        </div>
      </div>
    </div>
  );
}
