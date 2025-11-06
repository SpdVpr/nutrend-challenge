import { NextResponse } from 'next/server';
import { getLiveStreams } from '@/lib/twitch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 Fetching Twitch streams...');
    console.log('TWITCH_CLIENT_ID:', process.env.TWITCH_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('TWITCH_CLIENT_SECRET:', process.env.TWITCH_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    
    const streams = await getLiveStreams();
    
    console.log(`✅ Found ${streams.length} live streams`);
    if (streams.length > 0) {
      streams.forEach(stream => {
        console.log(`  - ${stream.userName}: ${stream.title} (${stream.viewerCount} viewers)`);
      });
    }
    
    return NextResponse.json({
      streams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error in /api/twitch/streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams', streams: [] },
      { status: 500 }
    );
  }
}