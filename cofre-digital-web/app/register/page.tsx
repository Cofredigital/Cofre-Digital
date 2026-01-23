"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      // 1) cria usuário no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, senha);

      const user = cred.user;
      if (!user) throw new Error("Falha ao criar usuário.");

      // 2) cria dados do plano: 5 dias grátis
      const now = Date.now();
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const trialEndsAtMs = now + FIVE_DAYS_MS;

      // 3) cria doc do usuário no Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || email,
          planStatus: "trial", // trial | active | expired
          trialStartedAtMs: now,
          trialEndsAtMs: trialEndsAtMs,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 4) vai pro painel
      router.push("/dashboard");
    } catch (err: any) {
      console.log("ERRO FIREBASE:", err);

      const codigo = err?.code || "";
      if (codigo === "auth/email-already-in-use") {
        setErro("Esse e-mail já está em uso. Tente entrar.");
      } else if (codigo === "auth/weak-password") {
        setErro("Senha fraca. Use pelo menos 6 caracteres.");
      } else if (codigo === "auth/invalid-email") {
        setErro("E-mail inválido. Verifique e tente novamente.");
      } else {
        setErro(err?.message || "Não foi possível criar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 border border-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">Criar conta</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Crie sua conta e ganhe <b>5 dias grátis</b> para testar o Cofre Digital.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {erro && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-zinc-900 text-white py-3 font-semibold hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta (5 dias grátis)"}
          </button>
        </form>

        <p className="text-sm text-zinc-600 mt-5">
          Já tem conta?{" "}
          <Link className="font-semibold text-zinc-900 hover:underline" href="/login">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
