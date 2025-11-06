'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklyStats } from '@/types';
import { TEAMS } from '@/lib/constants';

interface WeekData {
  week: number;
  weekId: string;
  teams: WeeklyStats[];
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  lastUpdated: string | null;
}

export default function WeeklyOverviewSection() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [allWeeksData, setAllWeeksData] = useState<WeekData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAllWeeksData();
  }, []);

  const fetchAllWeeksData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/weekly`);
      if (response.ok) {
        const data = await response.json();
        setAllWeeksData(data.weeks || []);
        // Set the LAST (most recent) week as active
        if (data.weeks && data.weeks.length > 0) {
          const lastWeek = data.weeks[data.weeks.length - 1];
          setActiveWeek(lastWeek.week);
          setWeeklyData(lastWeek.teams || []);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeekChange = (week: number) => {
    setActiveWeek(week);
    const weekData = allWeeksData.find((w) => w.week === week);
    if (weekData) {
      setWeeklyData(weekData.teams || []);
    }
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getTeamName = (teamId: string) => {
    return TEAMS.find((t) => t.id === teamId)?.name || teamId;
  };

  return (
    <section id="weekly" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Týdenní výsledky
          </h2>
          <p className="text-lg text-text-secondary mb-2">
            📅 Výsledky jednotlivých týdnů (pondělí - neděle)
          </p>
          <p className="text-sm text-text-secondary">
            Data se resetují každý týden
          </p>
        </motion.div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex justify-center gap-2 min-w-max mx-auto px-4">
            {allWeeksData.map((weekData) => (
              <button
                key={weekData.week}
                onClick={() => handleWeekChange(weekData.week)}
                className={`px-4 py-3 rounded-lg font-bold transition-all duration-300 ${
                  activeWeek === weekData.week
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-text-secondary hover:bg-background-secondary'
                }`}
              >
                <div className="text-sm">{weekData.weekLabel}</div>
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-4">Načítání dat...</p>
          </div>
        )}

        {!isLoading && mounted && weeklyData.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWeek}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary to-accent text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Pořadí</th>
                      <th className="px-6 py-4 text-left font-bold">Tým</th>
                      <th className="px-6 py-4 text-center font-bold">Aktivit</th>
                      <th className="px-6 py-4 text-center font-bold">Hodin</th>
                      <th className="px-6 py-4 text-center font-bold">Body týdne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.map((data, index) => (
                    <motion.tr
                      key={data.teamId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`border-b border-border hover:bg-background-secondary transition-colors ${
                        index < 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-2xl">{getMedalEmoji(index)}</td>
                      <td className="px-6 py-4 font-bold text-text-primary">{getTeamName(data.teamId)}</td>
                      <td className="px-6 py-4 text-center font-semibold text-text-secondary">{data.activities}</td>
                      <td className="px-6 py-4 text-center font-semibold text-primary">{data.hours}</td>
                      <td className="px-6 py-4 text-center font-bold text-accent">{data.points}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {weeklyData.map((data, index) => (
                <motion.div
                  key={data.teamId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white rounded-xl p-6 shadow-md ${
                    index < 3 ? 'border-l-4 border-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getMedalEmoji(index)}</span>
                    <h3 className="text-xl font-bold text-text-primary">{getTeamName(data.teamId)}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Aktivit</p>
                      <p className="text-lg font-bold text-text-primary">{data.activities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Hodin</p>
                      <p className="text-lg font-bold text-primary">{data.hours}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Body</p>
                      <p className="text-lg font-bold text-accent">{data.points}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        )}
      </div>
    </section>
  );
}
