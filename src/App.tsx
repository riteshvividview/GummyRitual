import { useEffect, useState } from "react";
import { SmoothScrollProvider } from "./components/layout/SmoothScrollProvider";
import { ExperienceProvider, useExperience } from "./state/ExperienceContext";
import { Header } from "./components/Header/Header";
import { Loader } from "./components/Loader/Loader";
import { useAppPreloader } from "./hooks/useAppPreloader";
import { hasLoaderRunThisSession, markLoaderRunThisSession } from "./lib/preloaderSession";
import { KidsHero } from "./components/Hero/KidsHero";
import { AdultHero } from "./components/Hero/AdultHero";
import { OurGummies } from "./components/OurGummies/OurGummies";
import { WhyGummyRituals } from "./components/WhyGummyRituals/WhyGummyRituals";
import { FeaturedCollection } from "./components/FeaturedCollection/FeaturedCollection";
import { Ingredients } from "./components/Ingredients/Ingredients";
import { DailyRoutine } from "./components/DailyRoutine/DailyRoutine";
import { TasteTexture } from "./components/TasteTexture/TasteTexture";
import { Footer } from "./components/Footer/Footer";

function HomeHero() {
  const { mode } = useExperience();
  return (
    <>
      {mode === "kids" ? <KidsHero /> : <AdultHero />}
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

function App() {
  // Read once, before first paint — not in an effect — so a loader that
  // already ran this tab session never flashes on screen before hiding.
  const [showLoader] = useState(() => !hasLoaderRunThisSession());
  const { progress, isComplete } = useAppPreloader({ skip: !showLoader });
  const [siteRevealed, setSiteRevealed] = useState(() => !showLoader);

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
          <HomeHero />
        </main>
        <Footer />
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
