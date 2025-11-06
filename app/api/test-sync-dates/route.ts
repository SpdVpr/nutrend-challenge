import { NextResponse } from 'next/server';
import { getClubActivities } from '@/lib/strava';
import { CHALLENGE_START_DATE } from '@/lib/constants';

export async function GET() {
  try {
    const testClubId = 1469610; // Team spajKK
    const startDate = CHALLENGE_START_DATE; // Nov 3, 2025
    const endDate = new Date(); // Now
    
    console.log(`Testing with challenge dates:`);
    console.log(`Start: ${startDate.toISOString()}`);
    console.log(`End: ${endDate.toISOString()}`);
    
    const activities = await getClubActivities(testClubId, startDate, endDate);
    console.log('Activities result:', activities);
    
    // Also test the raw activities
    console.log(`Total activities found: ${activities.activities?.length || 0}`);
    if (activities.activities && activities.activities.length > 0) {
      console.log('First activity:', activities.activities[0]);
    }
    
    return NextResponse.json({
      success: true,
      clubId: testClubId,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      result: {
        totalActivities: activities.totalActivities,
        totalHours: activities.totalHours,
        activitiesCount: activities.activities?.length || 0,
        sampleActivity: activities.activities?.[0] || null,
      }
    });
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}