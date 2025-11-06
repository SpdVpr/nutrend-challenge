import { NextResponse } from 'next/server';
import { TEAMS, CHALLENGE_START_DATE } from '@/lib/constants';
import { getClubActivities } from '@/lib/strava';

export async function GET() {
  try {
    const testTeam = TEAMS[0];
    const weekStart = new Date(CHALLENGE_START_DATE);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const now = new Date();
    
    const result = await getClubActivities(
      testTeam.stravaClubId,
      weekStart,
      now
    );
    
    const activities = result.activities || [];
    
    // Debug each activity
    const activityDates = activities.slice(0, 5).map((activity: any) => {
      const activityDate = new Date(activity.start_date);
      return {
        name: activity.name,
        start_date_raw: activity.start_date,
        start_date_parsed: activityDate.toISOString(),
        start_date_time: activityDate.getTime(),
        weekStart_iso: weekStart.toISOString(),
        weekStart_time: weekStart.getTime(),
        weekEnd_iso: weekEnd.toISOString(),
        weekEnd_time: weekEnd.getTime(),
        isAfterStart: activityDate >= weekStart,
        isBeforeEnd: activityDate <= weekEnd,
        isInRange: activityDate >= weekStart && activityDate <= weekEnd,
      };
    });
    
    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      now: now.toISOString(),
      totalActivities: activities.length,
      sampleActivities: activityDates,
    });
  } catch (error: any) {
    console.error('Debug filter error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}