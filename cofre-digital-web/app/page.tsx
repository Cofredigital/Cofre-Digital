import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-700 to-blue-800">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Esquerda */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm text-white">
              🔐 Cofre Digital • Segurança + organização
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              Organização digital não é luxo — é{" "}
              <span className="text-indigo-200">proteção</span>.
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-xl">
              Guarde com segurança senhas, contas, documentos, bancos,
              assinaturas e tudo que você precisar — em um só lugar.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="px-7 py-3 rounded-2xl bg-white text-blue-800 font-semibold hover:bg-blue-50 transition text-center"
              >
                Criar minha conta
              </Link>

              <Link
                href="/planos"
                className="px-7 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition text-center"
              >
                Ver planos
              </Link>
            </div>

            {/* Benefícios */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                "✅ Bancos e cartões",
                "✅ Contas a pagar",
                "✅ Streaming e assinaturas",
                "✅ Certidões e documentos",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="text-blue-100/80 text-sm pt-2">
              Quem se prepara hoje evita sofrimento amanhã.
            </p>
          </div>

          {/* Direita */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl rounded-[34px] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-xl">
              <div className="p-5">
                {/* Imagem */}
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/10">
                  <img
                    src="/hero-cofre.png"
                    alt="Cofre Digital"
                    className="w-full h-[320px] object-cover"
                  />
                </div>

                {/* Lista de benefícios */}
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white">
                  <div className="flex items-center gap-2">
                    <span>✅</span> Backup e segurança
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span> Pastas ilimitadas
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span> Acesso rápido
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span> Organização total
                  </div>
                </div>

                {/* Botões */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/planos"
                    className="w-full px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition text-center"
                  >
                    Começar com 24h • R$ 9,90
                  </Link>

                  <Link
                    href="/login"
                    className="w-full px-5 py-3 rounded-2xl bg-white text-blue-800 font-semibold hover:bg-blue-50 transition text-center"
                  >
                    Entrar
                  </Link>
                </div>

                {/* Rodapé do card */}
                <div className="mt-5 rounded-2xl bg-white/10 border border-white/15 p-4 text-white/90 text-sm">
                  🔒 Login e dados protegidos • Cofre Digital
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa inferior */}
      <section className="border-t border-white/15">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <p className="text-white font-medium">
            “Organização digital não é luxo — é proteção.”
          </p>
          <p className="text-xs text-blue-100/80 mt-1">
            Cofre Digital — Proteja o que é importante
          </p>
        </div>
      </section>
    </main>
  );
}
