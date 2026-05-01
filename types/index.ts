export type Role = 'supermarket' | 'producer' | 'restaurant';
export type ListingType = 'offer' | 'need';
export type Severity = 'critical' | 'warning';

export interface Profile extends Record<string, unknown> {
  id: string;
  name: string;
  role: Role;
  lat: number | null;
  lng: number | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface Listing extends Record<string, unknown> {
  id: string;
  owner_id: string;
  type: ListingType;
  product_category: string;
  product_name: string;
  quantity: number | null;
  unit: string | null;
  available_from: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface CrisisAlert extends Record<string, unknown> {
  id: string;
  title: string;
  severity: Severity;
  affected_categories: string[];
  region: string | null;
  starts_at: string | null;
  ends_at: string | null;
  source: string | null;
  created_at: string;
}

/**
 * A listing returned from a supplier-matching query: the listing plus the
 * supplier's profile fields plus a haversine distance from the requesting user.
 * When a key collides between Listing and Profile, the Listing value wins
 * (so `id` is the listing id, not the supplier id — `owner_id` carries that).
 */
export type MatchResult = Listing & Profile & { distance_km: number };

/**
 * Schema layout consumed by `createClient<Database>` so query results are
 * typed end-to-end.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; name: string; role: Role };
        Update: Partial<Profile>;
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: Partial<Listing> & {
          owner_id: string;
          type: ListingType;
          product_category: string;
          product_name: string;
        };
        Update: Partial<Listing>;
        Relationships: [];
      };
      crisis_alerts: {
        Row: CrisisAlert;
        Insert: Partial<CrisisAlert> & { title: string; severity: Severity };
        Update: Partial<CrisisAlert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
