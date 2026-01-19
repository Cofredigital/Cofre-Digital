"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [params, setParams] = useState({
    payment_id: "",
    status: "",
    merchant_order_id: "",
    external_reference: "",
    preference_id: "",
  });

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

    setParams({
      payment_id: sp.get("payment_id") || "",
      status: sp.get("status") || "",
      merchant_order_id: sp.get("merchant_order_id") || "",
      external_reference: sp.get("external_reference") || "",
      preference_id: sp.get("preference_id") || "",
    });
  }, []);

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 6px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>✅ Pagamento aprovado!</h1>

        <p style={{ opacity: 0.85, marginBottom: 20 }}>
          Obrigado! Seu pagamento foi confirmado com sucesso.
        </p>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 16,
            background: "#fafafa",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Detalhes</h2>

          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>
              <b>Status:</b> {params.status || "approved"}
            </li>
            <li>
              <b>payment_id:</b> {params.payment_id || "-"}
            </li>
            <li>
              <b>merchant_order_id:</b> {params.merchant_order_id || "-"}
            </li>
            <li>
              <b>preference_id:</b> {params.preference_id || "-"}
            </li>
            <li>
              <b>external_reference (uid):</b> {params.external_reference || "-"}
            </li>
          </ul>

          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
            Obs.: O comprovante oficial é do Mercado Pago. Esta tela serve para
            confirmar que o retorno do checkout funcionou e evita erro 404.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              background: "#0ea5e9",
              color: "white",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Ir para o Dashboard
          </Link>

          <Link
            href="/planos"
            style={{
              background: "#111827",
              color: "white",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Ver planos
          </Link>

          <Link
            href="/"
            style={{
              background: "#e5e7eb",
              color: "#111827",
              padding: "10px 14px",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
