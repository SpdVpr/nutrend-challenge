import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { TEAMS, CHALLENGE_START_DATE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// Helper function to get current week ID
function getCurrentWeekId(): string {
  const today = new Date();
  let currentWeekStart = new Date(CHALLENGE_START_DATE);

  // Find the Monday of current week
  while (currentWeekStart <= today) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // If today is within this week, return this week's ID
    if (today >= currentWeekStart && today <= weekEnd) {
      return `${currentWeekStart.getFullYear()}-${String(currentWeekStart.getMonth() + 1).padStart(2, '0')}-${String(currentWeekStart.getDate()).padStart(2, '0')}`;
    }

    // Move to next Monday
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  // If no week found, return today's date as fallback
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export async function GET() {
  try {
    // Get current week ID
    const currentWeekId = getCurrentWeekId();
    console.log('📅 Current week ID:', currentWeekId);

    // Try to read current week's data from Firebase
    const weekDocRef = doc(db, 'stats', `week-${currentWeekId}`);
    const weekDocSnap = await getDoc(weekDocRef);

    let currentWeekData = null;
    if (weekDocSnap.exists()) {
      currentWeekData = weekDocSnap.data();
      console.log('✅ Found current week data:', currentWeekData);
    } else {
      console.log('⚠️ No data found for week-' + currentWeekId);
    }

    // If current week data exists, check if it has valid data
    if (currentWeekData && currentWeekData.teams && currentWeekData.teams.length > 0) {
      // Check if weekly data has actual hours/activities (not just zeros)
      const hasValidData = currentWeekData.teams.some((team: any) =>
        (team.hours && team.hours > 0) || (team.activities && team.activities > 0)
      );

      if (hasValidData) {
        // Convert weekly stats format to team format
        const teams = currentWeekData.teams.map((weeklyTeam: any) => {
          const baseTeam = TEAMS.find(t => t.id === weeklyTeam.teamId);
          return {
            ...baseTeam,
            totalHours: weeklyTeam.hours || 0,
            totalActivities: weeklyTeam.activities || 0,
            members: weeklyTeam.members || 0,
          };
        });

        return NextResponse.json({
          teams: teams,
          lastUpdated: currentWeekData.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
          weekId: currentWeekId,
          source: 'weekly',
        });
      } else {
        console.log('⚠️ Weekly data exists but has no hours/activities, falling back to overall stats');
      }
    }

    // Fallback: Try to get overall stats
    console.log('⚠️ No weekly data, trying overall stats...');
    const overallDocRef = doc(db, 'stats', 'overall');
    const overallDocSnap = await getDoc(overallDocRef);

    if (overallDocSnap.exists()) {
      const overallData = overallDocSnap.data();
      console.log('✅ Found overall data:', overallData);

      if (overallData.teams && overallData.teams.length > 0) {
        return NextResponse.json({
          teams: overallData.teams,
          lastUpdated: overallData.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
          source: 'overall',
        });
      }
    }

    // Last fallback: Return default TEAMS data with a warning
    console.log('⚠️ No Firebase data found, returning default TEAMS');
    return NextResponse.json({
      teams: TEAMS,
      lastUpdated: null,
      source: 'default',
      message: 'No synced data available. Please run sync first.',
    });

  } catch (error) {
    console.error('❌ Error fetching teams data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch teams data',
        teams: TEAMS,
        source: 'error-fallback'
      },
      { status: 500 }
    );
  }
}
