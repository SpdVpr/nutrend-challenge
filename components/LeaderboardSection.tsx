'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Team } from '@/types';
import { TEAMS } from '@/lib/constants';

export default function LeaderboardSection() {
  const [teams, setTeams] = useState<Team[]>(TEAMS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<string>('default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
    const interval = setInterval(fetchTeamData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received data:', data);

        setTeams(data.teams || TEAMS);
        setDataSource(data.source || 'unknown');

        if (data.lastUpdated) {
          setLastUpdate(new Date(data.lastUpdated));
        } else {
          setLastUpdate(new Date());
        }

        if (data.message) {
          setErrorMessage(data.message);
        }
      } else {
        setErrorMessage('Nepodařilo se načíst data ze serveru');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setErrorMessage('Chyba při načítání dat');
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return 'border-l-4 border-yellow-500';
    if (index === 1) return 'border-l-4 border-gray-400';
    if (index === 2) return 'border-l-4 border-orange-600';
    return '';
  };

  const getProgressPercentage = (points: number) => {
    const maxPoints = Math.max(...teams.map((t) => t.totalPoints || 0), 1);
    return ((points || 0) / maxPoints) * 100;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'právě teď';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `před ${minutes} minutami`;
    const hours = Math.floor(minutes / 60);
    return `před ${hours} hodinami`;
  };

  const formatActivityDateTime = (iso?: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}. ${hours}:${minutes}`;
  };


  return (
    <section id="leaderboard" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Aktuální pořadí týmů
          </h2>
          <p className="text-lg text-text-secondary mb-3">
            📊 Celkové statistiky od začátku výzvy (3. listopadu 2025)
          </p>
          <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
            <div className="flex items-center gap-3">
              <p className="text-sm">Poslední aktualizace: {formatTimeAgo(lastUpdate)}</p>
              <button
                onClick={fetchTeamData}
                disabled={isLoading}
                className="p-2 hover:bg-background-secondary rounded-full transition-colors disabled:opacity-50"
                title="Aktualizovat"
              >
                <svg
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            {errorMessage && (
              <div className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                ⚠️ {errorMessage}
              </div>
            )}
            {dataSource === 'default' && (
              <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                ℹ️ Zobrazují se výchozí data. Synchronizace ještě neproběhla.
              </div>
            )}
            {dataSource === 'overall' && (
              <div className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                ℹ️ Zobrazují se celkové statistiky od začátku výzvy.
              </div>
            )}
            {dataSource === 'activities' && (
              <div className="text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
                ℹ️ Zobrazují se body spočítané z jednotlivých aktivit (čas + kilometry + kalorie).
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6 max-w-6xl mx-auto">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full ${getMedalColor(index)}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold">{getMedalEmoji(index)}</span>
                <div className="flex-1">
                  {team.avatarUrl ? (
                    <img
                      src={team.avatarUrl}
                      alt={team.name}
                      className="w-16 h-16 rounded-full object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {team.streamer.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-text-primary mb-2">{team.name}</h3>
              <p className="text-sm text-text-secondary mb-4">
                👥 {team.members || 0} členů v týmu
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-text-primary">
                  <span>⭐</span>
                  <span className="text-xl font-bold">{(team.totalPoints || 0).toFixed(1)}</span>
                  <span>bodů (TOP 10)</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span>⏱️</span>
                  <span className="font-semibold">{(team.totalHours || 0).toFixed(1)}</span>
                  <span>hodin</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span>🎯</span>
                  <span className="font-semibold">{team.totalActivities || 0}</span>
                  <span>aktivit</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span>🔥</span>
                  <span className="font-semibold">
                    {(team.totalCalories || 0).toLocaleString('cs-CZ')}
                  </span>
                  <span>kcal</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(team.totalPoints || 0)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>


              {team.topMembers && team.topMembers.length > 0 && (
                <div className="mt-4 border-t border-background-secondary pt-3">
                  <p className="text-sm font-semibold text-text-secondary mb-2">
                    Top 5 nejaktivnějších členů (podle bodů):
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-text-secondary">
                      <thead>
                        <tr className="border-b border-background-secondary">
                          <th className="py-1 pr-2 font-semibold">#</th>
                          <th className="py-1 pr-2 font-semibold">Jméno</th>
                          <th className="py-1 pr-2 font-semibold text-right">Aktivity</th>
                          <th className="py-1 pr-2 font-semibold text-right">Hodiny</th>
                          <th className="py-1 pr-2 font-semibold text-right">Km</th>
                          <th className="py-1 pr-2 font-semibold text-right">Kalorie</th>
                          <th className="py-1 pr-2 font-semibold text-right">Body</th>
                          <th className="py-1 pl-2 font-semibold">Poslední aktivita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.topMembers.slice(0, 5).map((member, memberIndex) => (
                          <tr
                            key={member.athleteId ?? memberIndex}
                            className="border-b border-background-secondary/60 last:border-0"
                          >
                            <td className="py-1 pr-2 text-text-muted">{memberIndex + 1}.</td>
                            <td className="py-1 pr-2">{member.name}</td>
                            <td className="py-1 pr-2 text-right">{member.activities}</td>
                            <td className="py-1 pr-2 text-right">{member.hours.toFixed(1)}</td>
                            <td className="py-1 pr-2 text-right">
                              {member.distance !== undefined ? member.distance.toFixed(1) : '-'}
                            </td>
                            <td className="py-1 pr-2 text-right">
                              {member.calories !== undefined ? member.calories : '-'}
                            </td>
                            <td className="py-1 pr-2 text-right font-semibold text-primary">
                              {member.points !== undefined ? member.points.toFixed(1) : '-'}
                            </td>
                            <td className="py-1 pl-2 text-text-muted">
                              {member.lastActivityDate ? (
                                <>
                                  {formatActivityDateTime(member.lastActivityDate)}
                                  {member.lastActivityType && ` · ${member.lastActivityType}`}
                                </>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <a
                href={team.stravaClubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-primary text-white text-center font-bold py-3 rounded-lg hover:bg-accent transition-colors"
              >
                Připojit se
              </a>
            </motion.div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Načítání dat...</p>
          </div>
        )}
      </div>
    </section>
  );
}
