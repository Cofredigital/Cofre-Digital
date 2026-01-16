export default function PrivacidadePage() {
  return (
    <main className="text-white">
      <section className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-black">Política de Privacidade</h1>
        <p className="mt-3 text-white/80">
          Sua privacidade é prioridade. Aqui explicamos como tratamos seus dados.
        </p>

        <div className="mt-8 space-y-6 text-white/85 leading-relaxed">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              1. Dados coletados
            </h2>
            <p className="mt-2">
              Coletamos informações necessárias para funcionamento do serviço,
              como e-mail de login, informações de conta e dados criados pelo
              usuário dentro do Cofre Digital.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              2. Finalidade
            </h2>
            <p className="mt-2">
              Utilizamos seus dados para autenticação, armazenamento seguro,
              funcionamento do painel e melhoria da experiência.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              3. Compartilhamento
            </h2>
            <p className="mt-2">
              Não vendemos seus dados. Compartilhamentos ocorrem apenas quando
              necessário para operar o serviço (ex: provedores de infraestrutura).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              4. Segurança
            </h2>
            <p className="mt-2">
              Aplicamos medidas para proteger os dados. Mesmo assim, nenhum sistema
              é 100% inviolável. Recomendamos senha forte e não compartilhar acesso.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              5. Direitos do usuário
            </h2>
            <p className="mt-2">
              O usuário pode solicitar alteração/remoção de dados conforme
              legislação aplicável.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">
              6. Alterações
            </h2>
            <p className="mt-2">
              Podemos atualizar esta política para melhoria do serviço.
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
