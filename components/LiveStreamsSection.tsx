'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwitchStream } from '@/types';
import { formatViewerCount } from '@/lib/twitch';

export default function LiveStreamsSection() {
  const [streams, setStreams] = useState<TwitchStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStream, setHoveredStream] = useState<string | null>(null);

  // Fetch streams
  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/twitch/streams');
      const data = await response.json();
      setStreams(data.streams || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    
    // Refresh každé 2 minuty
    const interval = setInterval(fetchStreams, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-purple-900/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {streams.length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
            )}
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {streams.length > 0 ? '🔴 PRÁVĚ STREAMUJÍ' : '🎮 LIVE STREAMY'}
            </h2>
            {streams.length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
            )}
          </div>
          <p className="text-gray-400 text-lg">
            {streams.length > 0 
              ? 'Sledujte naše streamery naživo a povzbuzujte je!'
              : 'Sledujte naše streamery v akci! Zde se zobrazí živé vysílání.'
            }
          </p>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Streams Grid */}
        <AnimatePresence mode="popLayout">
          {!loading && streams.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {streams.map((stream, index) => (
                <motion.div
                  key={stream.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredStream(stream.id)}
                  onHoverEnd={() => setHoveredStream(null)}
                  className="group relative"
                >
                  <a
                    href={stream.twitchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {/* Stream Card */}
                    <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={stream.thumbnailUrl}
                          alt={stream.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Live Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                          <span className="text-white text-sm font-bold">LIVE</span>
                        </div>

                        {/* Viewer Count */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                          <span className="text-white text-sm font-semibold">
                            👁️ {formatViewerCount(stream.viewerCount)}
                          </span>
                        </div>

                        {/* Hover Overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredStream === stream.id ? 1 : 0 }}
                          className="absolute inset-0 bg-gradient-to-t from-purple-600/80 via-transparent to-transparent flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: hoveredStream === stream.id ? 1 : 0.8 }}
                            className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-lg shadow-lg"
                          >
                            ▶️ Sledovat
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Stream Info */}
                      <div className="p-4">
                        {/* Team Info */}
                        <div className="flex items-center gap-3 mb-3">
                          {stream.teamAvatarUrl && (
                            <img
                              src={stream.teamAvatarUrl}
                              alt={stream.teamName}
                              className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold truncate">
                              {stream.userName}
                            </h3>
                            <p className="text-purple-400 text-sm truncate">
                              {stream.teamName}
                            </p>
                          </div>
                        </div>

                        {/* Stream Title */}
                        <p className="text-gray-300 text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                          {stream.title}
                        </p>

                        {/* Game Name */}
                        {stream.gameName && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="bg-gray-700/50 px-2 py-1 rounded">
                              🎮 {stream.gameName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Shine Effect */}
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: hoveredStream === stream.id ? '100%' : '-100%' }}
                        transition={{ duration: 0.6 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                      />
                    </div>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No streams placeholder */}
        {!loading && streams.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 px-6 bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-700/30"
          >
            <div className="text-6xl mb-6">💤</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Nikdo právě nevysílá
            </h3>
            <p className="text-gray-400 mb-4 text-lg">
              Jakmile některý ze streamerů spustí vysílání, objeví se zde automaticky!
            </p>
            <p className="text-gray-500 text-sm">
              🔄 Kontrola každé 2 minuty
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}