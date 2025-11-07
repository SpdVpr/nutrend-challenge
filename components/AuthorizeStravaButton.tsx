'use client';

interface AuthorizeStravaButtonProps {
  className?: string;
}

export default function AuthorizeStravaButton({ className = '' }: AuthorizeStravaButtonProps) {
  const handleAuthorize = () => {
    const redirectUri = `${window.location.origin}/api/strava/auth`;
    const scope = 'activity:read_all,activity:read';
    
    window.location.href = `/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  };

  return (
    <button
      onClick={handleAuthorize}
      className={`flex items-center gap-3 bg-[#FC4C02] hover:bg-[#E34402] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
      <span>Připojit Strava účet</span>
    </button>
  );
}
