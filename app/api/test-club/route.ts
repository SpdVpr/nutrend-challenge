import { NextResponse } from 'next/server';
import { getClubActivities, getClubStats } from '@/lib/strava';
import { CHALLENGE_START_DATE } from '@/lib/constants';

export async function GET() {
  try {
    const clubId = 1469610;
    const now = new Date();
    
    console.log('Testing club activities for:', clubId);
    console.log('Challenge start:', CHALLENGE_START_DATE.toISOString());
    console.log('Now:', now.toISOString());
    
    const [stats, activitiesAll, activitiesFiltered] = await Promise.all([
      getClubStats(clubId),
      getClubActivities(clubId),
      getClubActivities(clubId, CHALLENGE_START_DATE, now)
    ]);
    
    return NextResponse.json({
      clubId,
      stats,
      challengeStart: CHALLENGE_START_DATE.toISOString(),
      now: now.toISOString(),
      allActivities: {
        count: activitiesAll.totalActivities,
        hours: activitiesAll.totalHours,
        sample: activitiesAll.activities?.slice(0, 3).map(a => ({
          type: a.type,
          date: a.start_date,
          hours: (a.moving_time / 3600).toFixed(2),
          athlete: a.athlete?.firstname + ' ' + a.athlete?.lastname
        }))
      },
      filteredActivities: {
        count: activitiesFiltered.totalActivities,
        hours: activitiesFiltered.totalHours,
        sample: activitiesFiltered.activities?.slice(0, 3).map(a => ({
          type: a.type,
          date: a.start_date,
          hours: (a.moving_time / 3600).toFixed(2),
          athlete: a.athlete?.firstname + ' ' + a.athlete?.lastname
        }))
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
