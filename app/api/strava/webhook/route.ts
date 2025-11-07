import { NextRequest, NextResponse } from 'next/server';
import { handleWebhookEvent } from '@/lib/webhook-handler';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('STRAVA_WEBHOOK_VERIFY_TOKEN not configured');
    return NextResponse.json(
      { error: 'Webhook verify token not configured' },
      { status: 500 }
    );
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook subscription validated');
    return NextResponse.json({ 'hub.challenge': challenge });
  }

  console.error('❌ Webhook validation failed');
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    console.log('📥 Webhook event received:', JSON.stringify(event, null, 2));

    const result = await handleWebhookEvent(event);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
