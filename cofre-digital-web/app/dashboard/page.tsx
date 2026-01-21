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
  snippet?: string;
};

function iconByType(tipo: SearchResult["tipo"]) {
  if (tipo === "senha") return "🔑";
  if (tipo === "link") return "🔗";
  return "📝";
}

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 🔍 GLOBAL SEARCH
  const [q, setQ] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

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
        return;
      }

      setFolders(data.folders || []);
    } catch (err) {
      console.error("Erro carregando pastas:", err);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFolders();
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

  // ✅ Pesquisa global com debounce (espera usuário parar de digitar)
  useEffect(() => {
    const value = q.trim();
    setSearchError(null);

    if (value.length < 2) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(value)}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await resp.json();

        if (!resp.ok) {
          setResults([]);
          setSearchError(data?.error || "Erro ao pesquisar.");
          return;
        }

        setResults(data.results || []);
      } catch (err) {
        setSearchError("Erro ao pesquisar.");
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [q]);

  const hasSearch = useMemo(() => q.trim().length >= 2, [q]);
  const hasResults = results.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-800 to-blue-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Meu Cofre</h1>
            <p className="text-white/70 text-sm mt-2">
              Pastas, subpastas e itens com segurança.
            </p>
          </div>

          <button
            onClick={handleCreateFolder}
            disabled={creating}
            className="rounded-2xl bg-emerald-400 px-5 py-3 font-extrabold text-emerald-950 hover:bg-emerald-300 transition disabled:opacity-60"
          >
            {creating ? "Criando..." : "+ Nova pasta"}
          </button>
        </div>

        {/* 🔍 Pesquisa global */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="text-sm font-extrabold mb-2">🔍 Pesquisa global</div>

              <div className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Digite nome do documento, senha, palavra-chave..."
                  className="w-full rounded-2xl bg-white/15 border border-white/15 px-4 py-3 outline-none placeholder:text-white/50 focus:ring-2 focus:ring-yellow-300/70"
                />

                <button
                  onClick={() => setQ("")}
                  className="rounded-2xl bg-white/20 border border-white/15 px-4 py-3 font-bold hover:bg-white/25"
                >
                  Limpar
                </button>
              </div>

              <div className="mt-2 text-xs text-white/60">
                Dica: use pelo menos 2 letras. Ex.: “cpf”, “nubank”, “cartório”, “senha”.
              </div>
            </div>

            <div className="text-xs text-white/70">
              {searchLoading ? "Pesquisando..." : hasSearch ? `${results.length} resultado(s)` : "Digite para pesquisar"}
            </div>
          </div>

          {searchError && (
            <div className="mt-3 rounded-2xl border border-red-300/30 bg-red-500/15 p-4 text-sm text-red-100">
              {searchError}
            </div>
          )}

          {/* Resultados */}
          {hasSearch && (
            <div className="mt-5">
              {!hasResults && !searchLoading ? (
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
                  Nenhum item encontrado.
                </div>
              ) : (
                <div className="grid gap-3">
                  {results.map((r) => {
                    const href = `/pasta/${r.pastaId}?sub=${encodeURIComponent(
                      r.subpastaId || ""
                    )}&item=${encodeURIComponent(r.itemId)}`;

                    return (
                      <Link
                        key={`${r.pastaId}-${r.subpastaId}-${r.itemId}`}
                        href={href}
                        className="rounded-3xl border border-white/15 bg-white/10 p-4 hover:bg-white/15 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-extrabold text-lg">
                              {iconByType(r.tipo)} {r.titulo || "Sem título"}
                            </div>

                            <div className="text-xs text-white/70 mt-1">
                              📁 {r.pastaNome}
                              {r.subpastaId ? (
                                <>
                                  {" "}
                                  • 📂 {r.subpastaNome}
                                </>
                              ) : (
                                ""
                              )}
                            </div>

                            {r.snippet && (
                              <div className="mt-2 text-sm text-white/80">
                                {r.snippet}
                                {r.snippet.length >= 120 ? "..." : ""}
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl bg-yellow-300 text-blue-950 px-4 py-2 text-xs font-extrabold">
                            Abrir
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pastas */}
        <div className="mt-10">
          {loading ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
              Carregando pastas...
            </div>
          ) : folders.length === 0 ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
              <p className="font-bold">Nenhuma pasta encontrada.</p>
              <p className="text-white/70 text-sm mt-1">
                Clique em <b>+ Nova pasta</b> para criar sua primeira pasta.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/pasta/${folder.id}`}
                  className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg hover:bg-white/15 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center text-xl">
                      📁
                    </div>
                    <div>
                      <div className="font-extrabold text-lg">
                        {folder.name || "Sem nome"}
                      </div>
                      <div className="text-white/60 text-xs">ID: {folder.id}</div>
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
