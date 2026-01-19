"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Se o usuário já estiver logado → manda direto pro cofre
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      // 1) Login Firebase
      const cred = await signInWithEmailAndPassword(auth, email, senha);

      // 2) Pega o token do Firebase
      const token = await getIdToken(cred.user, true);

      // 3) ✅ Cria cookie de sessão no servidor (ESSA É A DIFERENÇA!)
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        console.log("Erro /api/session:", await res.text());
        alert("Erro ao criar sessão. Tente novamente.");
        return;
      }

      // 4) Vai para o painel
      router.replace("/dashboard");
    } catch (err: any) {
      alert("Login inválido. Confira e-mail e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900">Entrar</h1>
        <p className="mt-1 text-sm text-gray-600">
          Acesse sua conta do Cofre Digital.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="seuemail@email.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="sua senha"
              type="password"
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-700 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-blue-700 py-4 font-extrabold text-white hover:bg-blue-800 transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-700 hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
