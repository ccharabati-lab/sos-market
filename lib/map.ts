export interface GeoPoint {
  lat: number | null;
  lng: number | null;
}

export interface PinPosition {
  top: string;
  left: string;
}

/**
 * Projects geographic points onto a normalized 2D map by computing a bounding
 * box that contains the origin plus all valid points. Returns CSS percentage
 * positions for each. Points without coordinates resolve to null.
 */
export function projectPins(
  origin: GeoPoint,
  points: GeoPoint[],
): { origin: PinPosition; points: (PinPosition | null)[] } {
  const all = [origin, ...points].filter(
    (p): p is { lat: number; lng: number } => p.lat != null && p.lng != null,
  );

  if (all.length === 0) {
    return {
      origin: { top: '50%', left: '50%' },
      points: points.map(() => null),
    };
  }

  let minLat = Math.min(...all.map((p) => p.lat));
  let maxLat = Math.max(...all.map((p) => p.lat));
  let minLng = Math.min(...all.map((p) => p.lng));
  let maxLng = Math.max(...all.map((p) => p.lng));

  // Avoid zero-range box when all points coincide.
  if (maxLat - minLat < 0.005) {
    minLat -= 0.05;
    maxLat += 0.05;
  }
  if (maxLng - minLng < 0.005) {
    minLng -= 0.05;
    maxLng += 0.05;
  }

  // Pad 12% so pins don't sit on the edge.
  const latPad = (maxLat - minLat) * 0.12;
  const lngPad = (maxLng - minLng) * 0.12;
  minLat -= latPad;
  maxLat += latPad;
  minLng -= lngPad;
  maxLng += lngPad;

  const project = (p: GeoPoint): PinPosition | null => {
    if (p.lat == null || p.lng == null) return null;
    const left = ((p.lng - minLng) / (maxLng - minLng)) * 100;
    // Higher latitude = further north = top of the visual map, so invert.
    const top = (1 - (p.lat - minLat) / (maxLat - minLat)) * 100;
    return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
  };

  return {
    origin: project(origin)!,
    points: points.map(project),
  };
}
