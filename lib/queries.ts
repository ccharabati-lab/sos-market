import { supabase } from './supabase';
import type {
  CrisisAlert,
  Listing,
  MatchResult,
  Profile,
  Severity,
} from '../types';

const EARTH_RADIUS_KM = 6371;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Returns the closest 10 `offer` listings in the given category, joined with
 * the supplier's profile and annotated with a haversine `distance_km` from
 * (userLat, userLng). Sorted ascending by distance.
 */
export async function getMatchingSuppliers(
  category: string,
  userLat: number,
  userLng: number,
): Promise<MatchResult[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles!inner(*)')
    .eq('type', 'offer')
    .eq('product_category', category);

  if (error) throw error;
  if (!data) return [];

  const rows = data as unknown as Array<Listing & { profiles: Profile }>;

  return rows
    .map((row) => {
      const { profiles: profile, ...listing } = row;
      const distance_km =
        profile.lat != null && profile.lng != null
          ? haversineKm(userLat, userLng, profile.lat, profile.lng)
          : Number.POSITIVE_INFINITY;
      // Spread profile first so the listing's id and created_at win.
      return {
        ...profile,
        ...listing,
        distance_km,
      } as MatchResult;
    })
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 10);
}

/**
 * Returns crisis alerts that have already started or will start within 48h,
 * with criticals before warnings.
 */
export async function getActiveCrises(): Promise<CrisisAlert[]> {
  const cutoffIso = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('crisis_alerts')
    .select('*')
    .lte('starts_at', cutoffIso);

  if (error) throw error;

  const severityRank: Record<Severity, number> = { critical: 0, warning: 1 };
  return (data ?? []).sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  );
}
