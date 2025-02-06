// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import AppNavbar from '../components/Navbar';
import Footer from '../components/Footer';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Load the Paystack inline script after the page has hydrated */}
      <Script 
        src="https://js.paystack.co/v1/inline.js" 
        strategy="afterInteractive"
      />

      {/* Global Navbar */}
      <AppNavbar />

      {/* Main page content */}
      <Component {...pageProps} />

      {/* Global Footer */}
      <Footer />
    </>
  );
}

export default MyApp;
