'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function StravaAuthSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#FC4C02]/10 via-white to-[#FC4C02]/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-4 border-[#FC4C02]/20"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-[#FC4C02]/10 rounded-full mb-4">
              <svg className="w-16 h-16 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
              🎯 Připoj svůj Strava účet
            </h2>
            
            <p className="text-xl text-text-secondary mb-6 max-w-3xl mx-auto">
              Pro účast v soutěži musíš autorizovat přístup ke svým aktivitám. 
              Tvoje aktivity se pak budou <span className="font-bold text-primary">automaticky počítat</span> do týmových statistik!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2 text-green-900">Real-time sledování</h3>
              <p className="text-green-800 text-sm">
                Každá tvoje aktivita se okamžitě započítá do týmových statistik
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2 text-blue-900">Týdenní výsledky</h3>
              <p className="text-blue-800 text-sm">
                Sleduj své výkony a přispívej k úspěchu svého týmu každý týden
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-purple-900">100% Bezpečné</h3>
              <p className="text-purple-800 text-sm">
                Používáme oficiální Strava API - tvoje data jsou v bezpečí
              </p>
            </motion.div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-2">Důležité informace</h3>
                <ul className="text-yellow-800 space-y-1 text-sm">
                  <li>✅ Musíš být členem některého z týmů na Stravě</li>
                  <li>✅ Povolíš přístup k aktivitám (běh, chůze, turistika, workout)</li>
                  <li>✅ Aktivity se počítají od okamžiku autorizace</li>
                </ul>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/authorize"
              className="inline-flex items-center gap-3 bg-[#FC4C02] hover:bg-[#E34402] text-white font-bold text-xl py-5 px-12 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              <span>Připojit Strava účet</span>
            </Link>
            
            <p className="text-sm text-text-secondary mt-4">
              Autorizace trvá pouze 30 sekund
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
