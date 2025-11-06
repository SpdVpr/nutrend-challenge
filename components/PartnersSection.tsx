'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PartnersSection() {
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-text-primary">
            Partneři výzvy
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-16 max-w-[1280px] mx-auto">
            {/* Strava - Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 flex-1"
            >
              <div className="w-full max-w-[280px] h-32 flex items-center justify-center mx-auto">
                <Image
                  src="/obrazky/strava.png"
                  alt="Strava"
                  width={280}
                  height={140}
                  className="object-contain w-full h-auto"
                />
              </div>
            </motion.div>

            {/* Nutrend - Center (Bigger) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="hover:scale-105 transition-all duration-300 flex-1"
            >
              <div className="w-full max-w-[400px] h-40 flex items-center justify-center mx-auto">
                <Image
                  src="/obrazky/nutrend.png"
                  alt="Nutrend"
                  width={400}
                  height={200}
                  className="object-contain w-full h-auto"
                />
              </div>
            </motion.div>

            {/* Lancraft - Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 flex-1"
            >
              <div className="w-full max-w-[280px] h-32 flex items-center justify-center mx-auto">
                <Image
                  src="/obrazky/lancraft.png"
                  alt="Lancraft"
                  width={280}
                  height={140}
                  className="object-contain w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}