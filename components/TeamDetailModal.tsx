'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '@/types';

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  if (!team) return null;

  const weeklyProgress = [
    { week: 1, hours: 156 },
    { week: 2, hours: 289 },
    { week: 3, hours: 445 },
    { week: 4, hours: 678 },
    { week: 5, hours: 892 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-primary to-accent text-white p-6 rounded-t-2xl z-10">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-6">
                    {team.avatarUrl ? (
                      <img
                        src={team.avatarUrl}
                        alt={team.name}
                        className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white/30"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold shadow-lg">
                        {team.streamer.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{team.name}</h2>
                      <p className="text-white/90">Tým vedený {team.streamer}</p>
                      <div className="flex gap-4 mt-3">
                        {team.twitchUrl && (
                          <a
                            href={team.twitchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                            title="Twitch"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                            </svg>
                          </a>
                        )}
                        {team.discordUrl && (
                          <a
                            href={team.discordUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white transition-colors"
                            title="Discord"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                          </a>
                        )}
                        <a
                          href={team.stravaClubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/80 hover:text-white transition-colors"
                          title="Strava"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-background-secondary rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">👥</div>
                      <div className="text-3xl font-bold text-text-primary">{team.members}</div>
                      <div className="text-sm text-text-secondary">členů</div>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">⏱️</div>
                      <div className="text-3xl font-bold text-primary">{team.totalHours.toFixed(1)}</div>
                      <div className="text-sm text-text-secondary">hodin</div>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-3xl font-bold text-accent">{team.totalActivities}</div>
                      <div className="text-sm text-text-secondary">aktivit</div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">Vývoj hodin v čase</h3>
                    <div className="bg-background-secondary rounded-xl p-6">
                      <div className="flex items-end justify-between h-48 gap-2">
                        {weeklyProgress.map((week) => {
                          const maxHours = Math.max(...weeklyProgress.map(w => w.hours));
                          const heightPercentage = (week.hours / maxHours) * 100;
                          return (
                            <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                              <div className="text-sm font-bold text-primary">{week.hours}h</div>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercentage}%` }}
                                transition={{ duration: 0.5, delay: week.week * 0.1 }}
                                className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg min-h-[20px]"
                              />
                              <div className="text-xs text-text-secondary">T{week.week}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <a
                    href={team.stravaClubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-primary to-accent text-white text-center font-bold py-4 rounded-xl hover:shadow-lg transition-shadow text-lg"
                  >
                    Připojit se k týmu
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
