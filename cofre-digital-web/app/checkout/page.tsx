"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { auth } from "@/lib/firebase";

const PLAN_LABELS: Record<string, string> = {
  "24h": "Plano 24 horas",
  mensal: "Plano Mensal",
  premium: "Plano Premium",
};

type Props = {
  searchParams?: {
    plan?: string;
    type?: string;
  };
};

export default function CheckoutPage({ searchParams }: Props) {
  const plan = searchParams?.plan || "mensal";
  const type = (searchParams?.type || "standard") as "standard" | "annual";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <h1>Checkout</h1>

      <p>Plano: {PLAN_LABELS[plan] || plan}</p>
      <p>Tipo: {type}</p>

      <Link href="/planos">Voltar</Link>
    </div>
  );
}
