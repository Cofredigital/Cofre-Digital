"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

type Item = {
  id: string;
  titulo: string;
  tipo: "nota" | "senha" | "link";
  conteudo: string;
  criadoEm?: any;
};

type Subpasta = {
  id: string;
  nome: string;
  criadoEm?: any;
};

// ✅ util: timeout pra promessas (impede travar infinito no salvamento)
function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMsg: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs)
    ),
  ]);
}

export default function PastaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const pastaId = params?.id;

  // ✅ URL params (vem da lupa global)
  const subFromUrl = searchParams.get("sub") || "";
  const itemFromUrl = searchParams.get("item") || "";

  const [uid, setUid] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // ✅ SUBPASTAS
  const [subpastas, setSubpastas] = useState<Subpasta[]>([]);
  const [subpastaSelecionada, setSubpastaSelecionada] = useState<string>(""); // "" = sem subpasta

  // ✅ ITENS
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Busca (dentro desta pasta/subpasta)
  const [qBusca, setQBusca] = useState("");

  // ✅ Destaque do item (quando abre pela pesquisa)
  const [highlightId, setHighlightId] = useState<string>("");

  // modal item
  const [modalOpen, setModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<Item["tipo"]>("nota");
  const [conteudo, setConteudo] = useState("");
  const [criando, setCriando] = useState(false);

  // modal subpasta
  const [modalSubpastaOpen, setModalSubpastaOpen] = useState(false);
  const [nomeSubpasta, setNomeSubpasta] = useState("");
  const [criandoSubpasta, setCriandoSubpasta] = useState(false);

  // ✅ Proteção: só logado entra
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUid(user.uid);
      setEmail(user.email || "");
    });

    return () => unsub();
  }, [router]);

  // ✅ Se tiver subpasta na URL, seleciona automaticamente
  useEffect(() => {
    if (subFromUrl) {
      setSubpastaSelecionada(subFromUrl);
    }
  }, [subFromUrl]);

  // ✅ Carrega SUBPASTAS
  useEffect(() => {
    if (!uid || !pastaId) return;

    const q = query(
      collection(db, "users", uid, "pastas", pastaId, "subpastas"),
      orderBy("criadoEm", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Subpasta[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setSubpastas(list);
      },
      (err) => {
        console.log("ERRO snapshot subpastas:", err);
      }
    );

    return () => unsub();
  }, [uid, pastaId]);

  // ✅ Carrega ITENS (da pasta OU da subpasta selecionada)
  useEffect(() => {
    if (!uid || !pastaId) return;

    setLoading(true);

    const itensCollection =
      subpastaSelecionada && subpastaSelecionada !== ""
        ? collection(
            db,
            "users",
            uid,
            "pastas",
            pastaId,
            "subpastas",
            subpastaSelecionada,
            "itens"
          )
        : collection(db, "users", uid, "pastas", pastaId, "itens");

    const q = query(itensCollection, orderBy("criadoEm", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Item[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setItens(items);
        setLoading(false);
      },
      (err) => {
        console.log("ERRO snapshot itens:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid, pastaId, subpastaSelecionada]);

  // ✅ SCROLL + DESTAQUE quando abrir por pesquisa (?item=...)
  useEffect(() => {
    if (loading) return;
    if (!itemFromUrl) return;

    const t = setTimeout(() => {
      const el = document.getElementById(`item-${itemFromUrl}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(itemFromUrl);

        setTimeout(() => setHighlightId(""), 3500);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [itemFromUrl, loading, itens]);

  function resetModalItem() {
    setTitulo("");
    setTipo("nota");
    setConteudo("");
  }

  function resetModalSubpasta() {
    setNomeSubpasta("");
  }

  const tituloLocal = useMemo(() => {
    if (!subpastaSelecionada) return "📁 Pasta";
    const sp = subpastas.find((x) => x.id === subpastaSelecionada);
    return sp ? `📂 ${sp.nome}` : "📂 Subpasta";
  }, [subpastaSelecionada, subpastas]);

  // ✅ Filtra itens por busca (titulo/conteudo/tipo)
  const itensFiltrados = useMemo(() => {
    const term = qBusca.trim().toLowerCase();
    if (!term) return itens;

    return itens.filter((item) => {
      const t = (item.titulo || "").toLowerCase();
      const c = (item.conteudo || "").toLowerCase();
      const tp = (item.tipo || "").toLowerCase();
      return t.includes(term) || c.includes(term) || tp.includes(term);
    });
  }, [itens, qBusca]);

  async function criarItem() {
    if (!uid || !pastaId) return;

    const t = titulo.trim();
    const c = conteudo.trim();

    if (!t || !c) {
      alert("Preencha o título e o conteúdo.");
      return;
    }

    setCriando(true);
    try {
      const col =
        subpastaSelecionada && subpastaSelecionada !== ""
          ? collection(
              db,
              "users",
              uid,
              "pastas",
              pastaId,
              "subpastas",
              subpastaSelecionada,
              "itens"
            )
          : collection(db, "users", uid, "pastas", pastaId, "itens");

      // ✅ Timeout maior (40s) para evitar falsos alertas
      await promiseWithTimeout(
        addDoc(col, {
          titulo: t,
          tipo,
          conteudo: c,
          criadoEm: serverTimestamp(),
        }),
        40000,
        "Está demorando para confirmar. Pode ter salvado. Feche e confira na lista."
      );

      setModalOpen(false);
      resetModalItem();
    } catch (err: any) {
      console.log("ERRO criar item:", err);
      alert(err?.message || "Erro ao criar item.");
    } finally {
      setCriando(false);
    }
  }

  async function excluirItem(itemId: string) {
    if (!uid || !pastaId) return;

    const ok = confirm("Deseja excluir este item?");
    if (!ok) return;

    try {
      if (subpastaSelecionada && subpastaSelecionada !== "") {
        await deleteDoc(
          doc(
            db,
            "users",
            uid,
            "pastas",
            pastaId,
            "subpastas",
            subpastaSelecionada,
            "itens",
            itemId
          )
        );
      } else {
        await deleteDoc(doc(db, "users", uid, "pastas", pastaId, "itens", itemId));
      }
    } catch (err) {
      console.log("ERRO excluir:", err);
      alert("Erro ao excluir.");
    }
  }

  async function criarSubpasta() {
    if (!uid || !pastaId) return;

    const nome = nomeSubpasta.trim();
    if (!nome) {
      alert("Digite o nome da subpasta.");
      return;
    }

    setCriandoSubpasta(true);
    try {
      await addDoc(collection(db, "users", uid, "pastas", pastaId, "subpastas"), {
        nome,
        criadoEm: serverTimestamp(),
      });

      setModalSubpastaOpen(false);
      resetModalSubpasta();
    } catch (err) {
      console.log("ERRO criar subpasta:", err);
      alert("Erro ao criar subpasta.");
    } finally {
      setCriandoSubpasta(false);
    }
  }

  async function excluirSubpasta(subId: string) {
    if (!uid || !pastaId) return;

    const ok = confirm(
      "Deseja excluir esta subpasta?\n\n⚠️ Atenção: os itens dentro dela NÃO serão apagados automaticamente."
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "users", uid, "pastas", pastaId, "subpastas", subId));

      if (subpastaSelecionada === subId) {
        setSubpastaSelecionada("");
      }
    } catch (err) {
      console.log("ERRO excluir subpasta:", err);
      alert("Erro ao excluir subpasta.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Topo */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold">{tituloLocal}</h1>
            <p className="text-white/75 text-sm mt-1">Usuário: {email}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/15 border border-white/15 px-5 py-2 text-sm font-semibold hover:bg-white/20"
            >
              ← Voltar
            </Link>

            <button
              onClick={() => setModalSubpastaOpen(true)}
              className="rounded-xl bg-emerald-500 text-white px-5 py-2 text-sm font-extrabold hover:bg-emerald-600"
            >
              ➕ Nova subpasta
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-white text-blue-900 px-5 py-2 text-sm font-extrabold hover:bg-blue-50"
            >
              ➕ Novo item
            </button>
          </div>
        </div>

        {/* Dica */}
        <div className="mt-8 rounded-3xl bg-white/10 border border-white/15 p-5 text-sm text-white/80">
          💡 Dica: você pode criar <b>subpastas</b> aqui (ex: Bancos → Nubank / Itaú /
          Caixa).
        </div>

        {/* Subpastas */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold">📂 Subpastas</h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSubpastaSelecionada("")}
              className={`rounded-2xl px-4 py-2 text-sm font-bold border transition ${
                subpastaSelecionada === ""
                  ? "bg-white text-blue-900 border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              }`}
            >
              📁 Itens da pasta
            </button>

            {subpastas.map((sp) => (
              <div key={sp.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSubpastaSelecionada(sp.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold border transition ${
                    subpastaSelecionada === sp.id
                      ? "bg-white text-blue-900 border-white"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                  }`}
                >
                  📂 {sp.nome}
                </button>

                <button
                  onClick={() => excluirSubpasta(sp.id)}
                  className="rounded-2xl px-3 py-2 text-xs font-bold border border-red-300/30 bg-red-500/15 text-red-100 hover:bg-red-500/25"
                  title="Excluir subpasta"
                >
                  ✖
                </button>
              </div>
            ))}

            {subpastas.length === 0 && (
              <div className="text-sm text-white/70">
                Nenhuma subpasta ainda. Clique em <b>“Nova subpasta”</b>.
              </div>
            )}
          </div>
        </div>

        {/* 🔍 Busca premium dentro desta pasta/subpasta */}
        <div className="mt-8 rounded-3xl border border-yellow-400/20 bg-gradient-to-r from-blue-950/40 to-blue-900/30 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center text-lg">
              🔍
            </div>

            <div className="flex-1">
              <div className="text-xs text-yellow-200/80 font-bold mb-1">
                PESQUISAR ITENS AQUI
              </div>

              <input
                value={qBusca}
                onChange={(e) => setQBusca(e.target.value)}
                placeholder="Digite: RG, senha, contrato, link, nubank..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-yellow-400/35 focus:ring-2 focus:ring-yellow-400/15"
              />
            </div>

            {qBusca.trim() && (
              <button
                onClick={() => setQBusca("")}
                className="rounded-2xl px-4 py-3 font-extrabold text-sm border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="mt-3 text-xs text-white/60">
            {qBusca.trim() ? (
              <>
                Encontrados{" "}
                <b className="text-yellow-200">{itensFiltrados.length}</b> itens para:{" "}
                <b className="text-white">{qBusca}</b>
              </>
            ) : (
              <>
                Dica: pesquise por título, conteúdo ou tipo (ex: “senha”, “rg”, “link”).
              </>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-10">
          {loading ? (
            <div className="rounded-3xl bg-white/10 border border-white/15 p-6">
              <p className="text-white/80 text-sm">Carregando itens...</p>
            </div>
          ) : itensFiltrados.length === 0 ? (
            <div className="rounded-3xl bg-white/10 border border-white/15 p-6">
              <p className="text-white/80 text-sm">
                {qBusca.trim() ? (
                  <>
                    Nenhum item encontrado para <b>{qBusca}</b>.
                  </>
                ) : (
                  <>
                    Ainda não existe nenhum item aqui. Clique em <b>“Novo item”</b>.
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {itensFiltrados.map((item) => (
                <div
                  key={item.id}
                  id={`item-${item.id}`}
                  className={`rounded-3xl bg-white/10 border p-6 shadow-lg transition ${
                    highlightId === item.id
                      ? "border-yellow-300/80 bg-yellow-300/15 ring-2 ring-yellow-200/60"
                      : "border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold">
                        {item.tipo === "nota" && "📝 "}
                        {item.tipo === "senha" && "🔑 "}
                        {item.tipo === "link" && "🔗 "}
                        {item.titulo}
                      </div>

                      <div className="mt-1 text-xs text-white/70">
                        Tipo: <b>{item.tipo}</b>
                      </div>
                    </div>

                    <button
                      onClick={() => excluirItem(item.id)}
                      className="rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-2 text-xs font-bold text-red-100 hover:bg-red-500/25"
                    >
                      Excluir
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-white/90 whitespace-pre-wrap break-words">
                    {item.conteudo}
                  </div>

                  {item.tipo === "link" && (
                    <a
                      href={item.conteudo}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-bold underline underline-offset-4"
                    >
                      Abrir link
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-16 text-sm text-white/60">
          © {new Date().getFullYear()} Cofre Digital
        </footer>
      </div>

      {/* Modal: NOVO ITEM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl rounded-3xl bg-white text-zinc-900 p-6 shadow-xl">
            <h2 className="text-xl font-extrabold">Novo item</h2>
            <p className="text-sm text-zinc-600 mt-1">
              Salvo com segurança {subpastaSelecionada ? "na subpasta" : "na pasta"}.
            </p>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-bold text-zinc-700">Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex.: Senha do banco, CPF, Link do contrato..."
                  className="mt-1 w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="mt-1 w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="nota">📝 Nota</option>
                  <option value="senha">🔑 Senha</option>
                  <option value="link">🔗 Link</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">Conteúdo</label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder={
                    tipo === "senha"
                      ? "Ex.: Login: xxx | Senha: yyy"
                      : tipo === "link"
                      ? "Cole o link aqui"
                      : "Escreva sua nota..."
                  }
                  className="mt-1 w-full min-h-[140px] rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetModalItem();
                }}
                className="w-full rounded-2xl border border-zinc-300 py-3 font-bold hover:bg-zinc-50"
              >
                Cancelar
              </button>

              <button
                onClick={criarItem}
                disabled={criando}
                className="w-full rounded-2xl bg-blue-700 text-white py-3 font-extrabold hover:bg-blue-800 disabled:opacity-60"
              >
                {criando ? "Salvando..." : "Salvar item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: NOVA SUBPASTA */}
      {modalSubpastaOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl rounded-3xl bg-white text-zinc-900 p-6 shadow-xl">
            <h2 className="text-xl font-extrabold">Nova subpasta</h2>
            <p className="text-sm text-zinc-600 mt-1">
              Ex.: Nubank, Itaú, Exames, Processos...
            </p>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-bold text-zinc-700">Nome</label>
                <input
                  value={nomeSubpasta}
                  onChange={(e) => setNomeSubpasta(e.target.value)}
                  placeholder="Ex.: Nubank"
                  className="mt-1 w-full rounded-2xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setModalSubpastaOpen(false);
                  resetModalSubpasta();
                }}
                className="w-full rounded-2xl border border-zinc-300 py-3 font-bold hover:bg-zinc-50"
              >
                Cancelar
              </button>

              <button
                onClick={criarSubpasta}
                disabled={criandoSubpasta}
                className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-extrabold hover:bg-emerald-700 disabled:opacity-60"
              >
                {criandoSubpasta ? "Criando..." : "Criar subpasta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
