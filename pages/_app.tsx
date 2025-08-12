// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import TopBar from '../components/TopBar';

export default function MyApp({ Component, pageProps }: AppProps) {
  // Forzamos fondo claro y texto negro para evitar problemas con modo oscuro del móvil
  return (
    <div className="min-h-screen bg-white text-black">
      <TopBar />
      <main className="max-w-5xl mx-auto px-4">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
