import { NextResponse } from 'next/server';
import { TEAMS, CHALLENGE_START_DATE } from '@/lib/constants';
import { getClubActivities } from '@/lib/strava';

export async function GET() {
  try {
    const team = TEAMS[0]; // spajKK
    const weekStart = new Date(CHALLENGE_START_DATE);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
    
    const now = new Date();
    
    // Fetch activities
    const result = await getClubActivities(team.stravaClubId, weekStart, now);
    const activities = result.activities || [];
    
    let firstActivityDebug = null;
    if (activities.length > 0) {
      const firstActivity = activities[0];
      const activityDate = new Date(firstActivity.start_date);
      
      firstActivityDebug = {
        name: firstActivity.name,
        start_date_raw: firstActivity.start_date,
        start_date_parsed: activityDate.toISOString(),
        start_date_timestamp: activityDate.getTime(),
        weekStart_timestamp: weekStart.getTime(),
        weekEnd_timestamp: weekEnd.getTime(),
        isAfterStart: activityDate >= weekStart,
        isBeforeEnd: activityDate <= weekEnd,
        inRange: activityDate >= weekStart && activityDate <= weekEnd,
      };
    }
    
    // Try filtering
    const filtered = activities.filter((activity: any) => {
      const activityDate = new Date(activity.start_date);
      const inRange = activityDate >= weekStart && activityDate <= weekEnd;
      return inRange;
    });
    
    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      now: now.toISOString(),
      totalFetched: activities.length,
      totalFiltered: filtered.length,
      firstActivityDebug,
    });
  } catch (error: any) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}