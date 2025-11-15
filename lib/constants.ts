import { Team } from '@/types';

export const TEAMS: Team[] = [
  {
    id: 'nutrend-test',
    name: 'Nutrend Test klub',
    streamer: 'Nutrend Test',
    twitchUsername: '',
    twitchUrl: '',
    stravaClubId: 1831079,
    stravaClubUrl: 'https://www.strava.com/clubs/1831079',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
  },
];

// Challenge start date: Monday, November 3, 2025 at 00:00 UTC
export const CHALLENGE_START_DATE = new Date('2025-11-03T00:00:00Z');

// No end date - challenge is ongoing
export const ALLOWED_ACTIVITIES = ['Run', 'Walk', 'Hike', 'Workout'];
