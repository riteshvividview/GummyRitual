import { useEffect, useState } from "react";
import { SmoothScrollProvider } from "./components/layout/SmoothScrollProvider";
import { ExperienceProvider, useExperience } from "./state/ExperienceContext";
import { Header } from "./components/Header/Header";
import { Loader } from "./components/Loader/Loader";
import { useAppPreloader } from "./hooks/useAppPreloader";
import { hasLoaderRunThisSession, markLoaderRunThisSession } from "./lib/preloaderSession";
import { markSiteRevealed } from "./lib/siteReveal";
import { KidsHero } from "./components/Hero/KidsHero";
import { AdultsHome } from "./components/adults/AdultsHome";
import { OurGummies } from "./components/OurGummies/OurGummies";
import { WhyGummyRituals } from "./components/WhyGummyRituals/WhyGummyRituals";
import { FeaturedCollection } from "./components/FeaturedCollection/FeaturedCollection";
import { Ingredients } from "./components/Ingredients/Ingredients";
import { DailyRoutine } from "./components/DailyRoutine/DailyRoutine";
import { TasteTexture } from "./components/TasteTexture/TasteTexture";
import { Footer } from "./components/Footer/Footer";
import { AdultFooter } from "./components/adults/Footer/AdultFooter";
import { ProductsPage } from "./components/shop/ProductsPage";
import { ProductPage } from "./components/shop/ProductPage";
import { BagToast } from "./components/shop/BagToast";
import { CartPage } from "./components/shop/CartPage";
import { BenefitsPage } from "./components/shop/BenefitsPage";
import { RouterProvider, useRoute } from "./lib/router";
import { CartProvider } from "./state/CartContext";

/** Each experience has its own footer (different copy, links and imagery). */
function SiteFooter() {
  const { mode } = useExperience();
  return mode === "kids" ? <Footer /> : <AdultFooter />;
}

function HomeHero() {
  const { mode } = useExperience();
  return (
    <>
      {mode === "kids" ? <KidsHero /> : <AdultsHome />}
      {mode === "kids" && (
        <>
          <FeaturedCollection />
          <OurGummies />
          <WhyGummyRituals />
          <Ingredients />
          <DailyRoutine />
          <TasteTexture />
        </>
      )}
    </>
  );
}

/** Page for the current route — the homepage is the only one that needs
 * the cinematic preload; shop pages render straight away. */
function Page() {
  const route = useRoute();
  if (route.name === "shop") return <ProductsPage filter={route.filter} />;
  if (route.name === "product") return <ProductPage id={route.id} />;
  if (route.name === "cart") return <CartPage />;
  if (route.name === "benefits") return <BenefitsPage />;
  return <HomeHero />;
}

function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <Shell />
      </CartProvider>
    </RouterProvider>
  );
}

function Shell() {
  const route = useRoute();
  // Read once, before first paint — not in an effect — so a loader that
  // already ran this tab session never flashes on screen before hiding.
  // Shop pages skip it: their assets are light and load on demand.
  const [showLoader] = useState(() => route.name === "home" && !hasLoaderRunThisSession());
  const { progress, isComplete } = useAppPreloader({ skip: !showLoader });
  const [siteRevealed, setSiteRevealed] = useState(() => !showLoader);

  useEffect(() => {
    if (siteRevealed) markSiteRevealed();
  }, [siteRevealed]);

  // Lock page scroll while the loader overlay is up.
  useEffect(() => {
    const locked = showLoader && !siteRevealed;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [showLoader, siteRevealed]);

  return (
    <ExperienceProvider>
      <SmoothScrollProvider enabled={siteRevealed}>
        <Header />
        <main>
          <Page />
        </main>
        <SiteFooter />
        <BagToast />
      </SmoothScrollProvider>
      {showLoader && !siteRevealed && (
        <Loader
          progress={progress}
          isComplete={isComplete}
          onExited={() => {
            markLoaderRunThisSession();
            setSiteRevealed(true);
          }}
        />
      )}
    </ExperienceProvider>
  );
}

export default App;
