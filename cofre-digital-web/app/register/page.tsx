"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleRegister() {
    setError("");
    setLoading(true);

    try {
      // cria no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // data de teste grátis: agora + 5 dias
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 5);

      // salva no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: Timestamp.now(),
        trialEndsAt: Timestamp.fromDate(trialEnd),
        plan: "trial"
      });

      // FINALIZA loading
      setLoading(false);

      // redireciona
      router.push("/success");

    } catch (err: any) {
      console.error(err);
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#0d2fb8,#1146ff)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#ffffff",
        padding: "40px",
        borderRadius: "12px",
        width: "320px",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#1146ff" }}>
          Criar conta grátis
        </h2>

        <input
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "red", fontSize: "14px" }}>{error}</p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            background: "#ffcc00",
            border: "none",
            padding: "12px",
            width: "100%",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "10px"
          }}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p style={{ marginTop: "12px", fontSize: "13px" }}>
          Você terá acesso completo por 5 dias grátis.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc"
};
