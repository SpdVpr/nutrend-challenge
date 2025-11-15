import { useState, useEffect } from 'react';

export interface AthleteData {
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile?: string;
    teamId?: string;
    stravaClubId?: number;
  };
  stats: {
    totalActivities: number;
    totalHours: number;
    totalDistance: number;
    totalCalories: number;
    totalPoints: number;
  };
  recentActivities: Array<{
    id: number;
    name: string;
    type: string;
    startDate: string;
    movingTime: number;
    distance: number;
    calories: number;
    points: number;
  }>;
}

export function useAthleteAuth() {
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const athleteId = localStorage.getItem('stravaAthleteId');

    if (!athleteId) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/athlete/${athleteId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch athlete data');
        }
        return res.json();
      })
      .then((data) => {
        setAthleteData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching athlete data:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('stravaAthleteId');
    setAthleteData(null);
  };

  return {
    athleteData,
    isAuthenticated: !!athleteData,
    isLoading,
    error,
    logout,
  };
}
