import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [visitId, setVisitId] = useState("");

  const makeVisitId = useCallback(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(
      d.getHours()
    )}${pad(d.getMinutes())}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VIS${stamp}-${rand}`;
  }, []);

  const goIntake = useCallback(() => {
    const id = (visitId && visitId.trim()) || makeVisitId();
    router.push(`/intake?visitId=${encodeURIComponent(id)}`);
  }, [visitId, router, makeVisitId]);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-white text-black flex items-center justify-center p-6`}
    >
      <main className="w-full max-w-md text-center space-y-6">
        {/* Logo arriba centrado */}
        <div className="flex justify-center">
          <Image src="/logo.svg" alt="Podium" width={160} height={48} priority />
        </div>

        {/* Botones grandes */}
        <div className="space-y-3">
          <button
            onClick={goIntake}
            className="w-full py-4 rounded-2xl bg-black text-white text-lg font-semibold shadow-md active:scale-[0.98]"
          >
            NUEVA ANAMNESIS
          </button>

          <Link
            href="/staff/login"
            className="block w-full py-4 rounded-2xl bg-white text-black text-lg font-semibold border shadow-md text-center"
          >
            ACCESO STAFF
          </Link>

          <Link
            href="/whatsapp"
            className="block w-full py-4 rounded-2xl bg-emerald-600 text-white text-lg font-semibold shadow-md text-center active:scale-[0.98]"
          >
            ENVIAR WHATSAPP
          </Link>
        </div>

        {/* Campo opcional para usar tu propio ID al crear la anamnesis desde aquí */}
        <div className="mt-6 text-sm text-gray-700">
          <label className="block mb-1">Código de visita (opcional)</label>
          <input
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            placeholder="Ej. VIS20250812-ABCD"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50 bg-white"
          />
          <p className="mt-2 text-xs text-gray-600">
            Si lo dejas vacío, se generará un ID automáticamente.
          </p>
        </div>

        {/* Enlace pequeño para el admin */}
        <p className="text-center text-xs mt-6">
          <Link href="/admin/login" className="underline opacity-70 hover:opacity-100">
            Login admin
          </Link>
        </p>
      </main>
    </div>
  );
}
