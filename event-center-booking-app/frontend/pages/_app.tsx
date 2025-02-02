// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import AppNavbar from '../components/Navbar';
import Footer from '../components/Footer';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Use next/script to load Paystack inline script */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      <AppNavbar />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
