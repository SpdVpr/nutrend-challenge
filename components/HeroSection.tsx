'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-[#0A0F1E]">
      {/* Obrázek s reálnou velikostí */}
      <div className="relative">
        <Image
          src="/obrazky/gamechanger.jpg"
          alt="GAMECHANGER Challenge"
          width={1920}
          height={1080}
          className="w-auto h-auto max-w-full"
          priority
        />
        
        {/* Gradient overlay pro pozvolný přechod do barvy pozadí */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right, 
                #0A0F1E 0%, 
                transparent 15%, 
                transparent 85%, 
                #0A0F1E 100%
              ),
              linear-gradient(to bottom,
                #0A0F1E 0%,
                transparent 15%,
                transparent 85%,
                #0A0F1E 100%
              )
            `
          }}
        />
      </div>

      {/* Šipka dolů */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <button
          onClick={() => scrollToSection('about')}
          className="animate-bounce text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </motion.div>
    </section>
  );
}
