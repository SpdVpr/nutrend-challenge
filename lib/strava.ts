interface StravaTokenResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
}

interface StravaClubStats {
  member_count: number;
}

interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile?: string;
}

interface StravaClubMember {
  firstname: string;
  lastname: string;
  member_type: string;
  profile?: string;
  id: number;
}

interface StravaActivity {
  type: string;
  moving_time: number;
  start_date: string;
  athlete: StravaAthlete;
  id: number;
  name: string;
  distance: number;
}

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() / 1000 < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
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
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token');
  }

  const data: StravaTokenResponse = await response.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = data.expires_at;

  return data.access_token;
}

export async function getClubStats(clubId: number) {
  const accessToken = await getAccessToken();

  const response = await fetch(`https://www.strava.com/api/v3/clubs/${clubId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch club ${clubId} stats`);
  }

  const data: StravaClubStats = await response.json();
  return {
    members: data.member_count,
  };
}

export async function getClubActivities(
  clubId: number,
  startDate?: Date,
  endDate?: Date,
  page = 1,
  perPage = 200
) {
  const accessToken = await getAccessToken();

  // Build URL with date filters if provided
  let url = `https://www.strava.com/api/v3/clubs/${clubId}/activities?page=${page}&per_page=${perPage}`;
  
  // Strava API uses unix timestamps for after parameter
  // Note: Strava API doesn't support both 'after' and 'before' at the same time
  // We'll use 'after' and filter 'before' in code below
  if (startDate) {
    const afterTimestamp = Math.floor(startDate.getTime() / 1000);
    url += `&after=${afterTimestamp}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Strava API Error for club ${clubId}:`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Failed to fetch club ${clubId} activities: ${response.status} ${response.statusText}`);
  }

  const activities: StravaActivity[] = await response.json();

  const allowedTypes = ['Run', 'Walk', 'Hike', 'Workout'];
  let filteredActivities = activities.filter((activity) =>
    allowedTypes.includes(activity.type)
  );

  // Filter by date range if provided
  if (startDate || endDate) {
    filteredActivities = filteredActivities.filter((activity) => {
      const activityDate = new Date(activity.start_date);
      if (startDate && activityDate < startDate) return false;
      if (endDate && activityDate > endDate) return false;
      return true;
    });
  }

  const totalHours = filteredActivities.reduce(
    (sum, activity) => sum + activity.moving_time / 3600,
    0
  );

  return {
    totalActivities: filteredActivities.length,
    totalHours: Math.round(totalHours * 10) / 10,
    activities: filteredActivities,
    rawActivities: filteredActivities, // Include for member stats calculation
  };
}
