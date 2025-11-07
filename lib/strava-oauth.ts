import { adminDb } from './firebase-admin';

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile?: string;
  city?: string;
  country?: string;
}

export interface StravaTokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
}

export interface StoredAthleteToken {
  athleteId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  firstname: string;
  lastname: string;
  profile?: string;
  teamId?: string;
  stravaClubId?: number;
  createdAt: string;
  updatedAt: string;
}

export async function saveAthleteToken(tokenData: StravaTokenData, teamId?: string, stravaClubId?: number) {
  const athleteRef = adminDb.collection('athletes').doc(tokenData.athlete.id.toString());
  
  const athleteData: StoredAthleteToken = {
    athleteId: tokenData.athlete.id,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_at,
    firstname: tokenData.athlete.firstname,
    lastname: tokenData.athlete.lastname,
    profile: tokenData.athlete.profile,
    teamId,
    stravaClubId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await athleteRef.set(athleteData);
  console.log(`✅ Athlete token saved: ${tokenData.athlete.firstname} ${tokenData.athlete.lastname} (${tokenData.athlete.id})`);
}

export async function getAthleteToken(athleteId: number): Promise<StoredAthleteToken | null> {
  const athleteRef = adminDb.collection('athletes').doc(athleteId.toString());
  const doc = await athleteRef.get();
  
  if (!doc.exists) {
    return null;
  }
  
  return doc.data() as StoredAthleteToken;
}

export async function refreshAthleteToken(athleteId: number): Promise<string | null> {
  const athleteData = await getAthleteToken(athleteId);
  
  if (!athleteData) {
    console.error(`Athlete ${athleteId} not found in database`);
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  
  if (athleteData.expiresAt > now + 3600) {
    return athleteData.accessToken;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Strava credentials not configured');
  }

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: athleteData.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error(`Failed to refresh token for athlete ${athleteId}`);
    return null;
  }

  const data = await response.json();

  await adminDb.collection('athletes').doc(athleteId.toString()).update({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    updatedAt: new Date().toISOString(),
  });

  return data.access_token;
}

export async function getAllAthletes(): Promise<StoredAthleteToken[]> {
  const snapshot = await adminDb.collection('athletes').get();
  return snapshot.docs.map(doc => doc.data() as StoredAthleteToken);
}

export async function getAthletesByTeam(teamId: string): Promise<StoredAthleteToken[]> {
  const snapshot = await adminDb.collection('athletes').where('teamId', '==', teamId).get();
  return snapshot.docs.map(doc => doc.data() as StoredAthleteToken);
}

export async function getActivityDetails(activityId: number, accessToken: string) {
  const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity ${activityId}`);
  }

  return await response.json();
}

export async function getAthleteClubs(athleteId: number, accessToken: string): Promise<any[]> {
  const response = await fetch('https://www.strava.com/api/v3/athlete/clubs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch clubs for athlete ${athleteId}`);
    return [];
  }

  return await response.json();
}
