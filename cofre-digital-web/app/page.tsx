"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-20 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Organização digital não é luxo <br /> — é proteção.
          </h1>

          <p className="text-blue-100 mb-8 text-lg">
            Guarde com segurança senhas, contas, documentos, bancos, assinaturas
            e tudo que você precisar — em um só lugar.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
            >
              Criar conta grátis
            </Link>

            <Link
              href="/planos"
              className="bg-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
            >
              Ver planos
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10 text-sm">
            <span className="bg-blue-700/40 p-3 rounded-lg">✅ Bancos e cartões</span>
            <span className="bg-blue-700/40 p-3 rounded-lg">✅ Contas a pagar</span>
            <span className="bg-blue-700/40 p-3 rounded-lg">✅ Streaming e assinaturas</span>
            <span className="bg-blue-700/40 p-3 rounded-lg">✅ Documentos importantes</span>
          </div>
        </div>

        <div className="bg-blue-700/30 rounded-3xl p-6 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7"
            alt="Cofre digital"
            className="rounded-2xl w-full object-cover"
          />

          <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
            <span>✅ Backup seguro</span>
            <span>✅ Pastas ilimitadas</span>
            <span>✅ Acesso rápido</span>
            <span>✅ Organização total</span>
          </div>

          <div className="flex gap-4 mt-6">
            <Link
              href="/register"
              className="bg-green-500 px-5 py-3 rounded-xl font-semibold hover:bg-green-400 transition"
            >
              Começar grátis por 5 dias
            </Link>

            <Link
              href="/login"
              className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
