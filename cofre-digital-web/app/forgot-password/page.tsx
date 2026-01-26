"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    const value = email.trim();

    if (!value) {
      setError("Digite seu e-mail.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Firebase envia o e-mail de redefinição
      await sendPasswordResetEmail(auth, value);

      setMsg(
        "Pronto! Enviamos um e-mail para você redefinir sua senha. Verifique sua caixa de entrada e também a pasta Spam."
      );
      setEmail("");
    } catch (err: any) {
      const code = err?.code || "";

      if (code === "auth/user-not-found") {
        setError("Não encontramos uma conta com esse e-mail.");
      } else if (code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (code === "auth/too-many-requests") {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError("Erro ao enviar e-mail. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-slate-950 flex items-center justify-center p-4">
      {/* brilhos */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200">
            ✉️ Recuperação de senha
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-3">
            Recuperar senha
          </h1>

          <p className="text-sm text-white/70 mt-1">
            Informe seu e-mail para receber o link de redefinição.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">
              E-mail
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@email.com"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
              <b className="text-red-100">Erro:</b> {error}
            </div>
          )}

          {msg && (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              <b className="text-emerald-100">Ok!</b> {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-bold text-white disabled:opacity-60
              bg-gradient-to-r from-blue-600 to-blue-500
              hover:from-blue-500 hover:to-blue-400
              shadow-lg shadow-blue-500/20
              border border-white/10"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/login"
            className="text-sm text-yellow-200 hover:text-yellow-100 underline underline-offset-4 decoration-yellow-200/40 hover:decoration-yellow-200"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
