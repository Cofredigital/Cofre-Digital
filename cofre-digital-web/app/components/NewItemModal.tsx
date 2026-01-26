"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void; // callback opcional pra atualizar lista
};

export default function NewItemModal({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    if (!title.trim()) {
      setError("Informe um título.");
      return;
    }

    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1️⃣ monta o FormData
      const formData = new FormData();
      formData.append("file", file);

      // 2️⃣ envia para o backend
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // ⚠️ ISSO É CRÍTICO (resolve o travamento)
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erro no upload");
      }

      // 3️⃣ aqui você já tem a URL do Cloudinary
      const uploadedUrl = data.url;

      // 🔹 EXEMPLO: aqui você salvaria no Firestore
      // await saveItem({
      //   title,
      //   url: uploadedUrl,
      //   type: "arquivo",
      // });

      // 4️⃣ finaliza tudo corretamente
      setSaving(false);
      setTitle("");
      setFile(null);

      onClose();       // fecha modal
      onSaved?.();     // atualiza lista (se existir)
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao salvar item.");
      setSaving(false); // ⚠️ ESSENCIAL
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold">Novo item</h2>
        <p className="mb-4 text-sm text-gray-500">
          Salvo com segurança na pasta.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Ex: Documento pessoal"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Arquivo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={saving}
            />
            {file && (
              <p className="mt-1 text-xs text-gray-600">
                Selecionado: {file.name} • {(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-4 py-2 text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
