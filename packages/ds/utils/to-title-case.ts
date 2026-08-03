/**
 * Title Case for display labels — first letter of each word uppercased.
 * Prop values stay raw; callers apply this only at render time.
 */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
