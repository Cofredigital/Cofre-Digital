"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout ao chamar API (demorou demais).")), timeoutMs)
    ),
  ]);
}

function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs)),
  ]);
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<string>("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setStep("");
    setLoading(true);

    try {
      setStep("1/4 Criando usuário...");

      // 1) cria usuário
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const user = cred.user;
      if (!user) throw new Error("Falha ao criar usuário.");

      // ✅ 2) cria sessão primeiro (pra não travar usuário)
      setStep("2/4 Criando sessão...");

      const idToken = await user.getIdToken(true);

      const resp = await fetchWithTimeout(
        "/api/session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        },
        12000
      );

      const data = await resp.json();

      if (!resp.ok) {
        console.error("Erro /api/session:", data);
        throw new Error(data?.error || "Erro ao criar sessão.");
      }

      // ✅ 3) agora tenta salvar plano trial (mas sem travar a pessoa)
      setStep("3/4 Salvando plano trial (5 dias)...");

      const now = Date.now();
      const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
      const trialEndsAtMs = now + FIVE_DAYS_MS;

      try {
        // se o Firestore travar/bloquear, não vamos prender o usuário aqui
        await promiseWithTimeout(
          setDoc(
            doc(db, "users", user.uid),
            {
              uid: user.uid,
              email: user.email || email,
              planStatus: "trial",
              trialStartedAtMs: now,
              trialEndsAtMs,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ),
          6000,
          "Timeout salvando plano no Firestore."
        );
      } catch (err) {
        // ⚠️ não trava o usuário — só registra no console
        console.warn("Aviso: falha ao salvar trial no Firestore:", err);
      }

      setStep("4/4 Entrando no painel...");

      // ✅ 4) entra
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.log("ERRO REGISTER:", err);

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

      setStep("");
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

          {loading && step && (
            <div className="text-sm text-blue-800 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl">
              {step}
            </div>
          )}

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
