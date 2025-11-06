'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  const infoBoxes = [
    { icon: '📅', title: 'Doba trvání', value: '5 týdnů' },
    { icon: '🏆', title: 'Hodnota cen', value: '110 000 Kč+' },
    { icon: '👥', title: 'Počet týmů', value: '5 týmů streamerů' },
    { icon: '🎯', title: 'Zaměření', value: 'Běh, chůze, turistika, workout' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#e30b17' }}>
            Co je GAMECHANGER Challenge?
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Unikátní fitness výzva, kde se 5 týmů vedených známými streamery utkává v pohybových aktivitách. 
            Rozhýbej se, podpor svůj oblíbený tým a vyhraj skvělé ceny od Nutrendu!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoBoxes.map((box, index) => (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-background-secondary rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-4">{box.icon}</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{box.title}</h3>
              <p className="text-text-secondary font-medium">{box.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
