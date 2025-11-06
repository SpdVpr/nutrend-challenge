'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DiscordSection() {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [showWidget, setShowWidget] = useState(true);
  const [widgetError, setWidgetError] = useState(false);

  const discordInvite = 'https://discord.com/invite/9vEy8asfA9';
  // Discord Server ID for widget
  const serverId = '1334585025810927746';

  console.log('🎮 Discord Widget URL:', `https://discord.com/widget?id=${serverId}&theme=dark`);

  const benefits = [
    { icon: '💬', title: 'Živá diskuze', desc: 'Chať s ostatními účastníky výzvy' },
    { icon: '📢', title: 'Aktuální info', desc: 'Novinky a oznámení od Nutrendu' },
    { icon: '🎮', title: 'Stream notifikace', desc: 'Upozornění když streameři jdou live' },
    { icon: '🏆', title: 'Soutěže', desc: 'Exkluzivní Discord soutěže o ceny' },
  ];

  const fakeChatMessages = [
    { avatar: '🔥', user: 'spajKK', message: 'Dnes 10km běh! Kdo jde se mnou? 💪', team: 'A' },
    { avatar: '⚡', user: 'Andullie', message: 'Team B rules! 🚀', team: 'B' },
    { avatar: '💎', user: 'Kamilius', message: 'Díky za podporu všem! ❤️', team: 'E' },
  ];

  useEffect(() => {
    console.log('🎮 Discord widget state - widgetLoaded:', widgetLoaded, 'showWidget:', showWidget, 'widgetError:', widgetError);

    // Timeout pro detekci, zda se widget načetl - prodlouženo na 10 sekund
    const timer = setTimeout(() => {
      if (!widgetLoaded && !widgetError) {
        console.log('⚠️ Discord widget not loaded after 10 seconds, showing fallback');
        setShowWidget(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [widgetLoaded, showWidget, widgetError]);

  return (
    <section id="discord" className="py-20 bg-gradient-to-b from-[#5865F2]/10 via-[#5865F2]/5 to-transparent relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="text-7xl">
              <svg width="80" height="80" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                <g clipPath="url(#clip0)">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#5865F2"/>
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="71" height="55" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">
            Připoj se na Discord
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Staň se součástí největší fitness komunity na českém Twitchi!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Widget or Interactive Preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {showWidget ? (
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-[#5865F2]/20 relative min-h-[500px]">
                <iframe
                  src={`https://discord.com/widget?id=${serverId}&theme=dark`}
                  width="350"
                  height="500"
                  allowTransparency={true}
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  onLoad={() => {
                    console.log('✅ Discord widget iframe loaded successfully');
                    setWidgetLoaded(true);
                  }}
                  onError={(e) => {
                    console.error('❌ Discord widget iframe error:', e);
                    setWidgetError(true);
                    setShowWidget(false);
                  }}
                  className="w-full border-0"
                  title="Discord Widget"
                />
                {!widgetLoaded && !widgetError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865F2] mb-4"></div>
                    <p className="text-white text-sm">Načítání Discord widgetu...</p>
                  </div>
                )}
              </div>
            ) : (
              // Fallback - Interactive Chat Preview
              <div className="bg-[#36393f] rounded-xl shadow-2xl overflow-hidden border-4 border-[#5865F2]/20 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                  <div className="w-12 h-12 bg-[#5865F2] rounded-full flex items-center justify-center text-2xl">
                    🎮
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Nutrend Discord</h3>
                    <p className="text-gray-400 text-sm">GAMECHANGER Challenge</p>
                  </div>
                </div>

                {/* Fake Chat Messages */}
                <div className="space-y-4 mb-6">
                  {fakeChatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className="flex gap-3 hover:bg-[#32353b] p-2 rounded transition-colors"
                    >
                      <div className="text-2xl flex-shrink-0">{msg.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{msg.user}</span>
                          <span className="text-xs text-gray-400">Team {msg.team}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Typing Indicator */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 text-gray-400 text-sm"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>Někdo píše...</span>
                </motion.div>

                {/* Active Members Preview */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-3">Členové online</p>
                  <div className="flex -space-x-2">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5865F2] to-[#7289da] border-2 border-[#36393f] flex items-center justify-center text-xs"
                      >
                        👤
                      </motion.div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#36393f] flex items-center justify-center text-xs text-gray-400">
                      +99
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right side - Benefits & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#5865F2]/30"
                >
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h4 className="text-lg font-bold text-text-primary mb-2">{benefit.title}</h4>
                  <p className="text-text-secondary text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href={discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="block w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xl py-6 px-8 rounded-xl shadow-2xl hover:shadow-[#5865F2]/50 transition-all text-center relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative flex items-center justify-center gap-3">
                <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                </svg>
                Připojit se na Discord
              </span>
            </motion.a>

            {/* Extra Info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#5865F2]/10 to-transparent rounded-xl p-6 border-l-4 border-[#5865F2]"
            >
              <p className="text-text-secondary text-sm leading-relaxed">
                💡 <strong>Tip:</strong> Po připojení nezapomeň vybrat si roli svého oblíbeného týmu a aktivovat notifikace pro důležité zprávy!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}