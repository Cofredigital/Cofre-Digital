"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Se já estiver logado, não deixa ficar preso no /login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      // 1) Login no Firebase Auth
      await signInWithEmailAndPassword(auth, email, senha);

      // 2) Pegar o usuário atual e gerar o idToken
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não encontrado após login.");

      const idToken = await user.getIdToken();

      // 3) Criar cookie de sessão (server)
      const resp = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro /api/session:", data);
        throw new Error(data?.error || "Erro ao criar sessão.");
      }

      // 4) Redirecionar para o dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm bg-white">
        <h1 className="text-2xl font-bold mb-1">Entrar</h1>
        <p className="text-sm text-gray-600 mb-6">
          Acesse sua conta do Cofre Digital.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
