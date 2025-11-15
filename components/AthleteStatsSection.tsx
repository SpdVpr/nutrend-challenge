'use client';

import { motion } from 'framer-motion';
import { AthleteData } from '@/hooks/useAthleteAuth';
import { TEAMS } from '@/lib/constants';

interface AthleteStatsSectionProps {
  athleteData: AthleteData;
  onLogout: () => void;
}

export default function AthleteStatsSection({ athleteData, onLogout }: AthleteStatsSectionProps) {
  const { athlete, stats, recentActivities } = athleteData;
  
  const team = TEAMS.find(t => t.id === athlete.teamId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-green-500/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              {athlete.profile && (
                <img
                  src={athlete.profile}
                  alt={`${athlete.firstname} ${athlete.lastname}`}
                  className="w-16 h-16 rounded-full border-4 border-green-500"
                />
              )}
              <div>
                <h2 className="text-3xl font-bold text-text-primary">
                  {athlete.firstname} {athlete.lastname}
                </h2>
                {team && (
                  <p className="text-lg text-text-secondary">
                    {team.name}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Odpojit účet
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-blue-900 mb-2">
                {stats.totalActivities}
              </div>
              <div className="text-blue-700 font-medium">Aktivit celkem</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-green-900 mb-2">
                {stats.totalHours.toFixed(1)}h
              </div>
              <div className="text-green-700 font-medium">Celkový čas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-purple-900 mb-2">
                {stats.totalDistance.toFixed(0)} km
              </div>
              <div className="text-purple-700 font-medium">Celková vzdálenost</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-orange-900 mb-2">
                {stats.totalCalories.toFixed(0)} kcal
              </div>
              <div className="text-orange-700 font-medium">Spálené kalorie</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-yellow-900 mb-2">
                {stats.totalPoints.toFixed(1)}
              </div>
              <div className="text-yellow-700 font-medium">Body v soutěži</div>
            </motion.div>
          </div>

          {recentActivities.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                📋 Poslední aktivity
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                            {activity.type}
                          </span>
                          <h4 className="font-bold text-text-primary">{activity.name}</h4>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {formatDate(activity.startDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-text-primary">
                          {formatDistance(activity.distance)} km
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatDuration(activity.movingTime)}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {Math.round(activity.calories)} kcal | {activity.points.toFixed(1)} bodů
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">Jsi připojen!</h3>
                <p className="text-green-800 text-sm">
                  Tvoje aktivity se automaticky počítají do týmových statistik.
                  Každá nová sportovní aktivita ze Stravy (běh, chůze, turistika, kolo, plavání, posilovna, jóga atd.) přidá body tvému týmu podle času, vzdálenosti a spálených kalorií.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
