"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SE JÁ ESTIVER LOGADO -> MANDA PRO DASHBOARD
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, senha);

      // ✅ login OK -> vai pro dashboard
      router.replace("/dashboard");
    } catch (err: any) {
      alert("Erro ao entrar. Verifique e-mail e senha.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-gray-900">Entrar</h1>
        <p className="text-sm text-gray-600 mt-1">
          Acesse sua conta do Cofre Digital.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="seuemail@email.com"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              type="password"
              placeholder="sua senha"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 py-4 font-extrabold text-white hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Ainda não tem conta?{" "}
            <Link href="/register" className="font-bold text-blue-700 hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
