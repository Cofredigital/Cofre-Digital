"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Folder = {
  id: string;
  name?: string;
};

type SearchResult = {
  pastaId: string;
  pastaNome: string;
  subpastaId: string;
  subpastaNome: string;
  itemId: string;
  titulo: string;
  tipo: "nota" | "senha" | "link";
  snippet: string;
};

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  // ✅ SEED automático
  const [seeding, setSeeding] = useState(false);
  const [seededOnce, setSeededOnce] = useState(false);

  // ✅ Pesquisa global
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchMsg, setSearchMsg] = useState<string>("Digite para pesquisar");
  const [searchError, setSearchError] = useState<string | null>(null);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  async function loadFolders() {
    try {
      setLoading(true);

      const resp = await fetch("/api/folders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro /api/folders:", data);
        setFolders([]);
        return [];
      }

      const list = (data.folders || []) as Folder[];
      setFolders(list);
      return list;
    } catch (err) {
      console.error("Erro carregando pastas:", err);
      setFolders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function seedDefaultFolders() {
    try {
      setSeeding(true);

      const resp = await fetch("/api/folders/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro /api/folders/seed:", data);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Erro seeding:", err);
      return false;
    } finally {
      setSeeding(false);
    }
  }

  // ✅ Carrega e faz SEED automático quando conta for nova
  useEffect(() => {
    (async () => {
      const list = await loadFolders();

      // ✅ Se for conta nova: cria automaticamente as pastas padrão
      if (!seededOnce && list.length === 0) {
        setSeededOnce(true);
        const ok = await seedDefaultFolders();
        if (ok) {
          await loadFolders();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateFolder() {
    const name = prompt("Nome da nova pasta:");
    if (!name || !name.trim()) return;

    try {
      setCreating(true);

      const resp = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro criando pasta:", data);
        alert(data?.error || "Erro ao criar pasta.");
        return;
      }

      await loadFolders();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pasta.");
    } finally {
      setCreating(false);
    }
  }

  async function runSearch(text: string) {
    const query = text.trim();

    setSearchError(null);

    if (query.length < 2) {
      setResults([]);
      setSearchMsg("Digite para pesquisar");
      return;
    }

    try {
      setSearching(true);
      setSearchMsg("Pesquisando...");

      const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro /api/search:", data);
        setResults([]);
        setSearchMsg("Erro ao pesquisar.");
        setSearchError(data?.error || "Erro ao pesquisar");
        return;
      }

      const list = (data.results || []) as SearchResult[];
      setResults(list);

      if (list.length === 0) {
        setSearchMsg("Nenhum item encontrado.");
      } else {
        setSearchMsg("");
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setSearchMsg("Erro ao pesquisar.");
      setSearchError("Falha ao conectar na pesquisa.");
    } finally {
      setSearching(false);
    }
  }

  // debounce simples
  useEffect(() => {
    const t = setTimeout(() => runSearch(q), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Meu Cofre</h1>
            <p className="text-white/75 text-sm mt-2">
              Pastas, subpastas e itens com segurança.
            </p>
          </div>

          <button
            onClick={handleCreateFolder}
            disabled={creating}
            className="rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-emerald-950 hover:bg-emerald-300 transition disabled:opacity-60"
          >
            {creating ? "Criando..." : "+ Nova pasta"}
          </button>
        </div>

        {/* ✅ Pesquisa global */}
        <div className="rounded-3xl bg-white/10 border border-white/15 p-6 shadow-xl">
          <div className="flex items-center gap-2 font-extrabold text-lg">
            🔍 Pesquisa global
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Digite nome do documento, senha, palavra-chave..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 outline-none focus:ring-2 focus:ring-yellow-300/70"
            />

            <button
              onClick={() => {
                setQ("");
                setResults([]);
                setSearchMsg("Digite para pesquisar");
                setSearchError(null);
              }}
              className="rounded-2xl bg-white/15 border border-white/15 px-6 py-4 font-extrabold hover:bg-white/20 transition"
            >
              Limpar
            </button>

            <div className="text-xs text-white/60 flex items-center">
              {searching
                ? "Pesquisando..."
                : canSearch
                ? `${results.length} resultado(s)`
                : "Digite para pesquisar"}
            </div>
          </div>

          <div className="mt-2 text-xs text-white/60">
            Dica: use pelo menos 2 letras. Ex.: "cpf", "nubank", "cartório", "senha".
          </div>

          {searchError && (
            <div className="mt-4 rounded-2xl border border-red-300/30 bg-red-500/15 p-4 text-sm text-red-100">
              {searchError}
            </div>
          )}

          {/* Resultados */}
          <div className="mt-4">
            {searchMsg && (
              <div className="rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-white/70">
                {searchMsg}
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-3 grid gap-3">
                {results.map((r) => (
                  <Link
                    key={`${r.pastaId}-${r.subpastaId}-${r.itemId}`}
                    href={`/pasta/${r.pastaId}?sub=${r.subpastaId}&item=${r.itemId}`}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4 hover:bg-white/15 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold">
                          {r.tipo === "nota" && "📝 "}
                          {r.tipo === "senha" && "🔑 "}
                          {r.tipo === "link" && "🔗 "}
                          {r.titulo}
                        </div>

                        <div className="text-xs text-white/70 mt-1">
                          Pasta: <b>{r.pastaNome}</b> • Subpasta:{" "}
                          <b>{r.subpastaNome || "Itens da pasta"}</b>
                        </div>

                        {r.snippet && (
                          <div className="text-sm text-white/80 mt-2">
                            {r.snippet}
                          </div>
                        )}
                      </div>

                      <div className="text-xs font-bold text-yellow-200/90">
                        Abrir →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Pastas */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              Carregando pastas...
            </div>
          ) : seeding ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              Criando pastas padrão da sua conta... (1ª vez)
            </div>
          ) : folders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="font-bold">Nenhuma pasta encontrada.</p>
              <p className="text-white/70 text-sm mt-1">
                Clique em <b>+ Nova pasta</b> para criar sua primeira pasta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/pasta/${folder.id}`}
                  className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg hover:bg-white/15 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                      📁
                    </div>

                    <div>
                      <div className="font-extrabold text-lg">
                        {folder.name || "Sem nome"}
                      </div>
                      <div className="text-white/60 text-xs">
                        ID: {folder.id}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-16 text-sm text-white/60">
          © {new Date().getFullYear()} Cofre Digital
        </footer>
      </div>
    </main>
  );
}
