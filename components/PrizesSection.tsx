'use client';

import { motion } from 'framer-motion';

export default function PrizesSection() {
  return (
    <section id="prizes" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Co můžeš vyhrát?
          </h2>
          <p className="text-xl text-text-secondary">
            Celková hodnota všech cen přesahuje <span className="text-primary font-bold">110 000 Kč!</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border-4 border-primary rounded-2xl p-8 shadow-xl"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-3xl font-bold text-primary mb-2">Týdenní odměny</h3>
              <p className="text-text-secondary">
                Každou neděli vyhodnocujeme <span className="font-bold text-text-primary">3 nejaktivnější členy</span> z KAŽDÉHO týmu
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-text-primary">Balíčky produktů Nutrend</div>
                  <div className="text-sm text-text-secondary">Vybrané produkty pro aktivní sportovce</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-text-primary">Proteinové tyčinky</div>
                  <div className="text-sm text-text-secondary">Energie pro tvé aktivity</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-text-primary">Drinky a shakery</div>
                  <div className="text-sm text-text-secondary">Regenerace po tréninku</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-lg">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-text-primary">Výživové doplňky</div>
                  <div className="text-sm text-text-secondary">Podpora výkonu a zdraví</div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-4">
              <p className="text-accent font-bold flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span>Pro výhru musíš mít VEŘEJNÝ profil na Stravě a Discord nick v bio!</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎖️</div>
                <h3 className="text-3xl font-bold mb-2">Hlavní cena</h3>
                <div className="text-7xl font-extrabold mb-2">5 000 Kč</div>
                <p className="text-xl text-white/90 font-semibold">Pro vítězný tým!</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                <p className="text-lg leading-relaxed">
                  Streamer vítězného týmu zorganizuje <span className="font-bold">velký giveaway</span> pro celou svou komunitu!
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">👑</div>
                  <div className="text-sm text-white/80">Prestiž</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <div className="text-sm text-white/80">Ceny</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-sm text-white/80">Oslava</div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-white/70 italic">
                  Tým s nejvyšším celkovým počtem hodin vyhrává!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
