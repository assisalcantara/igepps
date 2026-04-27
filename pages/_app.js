import '../styles/globals.css';
import CookieBanner from '../components/CookieBanner';
import { SidebarProvider } from '../context/SidebarContext';

function MyApp({ Component, pageProps }) {
  return (
    <SidebarProvider>
      <Component {...pageProps} />
      <CookieBanner />
    </SidebarProvider>
  );
}

export default MyApp;
