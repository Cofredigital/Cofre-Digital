export default function TermosPage() {
  return (
    <main className="text-white">
      <section className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-black">Termos de Uso</h1>
        <p className="mt-3 text-white/80">
          Ao usar o Cofre Digital, você concorda com estes termos.
        </p>

        <div className="mt-8 space-y-6 text-white/85 leading-relaxed">
          <div>
            <h2 className="text-xl font-extrabold text-white">1. Objetivo</h2>
            <p className="mt-2">
              O Cofre Digital é uma plataforma para organização e armazenamento
              de informações digitais (textos e anexos), de acordo com o plano
              contratado.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              2. Responsabilidade do usuário
            </h2>
            <p className="mt-2">
              O usuário é responsável pelas informações que inserir na plataforma
              e por manter sua senha e acesso seguros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">3. Conteúdo</h2>
            <p className="mt-2">
              É proibido armazenar conteúdos ilegais, ofensivos, fraudulentos ou
              que violem direitos de terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">4. Planos</h2>
            <p className="mt-2">
              Cada plano possui limites e recursos específicos (ex: anexos por
              pasta). O usuário pode migrar de plano conforme desejar.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              5. Cancelamento
            </h2>
            <p className="mt-2">
              O usuário pode cancelar quando quiser. Em planos pagos, os acessos
              são mantidos até o fim do período contratado (quando aplicável).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              6. Alterações
            </h2>
            <p className="mt-2">
              Podemos atualizar estes termos para melhorar o serviço. Recomendamos
              revisar periodicamente.
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-white/60">
          Última atualização: Janeiro/2026
        </div>
      </section>
    </main>
  );
}
