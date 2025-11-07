import { NextRequest, NextResponse } from 'next/server';
import { handleWebhookEvent } from '@/lib/webhook-handler';

export async function POST(request: NextRequest) {
  const secretToken = process.env.SYNC_SECRET_TOKEN;
  const authHeader = request.headers.get('authorization');

  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const athleteId = body.athleteId || 89686803;
    const activityId = body.activityId || Math.floor(Math.random() * 1000000000);

    const mockEvent = {
      aspect_type: 'create' as const,
      event_time: Math.floor(Date.now() / 1000),
      object_id: activityId,
      object_type: 'activity' as const,
      owner_id: athleteId,
      subscription_id: 0,
    };

    console.log('🧪 Testing webhook with mock event:', mockEvent);

    const result = await handleWebhookEvent(mockEvent);

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed',
      event: mockEvent,
      result,
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed', details: error.message },
      { status: 500 }
    );
  }
}
