import { MatchTicker } from "@/components/match-ticker";
import { HeroSection } from "@/components/hero-section";
import { NewsSection } from "@/components/news-section";

export default function Home() {
  return (
    <>
      <MatchTicker />
      <HeroSection />
      <NewsSection />
    </>
  );
}

