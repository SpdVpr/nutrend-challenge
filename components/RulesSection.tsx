'use client';

import { motion } from 'framer-motion';

export default function RulesSection() {
  const rules = [
    {
      category: 'Základní informace',
      icon: '📋',
      items: [
        'Výzva trvá 5 týdnů',
        'Týdenní vyhodnocení probíhá každou neděli',
        'Závěrečné vyhodnocení proběhne po skončení 5. týdne',
        'Účastníci se připojují do jednoho z 5 týmů (Strava klubů)',
      ],
    },
    {
      category: 'Povolené aktivity',
      icon: '🏃',
      items: [
        'Běh (Run)',
        'Chůze (Walk)',
        'Turistika (Hike)',
        'Workout',
        'Všechny aktivity musí být zaznamenány přes Stravu',
      ],
    },
    {
      category: 'Hodnocení týmů',
      icon: '📊',
      items: [
        'Počítá se celkový součet hodin všech aktivit týmu',
        'Týdenní vyhodnocení: počet aktivit + množství hodin',
        'Finální pořadí podle celkového součtu hodin za celou výzvu',
        'Každý člen týmu se počítá do celkového výsledku',
      ],
    },
    {
      category: 'Týdenní výhry',
      icon: '🎁',
      items: [
        'Každou neděli se vyhodnocují 3 nejaktivnější členové z KAŽDÉHO týmu',
        'Výherci získávají balíčky produktů Nutrend',
        'Účast ve výhře vyžaduje veřejný profil na Stravě',
        'Discord nick musí být uveden v Strava bio',
      ],
    },
  ];

  return (
    <section id="rules" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Pravidla výzvy
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Přečti si pravidla, abys věděl/a, jak soutěž funguje a jak můžeš vyhrát
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {rules.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center gap-3 mb-4 text-center">
                <span className="text-4xl">{section.icon}</span>
                <h3 className="text-lg font-bold text-text-primary">{section.category}</h3>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="text-success mt-1 flex-shrink-0 text-sm">✓</span>
                    <span className="text-text-secondary leading-relaxed text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
