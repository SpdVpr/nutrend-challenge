export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">GAMECHANGER Challenge</h3>
            <p className="text-white/70 leading-relaxed">
              Rozhýbej sebe, své okolí i Twitch! Připoj se k výzvě a vyhraj skvělé ceny.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Rychlé odkazy</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-white/70 hover:text-white transition-colors">
                  O výzvě
                </a>
              </li>
              <li>
                <a href="#how-to-join" className="text-white/70 hover:text-white transition-colors">
                  Jak se zapojit
                </a>
              </li>
              <li>
                <a href="#leaderboard" className="text-white/70 hover:text-white transition-colors">
                  Žebříček týmů
                </a>
              </li>
              <li>
                <a href="#prizes" className="text-white/70 hover:text-white transition-colors">
                  Ceny
                </a>
              </li>
              <li>
                <a href="#rules" className="text-white/70 hover:text-white transition-colors">
                  Pravidla
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Partneři</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.nutrend.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Nutrend.cz
                </a>
              </li>
              <li>
                <a
                  href="https://www.strava.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Strava
                </a>
              </li>
              <li>
                <a
                  href="https://www.twitch.tv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Twitch
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} GAMECHANGER Challenge. Všechna práva vyhrazena.
          </p>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Ochrana osobních údajů
            </a>
            <a
              href="/terms"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Obchodní podmínky
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
