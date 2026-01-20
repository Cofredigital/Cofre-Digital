"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Folder = {
  id: string;
  name?: string;
  createdAt?: any;
};

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadFolders() {
    try {
      setLoading(true);

      const resp = await fetch("/api/folders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="w-full">
      {/* CABEÇALHO */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Meu Cofre</h1>
          <p className="text-white/70 text-sm">
            Suas pastas aparecerão abaixo (uma do lado da outra).
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

      {/* LISTA */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Carregando pastas...
        </div>
      ) : folders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
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
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
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
  );
}
