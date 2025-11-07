import { NextRequest, NextResponse } from 'next/server';
import { saveAthleteToken, getAthleteClubs, StravaTokenData } from '@/lib/strava-oauth';
import { TEAMS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    console.error('Strava authorization error:', error);
    return NextResponse.redirect(new URL(`/authorize?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    );
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Strava credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/authorize?error=token_exchange_failed', request.url));
    }

    const tokenData: StravaTokenData = await tokenResponse.json();

    const clubs = await getAthleteClubs(tokenData.athlete.id, tokenData.access_token);
    
    let assignedTeam: string | undefined;
    let assignedClubId: number | undefined;

    for (const team of TEAMS) {
      const isMember = clubs.some((club: any) => club.id === team.stravaClubId);
      if (isMember) {
        assignedTeam = team.id;
        assignedClubId = team.stravaClubId;
        break;
      }
    }

    await saveAthleteToken(tokenData, assignedTeam, assignedClubId);

    const redirectUrl = new URL('/authorize', request.url);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('athleteId', tokenData.athlete.id.toString());
    redirectUrl.searchParams.set('athlete', `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`);
    if (assignedTeam) {
      const team = TEAMS.find(t => t.id === assignedTeam);
      redirectUrl.searchParams.set('team', team?.name || assignedTeam);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(new URL('/authorize?error=server_error', request.url));
  }
}
