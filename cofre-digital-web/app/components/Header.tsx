"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white text-blue-900"
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* ESQUERDA: LOGO + NOME */}
        <Link href="/" className="flex items-center gap-4">
          {/* Logo grande */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow">
            <img
              src="/logo-cofre.png"
              alt="Logo Cofre Digital"
              className="h-11 w-11 object-contain"
            />
          </div>

          <div className="leading-tight">
            <div className="text-lg font-extrabold text-white">Cofre Digital</div>
            <div className="text-xs text-white/70">
              Organização digital não é luxo — é proteção.
            </div>
          </div>
        </Link>

        {/* CENTRO: MENU */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavItem href="/" label="Início" />
          <NavItem href="/planos" label="Planos" />
          <NavItem href="/dashboard" label="Painel" />
        </nav>

        {/* DIREITA: BOTÕES + AVATAR */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-900 hover:bg-white/90 transition"
          >
            Criar conta
          </Link>

          {/* Avatar grande */}
          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow">
            <img
              src="/avatar-cofre.png"
              alt="Avatar Cofre Digital"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
