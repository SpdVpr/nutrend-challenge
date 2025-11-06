import HeroSection from '@/components/HeroSection';
import LiveStreamsSection from '@/components/LiveStreamsSection';
import AboutSection from '@/components/AboutSection';
import HowToJoinSection from '@/components/HowToJoinSection';
import LeaderboardSection from '@/components/LeaderboardSection';
import WeeklyOverviewSection from '@/components/WeeklyOverviewSection';
import PrizesSection from '@/components/PrizesSection';
import PartnersSection from '@/components/PartnersSection';
import RulesSection from '@/components/RulesSection';
import DiscordSection from '@/components/DiscordSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <HowToJoinSection />
      <LeaderboardSection />
      <WeeklyOverviewSection />
      <LiveStreamsSection />
      <PrizesSection />
      <PartnersSection />
      <RulesSection />
      <DiscordSection />
      <Footer />
    </main>
  );
}
