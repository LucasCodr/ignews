import { AppProps } from 'next/app'
import { Header } from '../components/Header'
import '../styles/global.scss'
import { SessionProvider } from 'next-auth/react'

// Esse componente está presente em todas as paginas
// Sempre é carregado quando o usuario troca de pagina
// Nunca devemos utilizar o _app para realizar ações que devem ser executadas apenas 1 vez (ex: configuracao de fontes externas)

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
