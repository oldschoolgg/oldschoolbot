import { afterEach, expect, test, vi } from 'vitest';

import { formatDurationWithTimestamp } from '../src/util/datetime.js';
import { PerkTier } from '../src/util/misc.js';

afterEach(() => {
	vi.useRealTimers();
});

test('formatDurationWithTimestamp returns plain duration when timestamp setting is disabled', () => {
	expect(formatDurationWithTimestamp(30_000, PerkTier.Seven, true)).toBe('30 seconds');
});

test('formatDurationWithTimestamp returns plain duration for sub-tier-2 users', () => {
	expect(formatDurationWithTimestamp(30_000, PerkTier.One, false)).toBe('30 seconds');
});

test('formatDurationWithTimestamp includes return timestamp for tier-2+ users when enabled', () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

	expect(formatDurationWithTimestamp(90_000, PerkTier.Two, false)).toBe('<t:1735689690:R> (<t:1735689690:t>)');
});
