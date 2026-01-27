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
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // 👉 cria data de teste grátis (5 dias)
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 5);

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        plan: "free_trial",
        trialEndsAt: Timestamp.fromDate(trialEnds),
        createdAt: Timestamp.now(),
      });

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700 text-white px-4">
      <div className="bg-blue-800 p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Criar conta grátis
        </h1>

        <input
          type="text"
          placeholder="Seu nome"
          className="w-full mb-3 px-4 py-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-4 py-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-4 px-4 py-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-2 rounded font-semibold hover:bg-yellow-300 transition"
        >
          {loading ? "Criando conta..." : "Começar grátis por 5 dias"}
        </button>

      </div>
    </main>
  );
}
