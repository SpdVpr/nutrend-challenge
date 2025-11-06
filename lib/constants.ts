import { Team } from '@/types';

export const TEAMS: Team[] = [
  {
    id: 'spajkk',
    name: 'Team spajKK',
    streamer: 'spajKK',
    twitchUsername: 'spajkk',
    twitchUrl: 'https://www.twitch.tv/spajkk',
    stravaClubId: 1469610,
    stravaClubUrl: 'https://www.strava.com/clubs/1469610',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
    avatarUrl: '/obrazky/spajKK.jpg',
  },
  {
    id: 'andullie',
    name: 'Team Andullie',
    streamer: 'Andullie',
    twitchUsername: 'andullie',
    twitchUrl: 'https://www.twitch.tv/andullie',
    stravaClubId: 1469617,
    stravaClubUrl: 'https://www.strava.com/clubs/1469617',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
    avatarUrl: '/obrazky/Andullie.jpg',
  },
  {
    id: 'dinododo',
    name: 'Team DinoDodo',
    streamer: 'DinoDodo',
    twitchUsername: 'dino_dodo_',
    twitchUrl: 'https://www.twitch.tv/dino_dodo_',
    stravaClubId: 1469620,
    stravaClubUrl: 'https://www.strava.com/clubs/1469620',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
    avatarUrl: '/obrazky/DinoDodo.jpg',
  },
  {
    id: 'charmiie',
    name: 'Team Charmiie',
    streamer: 'Charmiie',
    twitchUsername: 'charmiie',
    twitchUrl: 'https://www.twitch.tv/charmiie',
    stravaClubId: 1469625,
    stravaClubUrl: 'https://www.strava.com/clubs/1469625',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
    avatarUrl: '/obrazky/Charmiie.jpg',
  },
  {
    id: 'kamilius',
    name: 'Team Kamilius',
    streamer: 'Kamilius',
    twitchUsername: 'kamilius1',
    twitchUrl: 'https://www.twitch.tv/kamilius1',
    stravaClubId: 1469623,
    stravaClubUrl: 'https://www.strava.com/clubs/1469623',
    members: 0,
    totalHours: 0,
    totalActivities: 0,
    avatarUrl: '/obrazky/Kamilius.jpg',
  },
];

// Challenge start date: Monday, November 3, 2025 at 00:00 UTC
export const CHALLENGE_START_DATE = new Date('2025-11-03T00:00:00Z');

// No end date - challenge is ongoing
export const ALLOWED_ACTIVITIES = ['Run', 'Walk', 'Hike', 'Workout'];
