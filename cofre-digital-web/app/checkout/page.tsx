"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { auth } from "@/lib/firebase";

const PLAN_LABELS: Record<string, string> = {
  "24h": "Plano 24 horas",
  mensal: "Plano Mensal",
  premium: "Plano Premium",
};

export default function CheckoutPage() {
  const params = useSearchParams();

  const plan = params.get("plan") || "mensal";
  const type = (params.get("type") || "standard") as "standard" | "annual";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const label = useMemo(() => {
    const planName = PLAN_LABELS[plan] || "Plano";
    const t = type === "annual" ? "Anual (25% OFF)" : "Padrão";
    return `${planName} • ${t}`;
  }, [plan, type]);

  async function pay() {
    try {
      setLoading(true);
      setError("");

      // ✅ Usuário precisa estar logado (pra enviar uid ao Mercado Pago)
      const user = auth.currentUser;

      if (!user) {
        setError("Você precisa estar logado para pagar.");
        setLoading(false);
        return;
      }

      const uid = user.uid;

      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, type, uid }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        // se falhar ao ler json, continua com objeto vazio
        data = {};
      }

      if (!res.ok) {
        // ✅ Mostra erro completo (inclui details do backend)
        setError(
          `${data?.error || "Erro ao iniciar pagamento"}${
            data?.details ? " — " + data.details : ""
          }`
        );
        setLoading(false);
        return;
      }

      // ✅ Suporta produção e sandbox
      const checkoutUrl = data?.init_point || data?.sandbox_init_point;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setError("Não foi possível gerar o link de pagamento.");
      setLoading(false);
    } catch (e: any) {
      setError(`Erro inesperado. Tente novamente. (${String(e?.message || e)})`);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-700 to-blue-800">
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/planos"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/15 transition"
          >
            ← Voltar para Planos
          </Link>
        </div>

        <div className="rounded-[34px] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl p-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm text-white">
            💳 Checkout • Mercado Pago
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-5">
            Finalizar pagamento
          </h1>

          <p className="text-blue-100 mt-2">
            Você está pagando: <b className="text-white">{label}</b>
          </p>

          <div className="mt-6 grid gap-4">
            <button
              onClick={pay}
              disabled={loading}
              className="w-full px-6 py-4 rounded-2xl font-extrabold transition bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Abrindo Mercado Pago..." : "Pagar com Mercado Pago"}
            </button>

            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/login"
                className="w-full text-center px-6 py-3 rounded-2xl bg-white text-blue-800 font-extrabold hover:bg-blue-50 transition"
              >
                Entrar
              </Link>

              <Link
                href="/register"
                className="w-full text-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold hover:bg-white/15 transition"
              >
                Criar conta
              </Link>
            </div>

            {error && (
              <div className="text-sm text-red-100 bg-red-500/20 border border-red-200/30 rounded-2xl p-4 whitespace-pre-wrap">
                ❌ {error}
              </div>
            )}

            <div className="rounded-2xl bg-white/10 border border-white/15 p-4 text-sm text-blue-100">
              ✅ Pagamento seguro via Mercado Pago (Pix / cartão). <br />
              🔒 Suas informações ficam protegidas.
            </div>

            <div className="text-xs text-blue-100/70 text-center">
              Cofre Digital — Organização digital não é luxo — é proteção.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

