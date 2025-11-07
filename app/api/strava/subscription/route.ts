import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const secretToken = process.env.SYNC_SECRET_TOKEN;

  const authHeader = request.headers.get('authorization');
  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Strava credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions?client_id=${clientId}&client_secret=${clientSecret}`,
      { method: 'GET' }
    );

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      subscriptions: data,
    });
  } catch (error) {
    console.error('Error viewing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to view subscription' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secretToken = process.env.SYNC_SECRET_TOKEN;

  const authHeader = request.headers.get('authorization');
  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!clientId || !clientSecret || !verifyToken || !appUrl) {
    return NextResponse.json(
      { error: 'Missing required configuration' },
      { status: 500 }
    );
  }

  const callbackUrl = `${appUrl}/api/strava/webhook`;

  try {
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('callback_url', callbackUrl);
    formData.append('verify_token', verifyToken);

    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to create subscription:', errorData);
      return NextResponse.json(
        { error: 'Failed to create subscription', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Webhook subscription created',
      subscription: data,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subscriptionId = searchParams.get('id');

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const secretToken = process.env.SYNC_SECRET_TOKEN;

  const authHeader = request.headers.get('authorization');
  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!subscriptionId) {
    return NextResponse.json(
      { error: 'Missing subscription ID' },
      { status: 400 }
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Strava credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}?client_id=${clientId}&client_secret=${clientSecret}`,
      { method: 'DELETE' }
    );

    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'Subscription deleted successfully',
      });
    }

    const errorData = await response.text();
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: errorData },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
