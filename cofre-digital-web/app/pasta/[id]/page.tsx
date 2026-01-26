"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  addDoc,
  collection,
  getDocs,
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
  criadoEm?: any;
  fileUrl?: string;
  fileName?: string;
};

/* ================= PAGE ================= */

export default function PastaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const pastaId = params?.id || "";
  const subFromUrl = searchParams.get("sub") || "";

  const [uid, setUid] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<ItemType>("nota");
  const [conteudo, setConteudo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [qBusca, setQBusca] = useState("");

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

  /* ================= LOAD ================= */

  async function carregarItens() {
    if (!uid || !pastaId) return;

    setLoading(true);

    const col = collection(db, "users", uid, "pastas", pastaId, "itens");
    const q = query(col, orderBy("criadoEm", "desc"));

    const snap = await getDocs(q);
    setItens(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));

    setLoading(false);
  }

  useEffect(() => {
    carregarItens();
  }, [uid, pastaId, subFromUrl]);

  /* ================= UPLOAD ================= */

  async function uploadFile(selected: File) {
    const form = new FormData();
    form.append("file", selected);

    const resp = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error("Erro no upload");

    return data;
  }

  /* ================= CREATE ================= */

  async function criarItem() {
    if (salvando) return;

    if (!titulo.trim()) return alert("Digite o título");

    if (tipo !== "arquivo" && !conteudo.trim())
      return alert("Digite o conteúdo");

    if (tipo === "arquivo" && !file)
      return alert("Selecione o arquivo");

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

      await carregarItens();

      setModalOpen(false);
      setTitulo("");
      setConteudo("");
      setFile(null);
      setTipo("nota");

    } catch {
      alert("Erro ao salvar item");
    } finally {
      setSalvando(false);
    }
  }

  /* ================= FILTER ================= */

  const itensFiltrados = useMemo(() => {
    const term = qBusca.toLowerCase();
    if (!term) return itens;

    return itens.filter(i =>
      [i.titulo, i.conteudo, i.tipo, i.fileName]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [itens, qBusca]);

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black text-white p-10">

      <h1 className="text-4xl font-extrabold mb-6 text-yellow-400 drop-shadow">
        Cofre Digital
      </h1>

      <div className="flex gap-3 mb-6">

        <input
          value={qBusca}
          onChange={e=>setQBusca(e.target.value)}
          placeholder="🔍 Buscar itens..."
          className="bg-white/10 border border-yellow-400/30 rounded-xl px-4 py-2 outline-none w-64"
        />

        <button
          onClick={()=>setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-xl font-bold shadow-lg"
        >
          ➕ Novo item
        </button>

      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">

          {itensFiltrados.map(item => (
            <div
              key={item.id}
              className="bg-white/10 border border-yellow-400/20 rounded-2xl p-4 shadow-xl hover:scale-[1.02] transition"
            >
              <h3 className="text-lg font-bold text-yellow-300">
                {item.titulo}
              </h3>

              <p className="text-sm text-white/80 mt-1">
                Tipo: {item.tipo}
              </p>

              {item.conteudo && (
                <div className="mt-3 bg-black/30 rounded-xl p-3 text-sm">
                  {item.conteudo}
                </div>
              )}

              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  target="_blank"
                  className="inline-block mt-3 bg-blue-600 px-4 py-2 rounded-xl font-bold"
                >
                  Abrir arquivo
                </a>
              )}
            </div>
          ))}

        </div>
      )}

      {/* MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fadeIn">

          <div className="bg-white text-black p-6 rounded-3xl w-[420px] shadow-2xl scale-100 animate-slideUp">

            <h2 className="text-2xl font-extrabold text-blue-700 mb-3">
              Novo item
            </h2>

            <input
              value={titulo}
              onChange={e=>setTitulo(e.target.value)}
              placeholder="Título"
              className="w-full border rounded-xl p-3 mb-3"
            />

            <select
              value={tipo}
              onChange={e=>setTipo(e.target.value as ItemType)}
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
                onChange={e=>setConteudo(e.target.value)}
                className="w-full border rounded-xl p-3 mb-3 min-h-[120px]"
              />
            ) : (
              <input
                type="file"
                onChange={e=>setFile(e.target.files?.[0] || null)}
                className="mb-3"
              />
            )}

            <div className="flex gap-3 mt-4">

              <button
                onClick={()=>setModalOpen(false)}
                className="flex-1 border rounded-xl py-3 font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={criarItem}
                disabled={salvando}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-extrabold hover:bg-blue-700 transition"
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
