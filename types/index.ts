export interface Team {
  id: string;
  name: string;
  streamer: string;
  stravaClubId: number;
  stravaClubUrl: string;
  members: number;
  totalHours: number;
  totalActivities: number;
  totalPoints?: number;
  totalCalories?: number;
  twitchUrl?: string;
  twitchUsername?: string;
  discordUrl?: string;
  avatarUrl?: string;
  topMembers?: TeamMember[];
}

export interface TwitchStream {
  id: string;
  userId: string;
  userLogin: string;
  userName: string;
  gameId: string;
  gameName: string;
  type: string;
  title: string;
  viewerCount: number;
  startedAt: string;
  thumbnailUrl: string;
  teamId: string;
  teamName: string;
  teamAvatarUrl?: string;
  twitchUrl: string;
}

export interface WeeklyStats {
  teamId: string;
  week: number;
  activities: number;
  hours: number;
  points: number;
  topMembers?: TeamMember[];
}

export interface TeamMember {
  name: string;
  hours: number;
  activities: number;
  avatarUrl?: string;
  points?: number;
  distance?: number;
  calories?: number;
  lastActivityDate?: string;
  lastActivityType?: string;
  athleteId?: number;
}

export interface ChallengeInfo {
  startDate: string;
  endDate: string;
  currentWeek: number;
  totalWeeks: number;
}
