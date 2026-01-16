import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cofre Digital",
  description:
    "Seu cofre digital para guardar senhas, documentos e dados importantes com segurança.",
};

function WhatsAppButton() {
  const phone = "5541999176970"; // BR + DDD + numero (sem espaços)

  const message = encodeURIComponent(
    "Olá! Quero conhecer melhor o Cofre Digital e tirar dúvidas sobre os planos."
  );

  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 rounded-full border border-white/15 bg-emerald-500 px-5 py-3 font-extrabold text-emerald-950 shadow-2xl hover:bg-emerald-400 transition"
    >
      💬 WhatsApp
    </a>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white">
        <Header />

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

        <footer className="mx-auto max-w-6xl px-6 pb-10 text-center text-sm text-white/65">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/termos" className="hover:text-white transition">
              Termos de uso
            </Link>
            <span className="text-white/35">•</span>
            <Link href="/privacidade" className="hover:text-white transition">
              Política de privacidade
            </Link>
            <span className="text-white/35">•</span>
            <a
              href="https://wa.me/5541999176970"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Suporte no WhatsApp
            </a>
          </div>

          <div className="mt-3">
            © {new Date().getFullYear()} Cofre Digital — Todos os direitos
            reservados.
          </div>
        </footer>

        <WhatsAppButton />
      </body>
    </html>
  );
}
