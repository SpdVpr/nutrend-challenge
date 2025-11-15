import { adminDb } from './firebase-admin';
import { getAthleteToken, refreshAthleteToken, getActivityDetails } from './strava-oauth';
import { TEAMS, CHALLENGE_START_DATE } from './constants';
import { FieldValue } from 'firebase-admin/firestore';

interface StravaWebhookEvent {
  aspect_type: 'create' | 'update' | 'delete';
  event_time: number;
  object_id: number;
  object_type: 'activity' | 'athlete';
  owner_id: number;
  subscription_id: number;
  updates?: Record<string, any>;
}

interface ProcessedActivity {
  activityId: number;
  athleteId: number;
  teamId: string;
  type: string;
  startDate: string;
  movingTime: number;
  distance: number;
  calories?: number;
  name: string;
}

function getMondayOfWeek(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekNumber(date: Date): number {
  const challengeStart = new Date(CHALLENGE_START_DATE);
  const activityDate = new Date(date);
  
  const challengeMonday = getMondayOfWeek(challengeStart);
  const activityMonday = getMondayOfWeek(activityDate);
  
  const diffTime = activityMonday.getTime() - challengeMonday.getTime();
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  
  return diffWeeks + 1;
}

function getWeekId(date: Date): string {
  const monday = getMondayOfWeek(date);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function handleWebhookEvent(event: StravaWebhookEvent) {
  console.log('📥 Webhook event received:', JSON.stringify(event, null, 2));

  if (event.object_type === 'athlete' && event.aspect_type === 'update') {
    if (event.updates?.authorized === 'false') {
      await handleDeauthorization(event.owner_id);
    }
    return { success: true, message: 'Athlete event processed' };
  }

  if (event.object_type !== 'activity') {
    return { success: true, message: 'Not an activity event' };
  }

  if (event.aspect_type === 'create') {
    return await handleActivityCreate(event);
  }

  if (event.aspect_type === 'delete') {
    return await handleActivityDelete(event);
  }

  if (event.aspect_type === 'update') {
    return await handleActivityUpdate(event);
  }

  return { success: true, message: 'Event processed' };
}

async function handleActivityCreate(event: StravaWebhookEvent) {
  console.log(`🆕 New activity created: ${event.object_id} by athlete ${event.owner_id}`);

  const athleteData = await getAthleteToken(event.owner_id);
  
  if (!athleteData) {
    console.log(`⚠️ Athlete ${event.owner_id} not found in database`);
    return { success: false, message: 'Athlete not authorized' };
  }

  const accessToken = await refreshAthleteToken(event.owner_id);
  
  if (!accessToken) {
    console.error(`❌ Failed to get access token for athlete ${event.owner_id}`);
    return { success: false, message: 'Failed to refresh token' };
  }

  const activity = await getActivityDetails(event.object_id, accessToken);

  const activityDate = new Date(activity.start_date);
  const challengeStart = new Date(CHALLENGE_START_DATE);
  
  if (activityDate < challengeStart) {
    console.log(`⏭️ Activity before challenge start date`);
    return { success: true, message: 'Activity before challenge start' };
  }

  if (!athleteData.teamId) {
    console.log(`⚠️ Athlete ${event.owner_id} has no team assigned`);
    return { success: false, message: 'No team assigned' };
  }

  const processedActivity: ProcessedActivity = {
    activityId: activity.id,
    athleteId: event.owner_id,
    teamId: athleteData.teamId,
    type: activity.type,
    startDate: activity.start_date,
    movingTime: activity.moving_time,
    distance: activity.distance,
    calories: activity.calories ?? 0,
    name: activity.name,
  };

  await saveActivity(processedActivity);
  await updateTeamStats(processedActivity);

  console.log(`✅ Activity ${event.object_id} processed successfully`);
  return { success: true, message: 'Activity created and stats updated' };
}

async function handleActivityDelete(event: StravaWebhookEvent) {
  console.log(`🗑️ Activity deleted: ${event.object_id}`);

  const activityRef = adminDb.collection('activities').doc(event.object_id.toString());
  const activityDoc = await activityRef.get();

  if (!activityDoc.exists) {
    console.log(`⚠️ Activity ${event.object_id} not found in database`);
    return { success: true, message: 'Activity not found' };
  }

  const activityData = activityDoc.data() as ProcessedActivity;
  
  await activityRef.delete();
  await recalculateTeamStats(activityData.teamId);

  console.log(`✅ Activity ${event.object_id} deleted and stats recalculated`);
  return { success: true, message: 'Activity deleted and stats updated' };
}

async function handleActivityUpdate(event: StravaWebhookEvent) {
  console.log(`📝 Activity updated: ${event.object_id}`);

  if (event.updates?.private === 'true') {
    return await handleActivityDelete(event);
  }

  if (event.updates?.private === 'false') {
    return await handleActivityCreate(event);
  }

  return { success: true, message: 'Activity update processed' };
}

async function handleDeauthorization(athleteId: number) {
  console.log(`🚫 Athlete ${athleteId} deauthorized`);
  
  const athleteRef = adminDb.collection('athletes').doc(athleteId.toString());
  await athleteRef.delete();
  
  console.log(`✅ Athlete ${athleteId} removed from database`);
}

async function saveActivity(activity: ProcessedActivity) {
  const activityRef = adminDb.collection('activities').doc(activity.activityId.toString());
  
  await activityRef.set({
    ...activity,
    createdAt: new Date().toISOString(),
  });
}

async function updateTeamStats(activity: ProcessedActivity) {
  const activityDate = new Date(activity.startDate);
  const weekNumber = getWeekNumber(activityDate);
  const weekId = getWeekId(activityDate);

  await updateOverallStats(activity);
  await updateWeeklyStats(activity, weekNumber, weekId);
}

async function updateOverallStats(activity: ProcessedActivity) {
  const overallRef = adminDb.collection('stats').doc('overall');
  const overallDoc = await overallRef.get();

  if (!overallDoc.exists) {
    console.log('⚠️ Overall stats not found, skipping update');
    return;
  }

  const data = overallDoc.data();
  const teams = data?.teams || [];

  const teamIndex = teams.findIndex((t: any) => t.id === activity.teamId);
  
  if (teamIndex === -1) {
    console.log(`⚠️ Team ${activity.teamId} not found in overall stats`);
    return;
  }

  teams[teamIndex].totalActivities = (teams[teamIndex].totalActivities || 0) + 1;
  teams[teamIndex].totalHours = Math.round(((teams[teamIndex].totalHours || 0) + activity.movingTime / 3600) * 10) / 10;

  teams.sort((a: any, b: any) => b.totalHours - a.totalHours);

  await overallRef.update({
    teams,
    lastUpdated: FieldValue.serverTimestamp(),
  });

  console.log(`✅ Overall stats updated for team ${activity.teamId}`);
}

async function updateWeeklyStats(activity: ProcessedActivity, weekNumber: number, weekId: string) {
  const weekRef = adminDb.collection('stats').doc(`week-${weekId}`);
  const weekDoc = await weekRef.get();

  const activityMonday = getMondayOfWeek(new Date(activity.startDate));
  const weekEnd = new Date(activityMonday);
  weekEnd.setDate(activityMonday.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  if (!weekDoc.exists) {
    const teams = TEAMS.map(team => ({
      teamId: team.id,
      teamName: team.name,
      week: weekNumber,
      activities: team.id === activity.teamId ? 1 : 0,
      hours: team.id === activity.teamId ? Math.round((activity.movingTime / 3600) * 10) / 10 : 0,
      members: team.members || 0,
      points: 0,
    }));

    teams.sort((a, b) => b.hours - a.hours);
    const teamsWithPoints = teams.map((data, index) => ({
      ...data,
      points: [50, 40, 30, 20, 10][index] || 0,
    }));

    await weekRef.set({
      week: weekNumber,
      weekId,
      teams: teamsWithPoints,
      weekStart: activityMonday.toISOString(),
      weekEnd: weekEnd.toISOString(),
      lastUpdated: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Weekly stats created for week ${weekNumber}`);
    return;
  }

  const weekData = weekDoc.data();
  const teams = weekData?.teams || [];

  const teamIndex = teams.findIndex((t: any) => t.teamId === activity.teamId);
  
  if (teamIndex !== -1) {
    teams[teamIndex].activities = (teams[teamIndex].activities || 0) + 1;
    teams[teamIndex].hours = Math.round(((teams[teamIndex].hours || 0) + activity.movingTime / 3600) * 10) / 10;

    teams.sort((a: any, b: any) => b.hours - a.hours);
    const teamsWithPoints = teams.map((data: any, index: number) => ({
      ...data,
      points: [50, 40, 30, 20, 10][index] || 0,
    }));

    await weekRef.update({
      teams: teamsWithPoints,
      lastUpdated: FieldValue.serverTimestamp(),
    });

    console.log(`✅ Weekly stats updated for team ${activity.teamId}, week ${weekNumber}`);
  }
}

async function recalculateTeamStats(teamId: string) {
  console.log(`🔄 Recalculating stats for team ${teamId}`);

  const activitiesSnapshot = await adminDb.collection('activities').where('teamId', '==', teamId).get();
  const activities = activitiesSnapshot.docs.map(doc => doc.data() as ProcessedActivity);

  const overallHours = activities.reduce((sum, act) => sum + act.movingTime / 3600, 0);
  const overallActivities = activities.length;

  const overallRef = adminDb.collection('stats').doc('overall');
  const overallDoc = await overallRef.get();

  if (overallDoc.exists) {
    const data = overallDoc.data();
    const teams = data?.teams || [];
    const teamIndex = teams.findIndex((t: any) => t.id === teamId);
    
    if (teamIndex !== -1) {
      teams[teamIndex].totalActivities = overallActivities;
      teams[teamIndex].totalHours = Math.round(overallHours * 10) / 10;

      teams.sort((a: any, b: any) => b.totalHours - a.totalHours);

      await overallRef.update({
        teams,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    }
  }

  const weeklyActivities = new Map<string, ProcessedActivity[]>();
  
  activities.forEach(act => {
    const weekId = getWeekId(new Date(act.startDate));
    if (!weeklyActivities.has(weekId)) {
      weeklyActivities.set(weekId, []);
    }
    weeklyActivities.get(weekId)!.push(act);
  });

  for (const [weekId, weekActivities] of weeklyActivities) {
    const weekRef = adminDb.collection('stats').doc(`week-${weekId}`);
    const weekDoc = await weekRef.get();

    if (weekDoc.exists) {
      const weekData = weekDoc.data();
      const teams = weekData?.teams || [];
      const teamIndex = teams.findIndex((t: any) => t.teamId === teamId);

      if (teamIndex !== -1) {
        const weekHours = weekActivities.reduce((sum, act) => sum + act.movingTime / 3600, 0);
        teams[teamIndex].activities = weekActivities.length;
        teams[teamIndex].hours = Math.round(weekHours * 10) / 10;

        teams.sort((a: any, b: any) => b.hours - a.hours);
        const teamsWithPoints = teams.map((data: any, index: number) => ({
          ...data,
          points: [50, 40, 30, 20, 10][index] || 0,
        }));

        await weekRef.update({
          teams: teamsWithPoints,
          lastUpdated: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  console.log(`✅ Stats recalculated for team ${teamId}`);
}
