import 'semantic-ui-css/semantic.min.css'

import '../styles/globals.css'
import Layout from '../components/layout'

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}