import { format } from "date-fns";

/** Today's date as yyyy-MM-dd in the viewer's timezone (for <input type="date">). */
export const todayISO = () => format(new Date(), "yyyy-MM-dd");

/** Earliest planting date the forms accept. */
export const MIN_PLANTED_DATE = "2000-01-01";

export const isValidLatLng = (lat: number, lng: number) =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

/** Rough bounding box of Uganda, used only to warn about likely typos. */
export const isInUganda = (lat: number, lng: number) => lat >= -1.6 && lat <= 4.3 && lng >= 29.4 && lng <= 35.1;

/** Parses one coordinate typed by hand, e.g. "0.3497", "0.3497°", "-0.35". */
export const parseCoordinate = (text: string): number | null => {
  const cleaned = text.trim().replace(/[°\s]/g, "");
  if (!cleaned || !/^[-+]?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
};

/**
 * Parses a pasted "lat, lng" pair, as copied from Google Maps
 * (e.g. "0.3497, 32.6300" or "0.3497 32.6300"). Returns null if it isn't a pair.
 */
export const parseCoordinatePair = (text: string): { lat: number; lng: number } | null => {
  const match = text.trim().match(/^([-+]?\d+(?:\.\d+)?)°?\s*[,;\s]\s*([-+]?\d+(?:\.\d+)?)°?$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
};

/** Validates a planting date string from a date input. Returns an error message or null. */
export const plantedDateError = (value: string): string | null => {
  if (!value) return "Choose the date the tree was planted.";
  if (value > todayISO()) return "The planting date can't be in the future.";
  if (value < MIN_PLANTED_DATE) return "Please check the planting date.";
  return null;
};
