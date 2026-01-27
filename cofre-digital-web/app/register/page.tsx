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

      // 2️⃣ Salva dados no Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: Timestamp.now(),
        plan: "free",
        trialEndsAt: Timestamp.fromDate(
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // +5 dias
        ),
      });

      // 3️⃣ Redireciona após sucesso
      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);
      alert("Erro ao criar conta: " + error.message);

    } finally {
      // 4️⃣ SEMPRE libera o loading (isso estava faltando!)
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-900">

      <div className="bg-blue-700 p-8 rounded-xl w-[350px] text-center shadow-xl">

        <h1 className="text-yellow-400 text-2xl font-bold mb-6">
          Criar conta grátis
        </h1>

        <input
          className="w-full p-3 mb-3 rounded"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-500 transition"
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
