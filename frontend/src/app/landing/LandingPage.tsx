import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { HeroSection } from './sections/HeroSection';
import { IntegrationRail } from './sections/IntegrationRail';
import { MediaBand } from './sections/MediaBand';
import { FeatureTriptych } from './sections/FeatureTriptych';
import { AntiGamingModule } from './sections/AntiGamingModule';
import { HowItWorksForest } from './sections/HowItWorksForest';
import { LandingCTA } from './sections/LandingCTA';

export function LandingPage() {
  useDocumentTitle('Contribution, finally visible');

  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <main>
        <HeroSection />
        <IntegrationRail />
        <MediaBand />
        <FeatureTriptych />
        <AntiGamingModule />
        <HowItWorksForest />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
