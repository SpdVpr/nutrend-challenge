import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { CHALLENGE_START_DATE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// Helper function to get all weeks from challenge start to current week
function getWeeksSinceStart(): Array<{ weekStart: Date; weekEnd: Date; weekId: string; weekNumber: number }> {
  const weeks = [];
  const today = new Date();
  
  // Start from the challenge start date (Monday, November 3, 2025)
  let currentWeekStart = new Date(CHALLENGE_START_DATE);
  let weekNumber = 1;
  
  // Generate weeks until we reach current week
  while (currentWeekStart <= today) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);
    
    // Create a unique week ID based on the date range
    const weekId = `${currentWeekStart.getFullYear()}-${String(currentWeekStart.getMonth() + 1).padStart(2, '0')}-${String(currentWeekStart.getDate()).padStart(2, '0')}`;
    
    weeks.push({ 
      weekStart: new Date(currentWeekStart), 
      weekEnd: new Date(weekEnd), 
      weekId,
      weekNumber 
    });
    
    // Move to next Monday
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    weekNumber++;
  }
  
  return weeks;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all weeks from challenge start to now
    const weeks = getWeeksSinceStart();
    
    const allWeeksData = await Promise.all(
      weeks.map(async ({ weekId, weekStart, weekEnd, weekNumber }) => {
        try {
          const statsRef = collection(db, 'stats');
          const docSnap = await getDocs(query(statsRef));

          // Find the document for this week
          let weekData: any = null;
          docSnap.forEach((doc) => {
            if (doc.id === `week-${weekId}`) {
              weekData = doc.data();
            }
          });

          if (weekData) {
            return {
              week: weekNumber,
              weekId,
              teams: weekData.teams,
              weekStart: weekData.weekStart,
              weekEnd: weekData.weekEnd,
              weekLabel: `Týden ${weekNumber} (${weekStart.getDate()}.${weekStart.getMonth() + 1}. - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.)`,
              lastUpdated: weekData.lastUpdated?.toDate?.()?.toISOString() || null,
            };
          } else {
            return {
              week: weekNumber,
              weekId,
              teams: [],
              weekStart: weekStart.toISOString(),
              weekEnd: weekEnd.toISOString(),
              weekLabel: `Týden ${weekNumber} (${weekStart.getDate()}.${weekStart.getMonth() + 1}. - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.)`,
              lastUpdated: null,
            };
          }
        } catch (error) {
          console.error(`Error fetching week ${weekId}:`, error);
          return {
            week: weekNumber,
            weekId,
            teams: [],
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            weekLabel: `Týden ${weekNumber} (${weekStart.getDate()}.${weekStart.getMonth() + 1}. - ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.)`,
            lastUpdated: null,
          };
        }
      })
    );

    return NextResponse.json({
      weeks: allWeeksData,
    });
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly data' },
      { status: 500 }
    );
  }
}

