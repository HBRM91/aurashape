/**
 * UUIDv7 client-side IDs — time-ordered and globally unique.
 *
 * Replaces the `Date.now()` millisecond counters previously used in
 * src/stores/diary.ts and src/stores/workout.ts, which collide across
 * devices and after reinstall (two devices restart the counter from the
 * same clock) and are rejected outright by Postgres columns typed
 * `UUID PRIMARY KEY`. See docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md A2/FND-01.
 */

const HEX_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function generateId(): string {
  const timestamp = Date.now();
  const bytes = new Uint8Array(16);

  // Bytes 0-5: 48-bit big-endian Unix timestamp in milliseconds.
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Bytes 6-15: random, with the version/variant bits overlaid per RFC 9562.
  for (let i = 6; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * True for any ID that isn't a well-formed UUID — in practice, IDs from the
 * pre-UUIDv7 `String(Date.now() + counter)` scheme (plain decimal digit
 * strings). Used by persisted-state migrations to find records that predate
 * UUIDv7 adoption and need a fresh ID.
 */
export function isLegacyId(id: string): boolean {
  return !HEX_ID_PATTERN.test(id);
}
