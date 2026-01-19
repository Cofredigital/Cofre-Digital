"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);

      // ✅ cria cookie seguro no backend
      const idToken = await cred.user.getIdToken();

      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.log("ERRO FIREBASE LOGIN:", err);
      setErro("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">Entrar</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Acesse sua conta do Cofre Digital.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Senha</label>

            <div className="mt-1 relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-600"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="sua senha"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>

            {/* ✅ Esqueci minha senha */}
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-zinc-600 mt-5">
          Ainda não tem conta?{" "}
          <Link
            className="font-semibold text-zinc-900 hover:underline"
            href="/register"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
