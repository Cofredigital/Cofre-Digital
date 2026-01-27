"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@/lib/firebase";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white">

      {/* TOPO */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center">

        <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-400 mb-4">
          Cofre Digital
        </h1>

        <p className="text-blue-100 max-w-2xl mx-auto">
          Comece grátis por 5 dias.  
          Depois assine o plano Premium e proteja sua vida digital com segurança.
        </p>

        <div className="flex justify-center gap-4 mt-6">

          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold transition shadow-lg"
          >
            Início
          </Link>

          <Link
            href="/register"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-xl font-extrabold transition shadow-xl"
          >
            Criar conta grátis
          </Link>

        </div>
      </section>

      {/* PLANOS */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-8">

        {/* PLANO GRÁTIS */}
        <div className="bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">
            🎁 Plano Grátis
          </h2>

          <p className="text-blue-100 mb-6">
            Experimente o Cofre Digital por 5 dias sem pagar nada.
          </p>

          <div className="text-4xl font-extrabold mb-4">
            {formatBRL(0)}
          </div>

          <ul className="space-y-2 text-sm mb-8">
            <li>✅ Acesso completo por 5 dias</li>
            <li>✅ Pastas ilimitadas</li>
            <li>✅ Notas, senhas, links e arquivos</li>
            <li>✅ Organização segura</li>
          </ul>

          <Link
            href="/register"
            className="block text-center bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition shadow-lg"
          >
            Começar grátis agora
          </Link>
        </div>

        {/* PLANO PREMIUM */}
        <div className="bg-white/15 border border-yellow-400/40 rounded-3xl p-8 shadow-2xl relative">

          <div className="absolute -top-4 left-6 bg-yellow-400 text-black px-4 py-1 rounded-full font-extrabold text-sm shadow">
            ⭐ Premium
          </div>

          <h2 className="text-2xl font-extrabold text-yellow-300 mb-2">
            💎 Plano Premium
          </h2>

          <p className="text-blue-100 mb-6">
            Uso ilimitado e total segurança para seus dados.
          </p>

          <div className="text-4xl font-extrabold mb-1">
            {formatBRL(39.9)}
          </div>

          <div className="text-sm text-blue-200 mb-4">
            por mês
          </div>

          <ul className="space-y-2 text-sm mb-8">
            <li>✅ Acesso ilimitado</li>
            <li>✅ Armazenamento completo</li>
            <li>✅ Organização avançada</li>
            <li>✅ Suporte</li>
          </ul>

          <CheckoutButton />
        </div>

      </section>

      <div className="text-center text-xs text-blue-200 pb-6">
        Cofre Digital — organização digital segura e profissional.
      </div>

    </main>
  );
}

function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const uid = auth?.currentUser?.uid;

      if (!uid) {
        alert("Você precisa estar logado para assinar o plano.");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "premium",
          uid,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.init_point) {
        alert("Erro ao iniciar pagamento.");
        return;
      }

      window.location.href = data.init_point;

    } catch (err) {
      console.error(err);
      alert("Erro inesperado no pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-extrabold transition shadow-xl"
    >
      {loading ? "Carregando..." : "Assinar Premium"}
    </button>
  );
}
