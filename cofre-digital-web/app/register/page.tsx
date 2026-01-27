"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const now = Timestamp.now();

      // +5 dias grátis
      const trialEndsAt = Timestamp.fromMillis(
        now.toMillis() + 5 * 24 * 60 * 60 * 1000
      );

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: now,
        trialEndsAt,
        plan: "free_trial",
      });

      alert("Conta criada! Você tem 5 dias grátis 🎉");

      window.location.href = "/dashboard";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-900 text-white">
      <div className="bg-blue-800 p-8 rounded-xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Criar conta grátis (5 dias)
        </h1>

        <input
          placeholder="Nome"
          className="w-full mb-3 p-3 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full mb-3 p-3 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full mb-4 p-3 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded hover:bg-yellow-500"
        >
          {loading ? "Criando..." : "Criar conta grátis"}
        </button>

      </div>
    </main>
  );
}
