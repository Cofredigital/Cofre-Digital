import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-700 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-[34px] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl p-7 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/30 border border-emerald-200/30 px-4 py-2 text-sm text-white">
          ✅ Pagamento aprovado
        </div>

        <h1 className="text-3xl font-extrabold text-white mt-5">
          Pagamento confirmado!
        </h1>

        <p className="text-blue-100 mt-2">
          Agora seu acesso será liberado. Você já pode entrar no painel.
        </p>

        <Link
          href="/dashboard"
          className="inline-block mt-7 w-full px-6 py-4 rounded-2xl bg-white text-blue-800 font-extrabold hover:bg-blue-50 transition"
        >
          Ir para o painel
        </Link>

        <Link
          href="/"
          className="inline-block mt-3 w-full px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold hover:bg-white/15 transition"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
