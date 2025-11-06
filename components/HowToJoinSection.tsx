'use client';

import { motion } from 'framer-motion';

export default function HowToJoinSection() {
  const steps = [
    {
      number: '1',
      emoji: '🎯',
      title: 'Vyber si tým',
      description: 'Zvol si svého oblíbeného streamera a připoj se k jeho týmu',
      note: 'Preview všech 5 týmů najdeš níže',
    },
    {
      number: '2',
      emoji: '🏃',
      title: 'Připoj se na Stravě',
      description: 'Klikni na odkaz klubu a požádej o členství',
      link: { text: 'Jak funguje Strava?', url: 'https://www.strava.com/features' },
    },
    {
      number: '3',
      emoji: '⌚',
      title: 'Propoj zařízení',
      description: 'Napoj své hodinky, náramek nebo mobilní aplikaci',
      icons: ['Apple Watch', 'Garmin', 'Fitbit', 'Samsung'],
    },
    {
      number: '4',
      emoji: '👤',
      title: 'Nastav profil',
      description: 'Nastav svůj profil jako VEŘEJNÝ a uveď svůj Discord nick do bio',
      warning: true,
    },
    {
      number: '5',
      emoji: '📈',
      title: 'Začni sbírat kilometry',
      description: 'Zaznamenávej své aktivity a posouvej svůj tým nahoru!',
      activities: ['🏃 Běh', '🚶 Chůze', '🥾 Turistika', '💪 Workout'],
    },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-to-join" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-text-primary">
            Jak se zapojit do výzvy?
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Připoj se ke svému oblíbenému týmu v 5 jednoduchých krocích
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{step.emoji}</span>
                    <h3 className="text-2xl font-bold text-text-primary">{step.title}</h3>
                  </div>

                  <p className="text-lg text-text-secondary mb-4">{step.description}</p>

                  {step.note && (
                    <p className="text-sm text-text-secondary italic">
                      💡 {step.note}
                    </p>
                  )}

                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-primary hover:text-accent font-medium transition-colors"
                    >
                      {step.link.text} →
                    </a>
                  )}

                  {step.icons && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {step.icons.map((icon) => (
                        <span
                          key={icon}
                          className="px-3 py-1 bg-background-secondary rounded-full text-sm font-medium text-text-secondary"
                        >
                          {icon}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.warning && (
                    <div className="mt-4 p-4 bg-accent/10 border-l-4 border-accent rounded">
                      <p className="text-accent font-bold flex items-center gap-2">
                        ⚠️ Důležité: Bez veřejného profilu se nezapočítáváš do týmu!
                      </p>
                    </div>
                  )}

                  {step.activities && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {step.activities.map((activity) => (
                        <span
                          key={activity}
                          className="px-4 py-2 bg-success/10 border border-success/30 rounded-lg text-success font-medium"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -mb-8" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => scrollToSection('leaderboard')}
            className="bg-primary text-white text-lg font-bold px-10 py-4 rounded-full hover:bg-accent transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Vybrat tým
          </button>
        </motion.div>
      </div>
    </section>
  );
}
