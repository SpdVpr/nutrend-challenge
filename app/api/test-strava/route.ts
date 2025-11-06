import { NextResponse } from 'next/server';
import { getClubStats, getClubActivities } from '@/lib/strava';

export async function GET() {
  try {
    const testClubId = 1469610; // Team spajKK
    
    console.log(`Testing Strava API with club ${testClubId}...`);
    
    // Test 1: Get club stats
    const stats = await getClubStats(testClubId);
    console.log('Club stats:', stats);
    
    // Test 2: Get club activities (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    const activities = await getClubActivities(testClubId, weekAgo, today);
    console.log('Activities:', activities);
    
    return NextResponse.json({
      success: true,
      clubId: testClubId,
      stats,
      activities,
      dateRange: {
        from: weekAgo.toISOString(),
        to: today.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Strava API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}