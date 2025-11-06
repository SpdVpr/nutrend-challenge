import { NextResponse } from 'next/server';
import { syncStravaData } from '@/lib/sync-strava';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST() {
  try {
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

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger manual sync',
    endpoint: '/api/manual-sync',
  });
}
