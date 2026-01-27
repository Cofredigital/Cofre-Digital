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

  const router = useRouter();

  async function handleRegister() {
    if (!name || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Cria usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 2️⃣ Calcula 5 dias grátis
      const now = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(now.getDate() + 5);

      // 3️⃣ Salva no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: Timestamp.fromDate(now),
        trialEnd: Timestamp.fromDate(trialEnd),
        plan: "free-trial",
      });

      // 4️⃣ Finaliza loading e vai pro painel
      setLoading(false);
      router.push("/panel");

    } catch (error: any) {
      console.error(error);
      setLoading(false);
      alert("Erro ao criar conta: " + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900">
      <div className="bg-blue-800 p-8 rounded-xl w-full max-w-md shadow-xl">

        <h1 className="text-yellow-400 text-2xl font-bold text-center mb-6">
          Criar conta grátis
        </h1>

        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded mb-3 text-black"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded mb-3 text-black"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded mb-4 text-black"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <p className="text-center text-white mt-4 text-sm">
          Você terá acesso completo por 5 dias grátis.
        </p>

      </div>
    </div>
  );
}
