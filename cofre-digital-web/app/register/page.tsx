"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // 1️⃣ Criar usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      // 2️⃣ Calcular trial de 5 dias
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 5);

      // 3️⃣ Salvar no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        plan: "trial",
        trialEndsAt: trialEnd,
        createdAt: serverTimestamp(),
      });

      // 4️⃣ Redirecionar direto pro painel
      router.replace("/dashboard");

    } catch (err: any) {
      console.error("REGISTER ERROR:", err);

      setError(
        err?.message || "Erro ao criar conta. Tente novamente."
      );

      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm text-center">

        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          Criar conta grátis
        </h1>

        <input
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2 mb-3"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-600 mb-3 text-sm">
            {error}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded w-full transition"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          Você terá acesso completo por 5 dias grátis.
        </p>

      </div>
    </div>
  );
}
