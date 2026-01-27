"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleRegister() {
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Data atual
      const now = Timestamp.now();

      // Trial de 5 dias
      const trialEndsAt = Timestamp.fromMillis(
        now.toMillis() + 5 * 24 * 60 * 60 * 1000
      );

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        plan: "trial",
        status: "active",
        createdAt: now,
        trialEndsAt: trialEndsAt,
      });

      router.push("/dashboard");
    } catch (error: any) {
      alert("Erro ao criar conta: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 text-white px-4">
      <div className="bg-blue-800/60 backdrop-blur rounded-2xl p-8 w-full max-w-md shadow-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">
          Criar conta grátis
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none"
          />

          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Criando conta..." : "Criar conta grátis por 5 dias"}
          </button>

        </div>

        <p className="text-center text-sm mt-6 text-blue-100">
          Você terá acesso completo por 5 dias grátis.
        </p>

      </div>
    </main>
  );
}
