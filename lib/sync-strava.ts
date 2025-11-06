import { adminDb } from './firebase-admin';
import { TEAMS, CHALLENGE_START_DATE } from './constants';
import { getClubStats, getClubActivities } from './strava';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to get the Monday of a given week
function getMondayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

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

export async function syncStravaData() {
  console.log('Starting Strava data sync...');

  // Verify Firebase Admin is initialized
  if (!adminDb) {
    throw new Error('Firebase Admin is not initialized');
  }

  const startDate = CHALLENGE_START_DATE;
  const endDate = new Date(); // Current date (no end date for challenge)

  console.log(`\n📅 Období synchronizace: ${startDate.toLocaleDateString('cs-CZ')} - ${endDate.toLocaleDateString('cs-CZ')} (${endDate.toLocaleTimeString('cs-CZ')})`);
  console.log(`⏱️  Celková doba trvání výzvy: ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} dní\n`);

  try {
    // Sync overall team stats (from challenge start to now)
    console.log('📊 Synchronizuji CELKOVÉ statistiky (od začátku výzvy do teď)...\n');
    
    const teamsData = await Promise.all(
      TEAMS.map(async (team) => {
        try {
          const [stats, activities] = await Promise.all([
            getClubStats(team.stravaClubId),
            getClubActivities(team.stravaClubId, startDate, endDate),
          ]);

          console.log(`✅ ${team.name}: ${activities.totalHours}h, ${activities.totalActivities} aktivit, ${stats.members} členů (CELKEM od ${startDate.toLocaleDateString('cs-CZ')})`);

          return {
            id: team.id,
            name: team.name,
            streamer: team.streamer,
            avatarUrl: team.avatarUrl,
            stravaClubId: team.stravaClubId,
            stravaClubUrl: team.stravaClubUrl,
            members: stats.members,
            totalHours: activities.totalHours,
            totalActivities: activities.totalActivities,
          };
        } catch (error) {
          console.error(`Error fetching data for team ${team.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed teams and sort by hours
    const validTeams = teamsData.filter(t => t !== null);
    const sortedTeams = validTeams.sort((a, b) => b!.totalHours - a!.totalHours);

    // Save to Firebase - overall stats
    await adminDb.collection('stats').doc('overall').set({
      teams: sortedTeams,
      lastUpdated: FieldValue.serverTimestamp(),
    });

    console.log('\n✅ Celkové statistiky úspěšně uloženy do Firebase\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Sync weekly stats from challenge start to current week
    const weeks = getWeeksSinceStart();
    
    console.log(`📅 Synchronizuji TÝDENNÍ statistiky (${weeks.length} týdnů od začátku výzvy)...\n`);
    
    // OPTIMIZATION: Fetch activities once per team for all weeks, then filter locally
    console.log('Fetching activities for all teams (optimized - one call per team)...');

    const teamActivitiesMap = new Map<string, any[]>();
    const teamMembersMap = new Map<string, number>();

    // Fetch all activities and member counts for each team once (covering all weeks)
    await Promise.all(
      TEAMS.map(async (team) => {
        try {
          const firstWeek = weeks[0];
          // Use current date instead of last week's end to avoid fetching future dates
          const now = new Date();

          console.log(`Fetching activities for ${team.id} from ${firstWeek.weekStart.toLocaleDateString('cs-CZ')} to ${now.toLocaleDateString('cs-CZ')}`);

          const [result, stats] = await Promise.all([
            getClubActivities(
              team.stravaClubId,
              firstWeek.weekStart,
              now  // Use current date instead of lastWeek.weekEnd
            ),
            getClubStats(team.stravaClubId)
          ]);

          teamActivitiesMap.set(team.id, result.activities || []);
          teamMembersMap.set(team.id, stats.members || 0);
        } catch (error) {
          console.error(`Error fetching activities for team ${team.id}:`, error);
          teamActivitiesMap.set(team.id, []);
          teamMembersMap.set(team.id, 0);
        }
      })
    );
    
    console.log('Activities fetched. Now processing weekly stats...');
    
    // Now process each week by filtering the already-fetched activities
    for (let i = 0; i < weeks.length; i++) {
      const { weekStart, weekEnd, weekId, weekNumber } = weeks[i];

      console.log(`\n📆 Týden ${weekNumber}: ${weekStart.toLocaleDateString('cs-CZ')} - ${weekEnd.toLocaleDateString('cs-CZ')}`);

      const weeklyData = TEAMS.map((team) => {
        const allActivities = teamActivitiesMap.get(team.id) || [];
        const members = teamMembersMap.get(team.id) || 0;

        // Filter activities for this specific week
        const weekActivities = allActivities.filter((activity: any) => {
          const activityDate = new Date(activity.start_date);
          return activityDate >= weekStart && activityDate <= weekEnd;
        });

        // Calculate total hours for this week
        const totalSeconds = weekActivities.reduce(
          (sum: number, activity: any) => sum + (activity.moving_time || 0),
          0
        );
        const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

        return {
          teamId: team.id,
          teamName: team.name,
          week: weekNumber,
          activities: weekActivities.length,
          hours: totalHours,
          members: members,
        };
      });

      // Sort by hours and assign points
      const sortedData = weeklyData.sort((a, b) => b.hours - a.hours);
      const dataWithPoints = sortedData.map((data, index) => ({
        ...data,
        points: [50, 40, 30, 20, 10][index] || 0,
      }));

      // Save to Firebase - weekly stats with unique ID based on date
      await adminDb.collection('stats').doc(`week-${weekId}`).set({
        week: weekNumber,
        weekId,
        teams: dataWithPoints,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        lastUpdated: FieldValue.serverTimestamp(),
      });

      console.log(`   ✅ Týden ${weekNumber} úspěšně uložen`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Synchronizace Strava dat dokončena!\n');
    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    console.error('Error syncing Strava data:', error);
    throw error;
  }
}

