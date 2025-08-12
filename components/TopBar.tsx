import Link from 'next/link'
import Image from 'next/image'

export default function TopBar() {
  return (
    <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex justify-center py-3">
        <Link href="/" aria-label="Ir a la home">
          <Image src="/logo.svg" alt="Podium" width={140} height={36} priority />
        </Link>
      </div>
    </header>
  )
}
