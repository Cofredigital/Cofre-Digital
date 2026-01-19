"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Folder = {
  id: string;
  title: string;
  desc?: string;
  icon?: string;
  parentId: string | null;
  createdAt?: any;
};

type SearchResult =
  | { kind: "folder"; id: string; title: string; icon?: string }
  | {
      kind: "subfolder";
      pastaId: string;
      subId: string;
      nome: string;
      pastaTitle: string;
    }
  | {
      kind: "item";
      pastaId: string;
      subId?: string;
      pastaTitle: string;
      subTitle?: string;
      itemId: string;
      titulo: string;
      tipo: "nota" | "senha" | "link";
    };

const DEFAULT_FOLDERS: Array<Omit<Folder, "id" | "createdAt">> = [
  {
    title: "Bancos",
    desc: "Contas bancárias, agência, pix, senhas",
    icon: "🏦",
    parentId: null,
  },
  {
    title: "Contas a pagar",
    desc: "Boletos, vencimentos e lembretes",
    icon: "🧾",
    parentId: null,
  },
  {
    title: "Diversão",
    desc: "Netflix, Spotify e assinaturas",
    icon: "🎮",
    parentId: null,
  },
  { title: "Emails", desc: "Emails, recuperação, códigos", icon: "📧", parentId: null },
  {
    title: "Certidões",
    desc: "Certidão, RG, CPF, CNH e PDFs",
    icon: "📜",
    parentId: null,
  },
  {
    title: "Cartório",
    desc: "Registros e documentos cartoriais",
    icon: "🏛️",
    parentId: null,
  },
  {
    title: "Escrituras",
    desc: "Imóveis, contratos e anexos",
    icon: "🏠",
    parentId: null,
  },
  { title: "Fotos", desc: "Fotos importantes e arquivos pessoais", icon: "📷", parentId: null },
  { title: "Viagem", desc: "Passagens, reservas, documentos", icon: "✈️", parentId: null },

  // ✅ extras que você pediu:
  { title: "Médico", desc: "Exames, receitas, laudos e carteirinhas", icon: "🩺", parentId: null },
  { title: "Advogado", desc: "Ações, processos e contratos", icon: "⚖️", parentId: null },
];

