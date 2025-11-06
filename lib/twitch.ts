import { TwitchStream } from '@/types';
import { TEAMS } from './constants';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchApiStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
}

interface TwitchStreamsResponse {
  data: TwitchApiStream[];
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Získá access token pro Twitch API
 */
async function getTwitchAccessToken(): Promise<string> {
  // Použít cache, pokud je token ještě platný
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Twitch API credentials are not configured');
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`);
  }

  const data: TwitchTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000; // Refresh 5 min před expirací

  return cachedToken;
}

/**
 * Získá live streams od našich streamerů
 */
export async function getLiveStreams(): Promise<TwitchStream[]> {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      console.error('❌ TWITCH_CLIENT_ID is not configured');
      return [];
    }

    console.log('🔑 Getting Twitch access token...');
    const accessToken = await getTwitchAccessToken();
    console.log('✅ Access token obtained');
    
    // Získat usernames všech streamerů
    const usernames = TEAMS
      .filter(team => team.twitchUsername)
      .map(team => team.twitchUsername);

    console.log('👥 Checking streams for:', usernames.join(', '));

    if (usernames.length === 0) {
      console.log('❌ No streamers configured');
      return [];
    }

    // Sestavit URL pro API call
    const params = new URLSearchParams();
    usernames.forEach(username => {
      if (username) {
        params.append('user_login', username);
      }
    });

    const url = `https://api.twitch.tv/helix/streams?${params.toString()}`;
    console.log('📡 Calling Twitch API:', url);

    const response = await fetch(url, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Twitch API error:', response.status, errorText);
      throw new Error(`Twitch API error: ${response.statusText}`);
    }

    const data: TwitchStreamsResponse = await response.json();
    console.log(`📊 Twitch API returned ${data.data.length} streams`);

    // Mapovat streams na náš formát a přidat team info
    const streams: TwitchStream[] = data.data.map(stream => {
      const team = TEAMS.find(
        t => t.twitchUsername?.toLowerCase() === stream.user_login.toLowerCase()
      );

      return {
        id: stream.id,
        userId: stream.user_id,
        userLogin: stream.user_login,
        userName: stream.user_name,
        gameId: stream.game_id,
        gameName: stream.game_name,
        type: stream.type,
        title: stream.title,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url
          .replace('{width}', '440')
          .replace('{height}', '248'),
        teamId: team?.id || '',
        teamName: team?.name || '',
        teamAvatarUrl: team?.avatarUrl,
        twitchUrl: team?.twitchUrl || `https://www.twitch.tv/${stream.user_login}`,
      };
    });

    return streams;
  } catch (error) {
    console.error('Error fetching Twitch streams:', error);
    return [];
  }
}

/**
 * Formátuje počet viewers (1234 -> 1.2k)
 */
export function formatViewerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}