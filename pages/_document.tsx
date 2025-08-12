// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Fuerza UI en modo claro (inputs, select, etc) */}
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-white text-neutral-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
