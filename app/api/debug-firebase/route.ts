import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statsRef = collection(db, 'stats');
    const snapshot = await getDocs(statsRef);
    
    const documents = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        hasTeams: !!data.teams,
        teamsCount: data.teams?.length || 0,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || null,
        weekId: data.weekId || null,
        week: data.week || null,
        // Sample first team if exists
        sampleTeam: data.teams?.[0] || null,
      });
    });
    
    return NextResponse.json({
      documentsCount: documents.length,
      documents: documents,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}