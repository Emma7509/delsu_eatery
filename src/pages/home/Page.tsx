import { PageLayout } from "@/components/PageLayout";
import { Hero } from "./page-components/Hero";
import { DailySpecials } from "./page-components/DailySpecials";
import { AboutUs } from "./page-components/AboutUs";
import { OurServices } from "./page-components/OurServices";
import { WhyChooseUs } from "./page-components/WhyChooseUs";
import { Categories } from "./page-components/Categories";
import { Featured } from "./page-components/Featured";
import { HowItWorks } from "./page-components/HowItWorks";
import { Testimonials } from "./page-components/Testimonials";
import { FAQ } from "./page-components/FAQ";
import { CTABanner } from "./page-components/CTABanner";
import { useEffect, useLayoutEffect, useState } from "react";
import { WelcomeSplash } from "@/components/WelcomeSplash";

const SPLASH_KEY = "delsu-welcome-seen";
const SPLASH_DURATION_MS = 5000; // 3s fade-in + 1s hold before revealing the homepage

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  useLayoutEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setShowSplash(false);
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) return <WelcomeSplash />;
  return (
    <PageLayout transparentNav>
      <Hero />
      <DailySpecials />
      <AboutUs />
      <OurServices />
      <WhyChooseUs />
      <Categories />
      <Featured />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </PageLayout>
  );
}
