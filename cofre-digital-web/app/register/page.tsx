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
    try {
      setLoading(true);
      setError("");

      // ✅ Cria usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 📅 Data atual
      const now = Timestamp.now();

      // 📅 Trial = agora + 5 dias
      const fiveDaysLater = Timestamp.fromDate(
        new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      );

      // ✅ Salva no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        plan: "free",
        createdAt: now,
        trialEndsAt: fiveDaysLater,
      });

      // ✅ Vai para o painel
      router.push("/painel");

    } catch (err: any) {
      console.error(err);
      setError("Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900">

      <div className="bg-blue-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">

        <h1 className="text-yellow-400 text-2xl font-bold mb-6">
          Criar conta grátis
        </h1>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg"
        />

        {error && (
          <p className="text-red-400 mb-3">{error}</p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-white text-sm mt-4">
          Você terá acesso completo por 5 dias grátis.
        </p>

      </div>

    </div>
  );
}
