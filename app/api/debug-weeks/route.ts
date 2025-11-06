import { NextResponse } from 'next/server';
import { CHALLENGE_START_DATE } from '@/lib/constants';

// Copy of getWeeksSinceStart function
function getWeeksSinceStart(): Array<{ weekStart: Date; weekEnd: Date; weekId: string; weekNumber: number }> {
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
  
  return weeks;
}

export async function GET() {
  const weeks = getWeeksSinceStart();
  const now = new Date();
  
  return NextResponse.json({
    challengeStart: CHALLENGE_START_DATE.toISOString(),
    now: now.toISOString(),
    weeksCount: weeks.length,
    weeks: weeks.map(w => ({
      weekNumber: w.weekNumber,
      weekId: w.weekId,
      weekStart: w.weekStart.toISOString(),
      weekEnd: w.weekEnd.toISOString(),
      isCurrent: now >= w.weekStart && now <= w.weekEnd,
      isPast: now > w.weekEnd,
      isFuture: now < w.weekStart,
    })),
  });
}