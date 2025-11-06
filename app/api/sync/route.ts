import { NextResponse } from 'next/server';
import { syncStravaData } from '@/lib/sync-strava';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for Vercel

export async function POST(request: Request) {
  try {
    // Optional: Add authentication here to prevent unauthorized syncs
    // Skip auth check for Vercel Cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-vercel-cron-secret');
    const expectedToken = process.env.SYNC_SECRET_TOKEN;
    
    // Allow if it's a Vercel cron job or has valid auth token
    if (expectedToken && !cronSecret && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await syncStravaData();
    
    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Optional: Allow GET for manual testing (remove in production)
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger sync',
    endpoint: '/api/sync',
  });
}

