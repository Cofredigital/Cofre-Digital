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
        "Pronto! Enviamos um e-mail para você redefinir sua senha. Verifique sua caixa de entrada e spam."
      );
      setEmail("");
    } catch (err: any) {
      // Mensagem amigável
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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          Recuperar senha
        </h1>
        <p style={{ color: "#555", marginBottom: 16 }}>
          Informe seu e-mail para receber o link de redefinição.
        </p>

        <form onSubmit={handleReset}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@email.com"
            type="email"
            style={{
              width: "100%",
              height: 44,
              marginTop: 6,
              marginBottom: 12,
              borderRadius: 10,
              border: "1px solid #d7dbe5",
              padding: "0 12px",
              outline: "none",
            }}
          />

          {error && (
            <div
              style={{
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#b91c1c",
                padding: 10,
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          {msg && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: 10,
                borderRadius: 10,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              background: "#0b3bdb",
              color: "white",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Link href="/login" style={{ color: "#0b3bdb", fontWeight: 700 }}>
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