function normalize(txt: string) {
  return (txt || "").toLowerCase().trim();
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [uid, setUid] = useState<string>("");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);

  // 🔎 Pesquisa global
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  async function seedDefaultFoldersIfEmpty(userId: string) {
    const colRef = collection(db, "users", userId, "folders");
    const snap = await getDocs(colRef);
    if (!snap.empty) return;

    for (const f of DEFAULT_FOLDERS) {
      await addDoc(colRef, {
        title: f.title,
        desc: f.desc || "",
        icon: f.icon || "📁",
        parentId: null,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function loadFolders(userId: string) {
    setLoadingFolders(true);
    const colRef = collection(db, "users", userId, "folders");
    const q = query(colRef, orderBy("createdAt", "asc"));
    const snap = await getDocs(q);

    const list: Folder[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title,
        desc: data.desc || "",
        icon: data.icon || "📁",
        parentId: data.parentId ?? null,
        createdAt: data.createdAt,
      };
    });

    setFolders(list.filter((x) => x.parentId === null));
    setLoadingFolders(false);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      setUid(user.uid);

      await seedDefaultFoldersIfEmpty(user.uid);
      await loadFolders(user.uid);
    });

    return () => unsub();
  }, [router]);

  const filteredFolders = useMemo(() => {
    const s = normalize(search);
    if (!s) return folders;

    return folders.filter((f) => {
      const t = normalize(f.title);
      const d = normalize(f.desc || "");
      return t.includes(s) || d.includes(s);
    });
  }, [folders, search]);

  async function handleLogout() {
    try {
      await signOut(auth);
      await fetch("/api/session", { method: "DELETE" });
      router.push("/login");
    } catch (e) {
      alert("Erro ao sair.");
    }
  }

  async function createFolder() {
    try {
      if (!uid) return;

      const title = prompt("Nome da nova pasta:");
      if (!title || !title.trim()) return;

      const icon = prompt("Emoji da pasta (ex: 🩺 ⚖️ 📁):") || "📁";

      const colRef = collection(db, "users", uid, "folders");
      await addDoc(colRef, {
        title: title.trim(),
        desc: "",
        icon: icon.trim() || "📁",
        parentId: null,
        createdAt: serverTimestamp(),
      });

      await loadFolders(uid);
    } catch (e) {
      alert("Erro ao criar pasta.");
    }
  }

  // 🔥 PESQUISA GLOBAL
  async function runGlobalSearch(q: string) {
    const term = normalize(q);
    if (!uid || !term) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const results: SearchResult[] = [];

      // 1) Pastas principais do dashboard (folders)
      for (const f of folders) {
        if (normalize(f.title).includes(term) || normalize(f.desc || "").includes(term)) {
          results.push({ kind: "folder", id: f.id, title: f.title, icon: f.icon });
        }
      }

      // 2) Cofre real: users/{uid}/pastas/{pastaId}
      const pastaSnap = await getDocs(collection(db, "users", uid, "pastas"));

      for (const pastaDoc of pastaSnap.docs) {
        const pastaId = pastaDoc.id;
        const pastaData = pastaDoc.data() as any;

        const pastaTitle = pastaData?.nome || pastaData?.title || "Pasta";

        // 2.1) itens dentro da pasta principal
        const itensSnap = await getDocs(
          query(
            collection(db, "users", uid, "pastas", pastaId, "itens"),
            orderBy("criadoEm", "desc")
          )
        );

        for (const itDoc of itensSnap.docs) {
          const it = itDoc.data() as any;
          const titulo = it?.titulo || "";
          const conteudo = it?.conteudo || "";
          const tipo = (it?.tipo || "nota") as "nota" | "senha" | "link";

          if (normalize(titulo).includes(term) || normalize(conteudo).includes(term)) {
            results.push({
              kind: "item",
              pastaId,
              pastaTitle,
              itemId: itDoc.id,
              titulo,
              tipo,
            });
          }
        }

        // 2.2) subpastas
        const subSnap = await getDocs(
          query(
            collection(db, "users", uid, "pastas", pastaId, "subpastas"),
            orderBy("criadoEm", "desc")
          )
        );

        for (const subDoc of subSnap.docs) {
          const subId = subDoc.id;
          const subData = subDoc.data() as any;
          const subNome = subData?.nome || "Subpasta";

          if (normalize(subNome).includes(term)) {
            results.push({
              kind: "subfolder",
              pastaId,
              subId,
              nome: subNome,
              pastaTitle,
            });
          }

          // itens dentro da subpasta
          const itensSubSnap = await getDocs(
            query(
              collection(db, "users", uid, "pastas", pastaId, "subpastas", subId, "itens"),
              orderBy("criadoEm", "desc")
            )
          );

          for (const itSubDoc of itensSubSnap.docs) {
            const it = itSubDoc.data() as any;
            const titulo = it?.titulo || "";
            const conteudo = it?.conteudo || "";
            const tipo = (it?.tipo || "nota") as "nota" | "senha" | "link";

            if (normalize(titulo).includes(term) || normalize(conteudo).includes(term)) {
              results.push({
                kind: "item",
                pastaId,
                subId,
                pastaTitle,
                subTitle: subNome,
                itemId: itSubDoc.id,
                titulo,
                tipo,
              });
            }
          }
        }
      }

      setSearchResults(results.slice(0, 20));
    } catch (err) {
      console.log("ERRO pesquisa:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  // Delay pra pesquisa não travar
  useEffect(() => {
    const s = search.trim();
    if (!s) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(() => runGlobalSearch(s), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, uid]);

  // ✅ AGORA COM itemId (scroll/destaque)
  function openResult(r: SearchResult) {
    if (r.kind === "folder") {
      router.push(`/pasta/${r.id}`);
      return;
    }

    if (r.kind === "subfolder") {
      router.push(`/pasta/${r.pastaId}?sub=${r.subId}`);
      return;
    }

    // item
    if (r.subId) {
      router.push(`/pasta/${r.pastaId}?sub=${r.subId}&item=${r.itemId}`);
    } else {
      router.push(`/pasta/${r.pastaId}?item=${r.itemId}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold">Meu Cofre</h1>
            <p className="text-sm text-white/80">Bem-vindo, {email}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* ✅ CORREÇÃO AQUI: Home agora vai para o cofre e NÃO para "/" */}
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/30 px-5 py-2 font-semibold hover:bg-white/10"
            >
              Home
            </Link>

            <button
              onClick={createFolder}
              className="rounded-2xl bg-emerald-500 px-5 py-2 font-extrabold text-white hover:bg-emerald-600"
            >
              + Nova pasta
            </button>

            <button
              onClick={handleLogout}
              className="rounded-2xl bg-white px-5 py-2 font-semibold text-blue-900 hover:bg-blue-50"
            >
              Sair
            </button>
          </div>
        </header>

        {/* 🔎 Pesquisa Global */}
        <section className="mt-8">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="text-xl">🔎</div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar no cofre (pastas, subpastas e itens)..."
                className="w-full bg-transparent outline-none text-white placeholder:text-white/60"
              />
              {searchLoading && <div className="text-xs text-white/70">pesquisando...</div>}
            </div>

            {/* Resultados */}
            {searchResults.length > 0 && (
              <div className="mt-4 grid gap-2">
                {searchResults.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => openResult(r)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-black/20 hover:bg-black/30 px-4 py-3 transition"
                  >
                    {r.kind === "folder" && (
                      <div className="text-sm">
                        <b>
                          {r.icon || "📁"} {r.title}
                        </b>
                        <div className="text-xs text-white/70">📁 Pasta principal</div>
                      </div>
                    )}

                    {r.kind === "subfolder" && (
                      <div className="text-sm">
                        <b>📂 {r.nome}</b>
                        <div className="text-xs text-white/70">
                          📁 {r.pastaTitle} → 📂 {r.nome}
                        </div>
                      </div>
                    )}

                    {r.kind === "item" && (
                      <div className="text-sm">
                        <b>
                          {r.tipo === "nota" && "📝 "}
                          {r.tipo === "senha" && "🔑 "}
                          {r.tipo === "link" && "🔗 "}
                          {r.titulo}
                        </b>
                        <div className="text-xs text-white/70">
                          📁 {r.pastaTitle}
                          {r.subTitle ? ` → 📂 ${r.subTitle}` : ""}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cards */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {loadingFolders && <div className="text-white/80">Carregando pastas...</div>}

          {!loadingFolders && filteredFolders.length === 0 && (
            <div className="text-white/80">Nenhuma pasta encontrada.</div>
          )}

          {!loadingFolders &&
            filteredFolders.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl bg-white/10 p-6 shadow-xl border border-white/10"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>{c.icon || "📁"}</span> {c.title}
                </h2>

                <p className="mt-2 text-white/80">{c.desc || "Pasta do seu cofre digital."}</p>

                <Link
                  href={`/pasta/${c.id}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 font-bold text-blue-900 hover:bg-blue-50"
                >
                  Abrir
                </Link>
              </div>
            ))}
        </section>

        {/* Info */}
        <section className="mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-sm text-white/80">
            ✅ Dica: dentro de cada pasta, você pode criar <b>subpastas</b> (ex: Bancos → Nubank / Itaú).
          </div>
        </section>
      </div>
    </main>
  );
}
