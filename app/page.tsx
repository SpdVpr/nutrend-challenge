'use client';

import HeroSection from '@/components/HeroSection';
import LiveStreamsSection from '@/components/LiveStreamsSection';
import AboutSection from '@/components/AboutSection';
import StravaAuthSection from '@/components/StravaAuthSection';
import AthleteStatsSection from '@/components/AthleteStatsSection';
import HowToJoinSection from '@/components/HowToJoinSection';
import LeaderboardSection from '@/components/LeaderboardSection';
import WeeklyOverviewSection from '@/components/WeeklyOverviewSection';
import PrizesSection from '@/components/PrizesSection';
import PartnersSection from '@/components/PartnersSection';
import RulesSection from '@/components/RulesSection';
import DiscordSection from '@/components/DiscordSection';
import Footer from '@/components/Footer';
import { useAthleteAuth } from '@/hooks/useAthleteAuth';

export default function Home() {
  const { athleteData, isLoading, logout } = useAthleteAuth();

  return (
    <main>
      <HeroSection />
      <AboutSection />
      
      {!isLoading && (
        <>
          {athleteData ? (
            <AthleteStatsSection athleteData={athleteData} onLogout={logout} />
          ) : (
            <StravaAuthSection />
          )}
        </>
      )}
      
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
