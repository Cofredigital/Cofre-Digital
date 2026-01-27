"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

/* ================= TYPES ================= */

type ItemType = "nota" | "senha" | "link" | "arquivo";

type Item = {
  id: string;
  titulo: string;
  tipo: ItemType;
  conteudo: string;
  fileUrl?: string;
  fileName?: string;
};

/* ================= PAGE ================= */

export default function PastaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const pastaId = params?.id || "";

  const [uid, setUid] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<ItemType>("nota");
  const [conteudo, setConteudo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [busca, setBusca] = useState("");

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.uid);
    });

    return () => unsub();
  }, [router]);

  /* ================= REALTIME LOAD ================= */

  useEffect(() => {
    if (!uid || !pastaId) return;

    const col = collection(db, "users", uid, "pastas", pastaId, "itens");
    const q = query(col, orderBy("criadoEm", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setItens(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [uid, pastaId]);

  /* ================= UPLOAD ================= */

  async function uploadFile(selected: File) {
    const form = new FormData();
    form.append("file", selected);

    const resp = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!resp.ok) throw new Error("Erro upload");

    return await resp.json();
  }

  /* ================= CREATE ================= */

  async function criarItem() {
    if (salvando) return;

    if (!titulo.trim()) return alert("Digite o título");

    if (tipo !== "arquivo" && !conteudo.trim())
      return alert("Digite o conteúdo");

    if (tipo === "arquivo" && !file)
      return alert("Selecione o arquivo");

    // FECHA MODAL IMEDIATO (UX PRO)
    setModalOpen(false);
    setSalvando(true);

    try {
      const col = collection(db, "users", uid, "pastas", pastaId, "itens");

      if (tipo === "arquivo" && file) {
        const uploaded = await uploadFile(file);

        await addDoc(col, {
          titulo,
          tipo,
          conteudo: "",
          fileUrl: uploaded.url,
          fileName: uploaded.originalFilename || file.name,
          criadoEm: serverTimestamp(),
        });
      } else {
        await addDoc(col, {
          titulo,
          tipo,
          conteudo,
          criadoEm: serverTimestamp(),
        });
      }

      // limpa campos
      setTitulo("");
      setConteudo("");
      setFile(null);
      setTipo("nota");

    } catch (err) {
      alert("Erro ao salvar item");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  }

  /* ================= FILTER ================= */

  const itensFiltrados = useMemo(() => {
    const t = busca.toLowerCase();

    if (!t) return itens;

    return itens.filter((i) =>
      [i.titulo, i.conteudo, i.tipo, i.fileName]
        .join(" ")
        .toLowerCase()
        .includes(t)
    );
  }, [busca, itens]);

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white p-10">

      <h1 className="text-4xl font-extrabold mb-6 text-yellow-400">
        Cofre Digital
      </h1>

      <div className="flex gap-3 mb-8">

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔍 Buscar itens..."
          className="bg-white/10 border border-yellow-400/30 rounded-xl px-4 py-2 outline-none w-64"
        />

        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold transition"
        >
          ➕ Novo item
        </button>

      </div>

      {loading && (
        <p className="text-yellow-300 animate-pulse">
          Carregando itens...
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-5">

        {itensFiltrados.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 border border-yellow-400/20 rounded-2xl p-4 hover:scale-[1.03] transition"
          >
            <h3 className="font-bold text-yellow-300">
              {item.titulo}
            </h3>

            <p className="text-sm opacity-70">
              {item.tipo}
            </p>

            {item.conteudo && (
              <div className="mt-3 bg-black/30 p-3 rounded-xl text-sm">
                {item.conteudo}
              </div>
            )}

            {item.fileUrl && (
              <a
                href={item.fileUrl}
                target="_blank"
                className="inline-block mt-3 bg-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Abrir arquivo
              </a>
            )}
          </div>
        ))}

      </div>

      {/* ================= MODAL ================= */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-white text-black p-6 rounded-3xl w-[420px]">

            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              Novo item
            </h2>

            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título"
              className="w-full border rounded-xl p-3 mb-3"
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as ItemType)}
              className="w-full border rounded-xl p-3 mb-3"
            >
              <option value="nota">📝 Nota</option>
              <option value="senha">🔑 Senha</option>
              <option value="link">🔗 Link</option>
              <option value="arquivo">📎 Arquivo</option>
            </select>

            {tipo !== "arquivo" ? (
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full border rounded-xl p-3 mb-3 min-h-[120px]"
              />
            ) : (
              <input
                type="file"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
              />
            )}

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 border rounded-xl py-3 font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={criarItem}
                disabled={salvando}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-bold"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}
