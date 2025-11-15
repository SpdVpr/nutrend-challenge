import { CHALLENGE_START_DATE } from './constants';

export interface ActivityForScoring {
  type: string;
  startDate: string;
  movingTime: number; // seconds
  distance: number; // meters
  calories?: number; // kcal (may be undefined)
}

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);
const WALK_TYPES = new Set(['Walk']);
const HIKE_TYPES = new Set(['Hike']);
const RIDE_TYPES = new Set([
  'Ride',
  'EBikeRide',
  'GravelRide',
  'MountainBikeRide',
  'VirtualRide',
  'Handcycle',
  'Velomobile',
  'Wheelchair',
]);
const SWIM_TYPES = new Set(['Swim']);
const ROW_TYPES = new Set(['Rowing', 'Canoeing', 'Kayaking', 'StandUpPaddling']);
const GYM_TYPES = new Set([
  'Workout',
  'Crossfit',
  'WeightTraining',
  'HighIntensityIntervalTraining',
]);
const YOGA_TYPES = new Set(['Yoga', 'Pilates', 'Stretching']);
const OTHER_CARDIO_TYPES = new Set(['Elliptical', 'StairStepper']);

function getDistanceCoefficient(type: string): number {
  if (RUN_TYPES.has(type)) return 1.0; // běh
  if (HIKE_TYPES.has(type)) return 0.7; // hike
  if (WALK_TYPES.has(type)) return 0.5; // chůze
  if (RIDE_TYPES.has(type)) return 0.3; // kolo, rotoped
  if (SWIM_TYPES.has(type)) return 3.0; // plavání
  if (ROW_TYPES.has(type)) return 1.5; // veslování, voda
  if (GYM_TYPES.has(type)) return 0; // posilovna = jen čas + kalorie
  if (YOGA_TYPES.has(type)) return 0;
  if (OTHER_CARDIO_TYPES.has(type)) return 0.2; // lehké kardio s menší vzdáleností
  return 0; // ostatní sporty = jen čas + kalorie
}

function isEligibleActivity(activity: ActivityForScoring): boolean {
  const minutes = (activity.movingTime || 0) / 60;
  if (minutes < 15) return false;

  const coeff = getDistanceCoefficient(activity.type);
  const distanceKm = (activity.distance || 0) / 1000;
  if (coeff > 0 && distanceKm < 1) return false;

  const activityDate = new Date(activity.startDate);
  if (activityDate < CHALLENGE_START_DATE) return false;

  return true;
}

export function calculatePointsForActivity(activity: ActivityForScoring) {
  if (!isEligibleActivity(activity)) {
    return { timePoints: 0, distancePoints: 0, caloriesPoints: 0, totalPoints: 0 };
  }

  const seconds = activity.movingTime || 0;
  const minutes = seconds / 60;
  const distanceKm = (activity.distance || 0) / 1000;
  const calories = activity.calories ?? 0;

  const timePoints = minutes / 10; // 10 minut = 1 bod (bez denního stropu)
  const distancePoints = distanceKm * getDistanceCoefficient(activity.type);
  const caloriesPoints = calories / 200;
  const totalPoints = timePoints + distancePoints + caloriesPoints;

  return { timePoints, distancePoints, caloriesPoints, totalPoints };
}

export function calculateAggregatePoints(activities: ActivityForScoring[]) {
  const timeByDay: Record<string, number> = {};
  let totalDistancePoints = 0;
  let totalCaloriesPoints = 0;

  for (const raw of activities) {
    if (!isEligibleActivity(raw)) continue;

    const seconds = raw.movingTime || 0;
    const distanceKm = (raw.distance || 0) / 1000;
    const calories = raw.calories ?? 0;

    const dayKey = new Date(raw.startDate).toISOString().slice(0, 10);
    timeByDay[dayKey] = (timeByDay[dayKey] || 0) + seconds;

    totalDistancePoints += distanceKm * getDistanceCoefficient(raw.type);
    totalCaloriesPoints += calories / 200;
  }

  let totalTimePoints = 0;
  for (const dayKey of Object.keys(timeByDay)) {
    const minutes = timeByDay[dayKey] / 60;
    const cappedMinutes = Math.min(minutes, 180); // denní strop 180 minut
    totalTimePoints += cappedMinutes / 10; // 10 minut = 1 bod
  }

  const totalPoints = totalTimePoints + totalDistancePoints + totalCaloriesPoints;

  return {
    totalTimePoints,
    totalDistancePoints,
    totalCaloriesPoints,
    totalPoints,
  };
}

