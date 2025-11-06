import { NextResponse } from 'next/server';
import { TEAMS, CHALLENGE_START_DATE } from '@/lib/constants';
import { getClubActivities } from '@/lib/strava';

export async function GET() {
  try {
    const weeks = [];
    const today = new Date();
    let currentWeekStart = new Date(CHALLENGE_START_DATE);
    let weekNumber = 1;
    
    while (currentWeekStart <= today) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekId = `${currentWeekStart.getFullYear()}-${String(currentWeekStart.getMonth() + 1).padStart(2, '0')}-${String(currentWeekStart.getDate()).padStart(2, '0')}`;
      
      weeks.push({ 
        weekStart: new Date(currentWeekStart), 
        weekEnd: new Date(weekEnd), 
        weekId,
        weekNumber 
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }
    
    console.log(`Weeks generated: ${weeks.length}`);
    console.log('Weeks:', weeks.map(w => `${w.weekId} (${w.weekStart.toISOString()} - ${w.weekEnd.toISOString()})`));
    
    // Test fetching activities for first team
    const testTeam = TEAMS[0];
    const firstWeek = weeks[0];
    const now = new Date();
    
    console.log(`\nTesting fetch for ${testTeam.name}:`);
    console.log(`  From: ${firstWeek.weekStart.toISOString()}`);
    console.log(`  To: ${now.toISOString()}`);
    
    const result = await getClubActivities(
      testTeam.stravaClubId,
      firstWeek.weekStart,
      now
    );
    
    console.log(`  Result: ${result.totalActivities} activities, ${result.totalHours} hours`);
    console.log(`  Activities array length: ${result.activities?.length || 0}`);
    
    // Filter activities for the week
    const weekActivities = (result.activities || []).filter((activity: any) => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= firstWeek.weekStart && activityDate <= firstWeek.weekEnd;
    });
    
    console.log(`  After filtering for week 1: ${weekActivities.length} activities`);
    
    return NextResponse.json({
      weeks: weeks.map(w => ({
        weekId: w.weekId,
        weekStart: w.weekStart.toISOString(),
        weekEnd: w.weekEnd.toISOString(),
      })),
      testTeam: {
        name: testTeam.name,
        clubId: testTeam.stravaClubId,
      },
      fetchParams: {
        from: firstWeek.weekStart.toISOString(),
        to: now.toISOString(),
      },
      result: {
        totalActivities: result.totalActivities,
        totalHours: result.totalHours,
        activitiesCount: result.activities?.length || 0,
        weekActivitiesCount: weekActivities.length,
        sampleActivity: result.activities?.[0] || null,
        sampleWeekActivity: weekActivities[0] || null,
      }
    });
  } catch (error: any) {
    console.error('Debug sync error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}