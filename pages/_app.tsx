import type { AppProps } from 'next/app'
import '../styles/globals.css'
import TopBar from '../components/TopBar'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <TopBar />
      <Component {...pageProps} />
    </>
  )
}
