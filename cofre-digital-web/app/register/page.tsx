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
    if (!name || !email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // cria usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // calcula 5 dias de trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 5);

      // salva no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        plan: "trial",
        trialStart: Timestamp.now(),
        trialEnd: Timestamp.fromDate(trialEnd),
        createdAt: Timestamp.now(),
      });

      // redireciona para o cofre
      router.push("/pasta");

    } catch (err: any) {
      console.error(err);
      setError("Erro ao criar conta. Verifique os dados.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 px-4">

      <div className="bg-blue-800/90 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">

        <h1 className="text-3xl font-bold text-yellow-400 mb-6">
          Criar conta grátis
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400"
          />

          {error && (
            <p className="text-red-300 text-sm">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="text-blue-200 text-sm mt-4">
            Você terá acesso completo por <b>5 dias grátis</b>.
          </p>

        </div>
      </div>

    </main>
  );
}
