import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { TEAMS } from '@/lib/constants';
import { ActivityForScoring, calculateAggregatePoints } from '@/lib/scoring';
import type { StoredAthleteToken } from '@/lib/strava-oauth';

export const dynamic = 'force-dynamic';

const TOP_N_PER_TEAM = 10;
const TOP_DISPLAY_PER_TEAM = 5;

interface AthleteAggregation {
  athleteId: number;
  teamId: string;
  firstname: string;
  lastname: string;
  profile?: string;
  totalActivities: number;
  totalMovingTime: number; // seconds
  totalDistance: number; // meters
  totalCalories: number; // kcal
  totalPoints: number;
  lastActivityDate?: string;
  lastActivityType?: string;
}

function resolveTeamId(data: StoredAthleteToken): string | undefined {
  // If athlete's teamId is one of the configured TEAMS, keep it
  if (data.teamId && TEAMS.some((t) => t.id === data.teamId)) {
    return data.teamId;
  }

  // If there is only one team (our current Nutrend Test klub setup),
  // assign everyone to that team for leaderboard purposes
  if (TEAMS.length === 1) {
    return TEAMS[0].id;
  }

  // Fallback: try to match by Strava club ID if available
  if (data.stravaClubId) {
    const byClub = TEAMS.find((t) => t.stravaClubId === data.stravaClubId);
    if (byClub) return byClub.id;
  }

  return undefined;
}

interface ActivityDocument {
  athleteId: number;
  type: string;
  startDate: string;
  movingTime: number;
  distance: number;
  calories?: number;
}

export async function GET() {
  try {
    // Fetch all athletes and all activities from Firestore (server-side via Admin SDK)
    const [athletesSnap, activitiesSnap] = await Promise.all([
      adminDb.collection('athletes').get(),
      adminDb.collection('activities').get(),
    ]);

    const athletesMap = new Map<number, StoredAthleteToken>();
    const teamMemberCounts = new Map<string, number>();

    athletesSnap.docs.forEach((doc) => {
      const data = doc.data() as StoredAthleteToken;
      const resolvedTeamId = resolveTeamId(data);

      if (!resolvedTeamId) return;

      const athleteWithResolvedTeam: StoredAthleteToken = {
        ...data,
        teamId: resolvedTeamId,
      };

      athletesMap.set(athleteWithResolvedTeam.athleteId, athleteWithResolvedTeam);
      teamMemberCounts.set(
        resolvedTeamId,
        (teamMemberCounts.get(resolvedTeamId) || 0) + 1
      );
    });

    const athleteActivities = new Map<number, ActivityForScoring[]>();
    const athleteAgg = new Map<number, AthleteAggregation>();

    activitiesSnap.docs.forEach((doc) => {
      const data = doc.data() as ActivityDocument;
      const athleteId = data.athleteId as number | undefined;
      if (!athleteId) return;

      const athlete = athletesMap.get(athleteId);
      if (!athlete || !athlete.teamId) return; // skip activities for athletes without team

      let agg = athleteAgg.get(athleteId);
      if (!agg) {
        agg = {
          athleteId,
          teamId: athlete.teamId,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          profile: athlete.profile,
          totalActivities: 0,
          totalMovingTime: 0,
          totalDistance: 0,
          totalCalories: 0,
          totalPoints: 0,
        };
        athleteAgg.set(athleteId, agg);
      }

      const activityForScoring: ActivityForScoring = {
        type: data.type,
        startDate: data.startDate,
        movingTime: data.movingTime || 0,
        distance: data.distance || 0,
        calories: data.calories ?? 0,
      };

      if (!athleteActivities.has(athleteId)) {
        athleteActivities.set(athleteId, []);
      }
      athleteActivities.get(athleteId)!.push(activityForScoring);

      agg.totalActivities += 1;
      agg.totalMovingTime += activityForScoring.movingTime;
      agg.totalDistance += activityForScoring.distance;
      agg.totalCalories += activityForScoring.calories ?? 0;

      // Track last activity (by startDate)
      if (!agg.lastActivityDate || new Date(activityForScoring.startDate) > new Date(agg.lastActivityDate)) {
        agg.lastActivityDate = activityForScoring.startDate;
        agg.lastActivityType = activityForScoring.type;
      }
    });

    // Compute points for each athlete using the shared scoring helper (with daily cap)
    athleteActivities.forEach((activities, athleteId) => {
      const agg = athleteAgg.get(athleteId);
      if (!agg) return;
      const points = calculateAggregatePoints(activities);
      agg.totalPoints = points.totalPoints;
    });

    // Group athletes by team
    const teamAthletes = new Map<string, AthleteAggregation[]>();
    athleteAgg.forEach((agg) => {
      if (!teamAthletes.has(agg.teamId)) {
        teamAthletes.set(agg.teamId, []);
      }
      teamAthletes.get(agg.teamId)!.push(agg);
    });

    // Build team objects with TOP N scoring
    const teamsWithStats = TEAMS.map((baseTeam) => {
      const athletes = teamAthletes.get(baseTeam.id) || [];

      const sortedByPoints = [...athletes].sort((a, b) => b.totalPoints - a.totalPoints);
      const topN = sortedByPoints.slice(0, TOP_N_PER_TEAM);
      const top5 = sortedByPoints.slice(0, TOP_DISPLAY_PER_TEAM);

      const totalPointsTopN = topN.reduce((sum, a) => sum + a.totalPoints, 0);
      const totalHoursAll = athletes.reduce((sum, a) => sum + a.totalMovingTime / 3600, 0);
      const totalActivitiesAll = athletes.reduce((sum, a) => sum + a.totalActivities, 0);
      const totalCaloriesAll = athletes.reduce((sum, a) => sum + a.totalCalories, 0);

      const topMembers = top5.map((a) => ({
        name: `${a.firstname} ${a.lastname}`.trim(),
        hours: Math.round((a.totalMovingTime / 3600) * 10) / 10,
        activities: a.totalActivities,
        avatarUrl: a.profile,
        points: Math.round(a.totalPoints * 10) / 10,
        distance: Math.round((a.totalDistance / 1000) * 10) / 10,
        calories: Math.round(a.totalCalories),
        lastActivityDate: a.lastActivityDate,
        lastActivityType: a.lastActivityType,
        athleteId: a.athleteId,
      }));

      return {
        ...baseTeam,
        members: teamMemberCounts.get(baseTeam.id) || 0,
        totalHours: Math.round(totalHoursAll * 10) / 10,
        totalActivities: totalActivitiesAll,
        totalCalories: Math.round(totalCaloriesAll),
        totalPoints: Math.round(totalPointsTopN * 10) / 10,
        topMembers,
      };
    });

    // Sort teams by total points (TOP N athletes)
    teamsWithStats.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    return NextResponse.json({
      teams: teamsWithStats,
      lastUpdated: new Date().toISOString(),
      source: 'activities',
    });
  } catch (error) {
    console.error('❌ Error fetching teams data from activities:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch teams data',
        teams: TEAMS,
        source: 'error-fallback',
      },
      { status: 500 }
    );
  }
}
