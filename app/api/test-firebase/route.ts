import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to read from Firestore to test connection
    const testDoc = await adminDb.collection('stats').doc('overall').get();
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly',
      hasData: testDoc.exists,
      dataPreview: testDoc.exists ? {
        teams: testDoc.data()?.teams?.length || 0,
        lastUpdated: testDoc.data()?.lastUpdated || null,
      } : null,
    });
  } catch (error) {
    console.error('Firebase Admin test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are set in .env.local'
      },
      { status: 500 }
    );
  }
}