import Link from "next/link";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function annualWithDiscount(monthly: number) {
  const annual = monthly * 12;
  const discounted = annual * 0.75; // 25% OFF
  return {
    annual: round2(annual),
    discounted: round2(discounted),
    savings: round2(annual - discounted),
  };
}

const PLANS = [
  {
    id: "24h",
    name: "Plano 24 horas",
    description: "Acesso rápido para organizar tudo hoje.",
    price: 9.9,
    period: "pagamento único",
    badge: "Acesso imediato",
    featured: false,
    showAnnual: false,
    features: [
      "Acesso por 24 horas",
      "Pastas ilimitadas",
      "Guarde contas, bancos e senhas",
      "Guarde certidões e documentos",
      "Organização simples e segura",
    ],
  },
  {
    id: "mensal",
    name: "Plano Mensal",
    description: "Para manter seu cofre sempre atualizado.",
    price: 19.9,
    period: "por mês",
    badge: "Mais vendido",
    featured: true,
    showAnnual: true,
    features: [
      "Acesso ilimitado",
      "Pastas ilimitadas",
      "Contas a pagar e lembretes",
      "Senhas e logins com segurança",
      "Suporte",
    ],
  },
  {
    id: "premium",
    name: "Plano Premium",
    description: "Mais recursos e suporte prioritário.",
    price: 29.9,
    period: "por mês",
    badge: "Melhor para famílias",
    featured: false,
    showAnnual: true,
    features: [
      "Tudo do Plano Mensal",
      "Mais capacidade de armazenamento",
      "Organização avançada",
      "Prioridade no suporte",
      "Recursos premium",
    ],
  },
] as const;

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-700 to-blue-800">
      {/* Topo */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2 text-sm text-white">
              💳 Planos • Cofre Digital
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 leading-tight">
              Escolha o plano ideal para proteger sua vida digital
            </h1>

            <p className="text-blue-100 mt-2 max-w-2xl">
              No plano anual você ganha <b>25% de desconto</b>. Organize bancos,
              senhas, documentos e dados importantes com segurança.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition"
            >
              Início
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-white text-blue-800 font-semibold hover:bg-blue-50 transition"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const annual = annualWithDiscount(plan.price);

            return (
              <div
                key={plan.id}
                className={[
                  "relative rounded-[34px] p-6 border shadow-2xl shadow-black/15 backdrop-blur-xl",
                  plan.featured
                    ? "bg-white/15 border-white/25"
                    : "bg-white/10 border-white/15",
                ].join(" ")}
              >
                {/* tag topo */}
                {plan.featured && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-indigo-200 text-blue-900 text-xs font-extrabold border border-white/40">
                    ⭐ Mais vendido
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">
                      {plan.name}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {plan.description}
                    </p>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                    {plan.badge}
                  </span>
                </div>

                {/* preço */}
                <div className="mt-6">
                  <div className="text-4xl font-extrabold text-white leading-none">
                    {formatBRL(plan.price)}
                  </div>
                  <div className="text-blue-100 text-sm mt-1">
                    {plan.period}
                  </div>
                </div>

                {/* anual */}
                {plan.showAnnual && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-200/30">
                    <div className="text-sm font-extrabold text-white">
                      Plano anual com 25% OFF
                    </div>

                    <div className="text-blue-100 text-xs mt-1">
                      De{" "}
                      <span className="line-through">
                        {formatBRL(annual.annual)}
                      </span>{" "}
                      por{" "}
                      <span className="text-white font-extrabold">
                        {formatBRL(annual.discounted)}
                      </span>
                    </div>

                    <div className="text-emerald-100 text-xs mt-1 font-semibold">
                      Você economiza {formatBRL(annual.savings)}
                    </div>
                  </div>
                )}

                {/* features */}
                <ul className="mt-6 space-y-2 text-sm text-white">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-[2px]">✅</span>
                      <span className="text-blue-50">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* botões */}
                <div className="mt-7 grid gap-3">
                  <Link
                    href={`/checkout?plan=${plan.id}&type=standard`}
                    className={[
                      "w-full text-center px-5 py-3 rounded-2xl font-extrabold transition",
                      plan.featured
                        ? "bg-white text-blue-800 hover:bg-blue-50"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white/15",
                    ].join(" ")}
                  >
                    Assinar agora
                  </Link>

                  {plan.showAnnual && (
                    <Link
                      href={`/checkout?plan=${plan.id}&type=annual`}
                      className="w-full text-center px-5 py-3 rounded-2xl font-extrabold transition bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Assinar anual (25% OFF)
                    </Link>
                  )}
                </div>

                {/* rodapé */}
                <div className="mt-5 text-center text-xs text-blue-100/80">
                  Pagamento seguro • Cancelamento simples • Suporte
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé geral */}
        <div className="mt-12 text-center text-xs text-blue-100/80">
          Cofre Digital — Proteja suas informações com segurança e organização.
        </div>
      </section>
    </main>
  );
}
