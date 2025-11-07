'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { config } from '@/lib/config';

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [athleteName, setAthleteName] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const athleteParam = searchParams.get('athlete');
    const teamParam = searchParams.get('team');
    const athleteIdParam = searchParams.get('athleteId');

    if (successParam === 'true') {
      setSuccess(true);
      setAthleteName(athleteParam);
      setTeamName(teamParam);
      
      if (athleteIdParam) {
        localStorage.setItem('stravaAthleteId', athleteIdParam);
      }
    }

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  const handleAuthorize = () => {
    const clientId = config.strava.clientId;
    const redirectUri = `${window.location.origin}/api/strava/auth`;
    const scope = 'activity:read_all,activity:read';
    
    if (!clientId) {
      setError('Strava CLIENT_ID není nakonfigurováno. Kontaktujte administrátora.');
      return;
    }
    
    const authorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
    
    window.location.href = authorizeUrl;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'access_denied':
        return 'Autorizace byla zamítnuta. Pro účast v soutěži musíte povolit přístup k aktivitám.';
      case 'token_exchange_failed':
        return 'Nepodařilo se dokončit autorizaci. Zkuste to prosím znovu.';
      case 'server_error':
        return 'Došlo k chybě serveru. Zkuste to prosím později.';
      default:
        return 'Neznámá chyba. Zkuste to prosím znovu.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-secondary via-white to-background-secondary">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-text-primary">
            Připojit Strava účet
          </h1>
          <p className="text-lg text-text-secondary">
            Pro účast v Nutrend Challenge musíte autorizovat přístup ke svým Strava aktivitám
          </p>
        </motion.div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border-2 border-green-500 rounded-xl p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-800">Úspěšně připojeno!</h2>
                {athleteName && (
                  <p className="text-green-700 mt-1">Athlete: {athleteName}</p>
                )}
                {teamName && (
                  <p className="text-green-700">Tým: {teamName}</p>
                )}
              </div>
            </div>
            <p className="text-green-700">
              Váš Strava účet byl úspěšně propojen. Vaše aktivity se nyní budou automaticky počítat do týdenních statistik vašeho týmu.
            </p>
            <a
              href="/"
              className="inline-block mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Zpět na hlavní stránku
            </a>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-500 rounded-xl p-8 mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800">Chyba autorizace</h2>
            </div>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.history.replaceState({}, '', '/authorize');
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Zkusit znovu
            </button>
          </motion.div>
        )}

        {!success && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-8 md:p-12"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-text-primary">Jak to funguje?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">Klikněte na tlačítko</h3>
                    <p className="text-text-secondary">Budete přesměrováni na Strava pro autorizaci</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">Povolte přístup</h3>
                    <p className="text-text-secondary">Potřebujeme přístup k vašim aktivitám pro sledování statistik</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">Automatické sledování</h3>
                    <p className="text-text-secondary">Vaše aktivity se budou automaticky počítat do týmových statistik</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">ℹ️ Co potřebujeme?</h3>
              <ul className="text-blue-800 space-y-2">
                <li>✅ Přístup k vašim aktivitám (běh, chůze, turistika, workout)</li>
                <li>✅ Informace o klubech, ve kterých jste členy</li>
                <li>✅ Datum a čas každé aktivity</li>
              </ul>
            </div>

            <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
              <h3 className="font-bold text-yellow-900 mb-2">⚠️ Důležité</h3>
              <ul className="text-yellow-800 space-y-2">
                <li>• Musíte být členem některého z soutěžních týmů na Stravě</li>
                <li>• Pouze aktivity typu Run, Walk, Hike a Workout se počítají</li>
                <li>• Data se sbírají pouze od data autorizace (ne zpětně)</li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleAuthorize}
                className="flex items-center gap-3 bg-[#FC4C02] hover:bg-[#E34402] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                <span>Připojit Strava účet</span>
              </button>
              
              <a
                href="/"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Zpět na hlavní stránku
              </a>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-text-secondary">
            Máte problémy s autorizací?{' '}
            <a href="/#" className="text-primary hover:underline">
              Kontaktujte nás
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthorizeContent />
    </Suspense>
  );
}
