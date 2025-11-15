import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ActivityForScoring, calculateAggregatePoints, calculatePointsForActivity } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  const { athleteId } = await params;

  if (!athleteId) {
    return NextResponse.json(
      { error: 'Athlete ID is required' },
      { status: 400 }
    );
  }

  try {
    const athleteRef = adminDb.collection('athletes').doc(athleteId);
    const athleteDoc = await athleteRef.get();

    if (!athleteDoc.exists) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      );
    }

    const athleteData = athleteDoc.data();

    const activitiesSnapshot = await adminDb
      .collection('activities')
      .where('athleteId', '==', parseInt(athleteId))
      .get();

    const allActivities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const sortedActivities = allActivities.sort(
      (a: any, b: any) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const totalActivities = allActivities.length;
    const totalHours = allActivities.reduce((sum, activity: any) => {
      return sum + (activity.movingTime || 0) / 3600;
    }, 0);
    const totalDistance = allActivities.reduce((sum, activity: any) => {
      return sum + (activity.distance || 0) / 1000;
    }, 0);
    const totalCalories = allActivities.reduce((sum, activity: any) => {
      return sum + (activity.calories || 0);
    }, 0);

    const aggregatePoints = calculateAggregatePoints(
      allActivities as ActivityForScoring[]
    );

    const response = {
      athlete: {
        id: athleteData?.athleteId,
        firstname: athleteData?.firstname,
        lastname: athleteData?.lastname,
        profile: athleteData?.profile,
        teamId: athleteData?.teamId,
        stravaClubId: athleteData?.stravaClubId,
      },
      stats: {
        totalActivities,
        totalHours: Math.round(totalHours * 10) / 10,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalCalories: Math.round(totalCalories),
        totalPoints: Math.round(aggregatePoints.totalPoints * 10) / 10,
      },
      recentActivities: sortedActivities.slice(0, 5).map((activity: any) => {
        const points = calculatePointsForActivity(
          activity as ActivityForScoring
        );
        return {
          id: activity.activityId,
          name: activity.name,
          type: activity.type,
          startDate: activity.startDate,
          movingTime: activity.movingTime,
          distance: activity.distance,
          calories: activity.calories || 0,
          points: Math.round(points.totalPoints * 10) / 10,
        };
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching athlete data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
