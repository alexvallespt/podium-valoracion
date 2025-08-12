// pages/index.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">
      {/* Logo arriba */}
      <Image src="/logo.svg" alt="Podium" width={140} height={140} priority />

      {/* Botones grandes */}
      <div className="w-full max-w-sm grid gap-4">
        <Link
          href="/intake?visitId=demo"
          className="block w-full py-4 rounded-2xl bg-black text-white text-lg font-semibold text-center shadow-md active:scale-[0.98]"
        >
          NUEVA ANAMNESIS
        </Link>

        <Link
          href="/staff/login"
          className="block w-full py-4 rounded-2xl bg-white text-black text-lg font-semibold text-center border shadow-md active:scale-[0.98]"
        >
          ACCESO STAFF
        </Link>

        <Link
          href="/whatsapp"
          className="block w-full py-4 rounded-2xl bg-emerald-600 text-white text-lg font-semibold text-center shadow-md active:scale-[0.98]"
        >
          ENVIAR WHATSAPP
        </Link>
      </div>
    </main>
  )
}
