import { afterEach, expect, test, vi } from 'vitest';

import { formatDurationWithTimestamp } from '../src/util/datetime.js';
import { PerkTier } from '../src/util/misc.js';

afterEach(() => {
	vi.useRealTimers();
});

test('formatDurationWithTimestamp returns plain duration when timestamp setting is disabled', () => {
	expect(formatDurationWithTimestamp(30_000, PerkTier.Seven, false)).toBe('30 seconds');
});

test('formatDurationWithTimestamp returns plain duration for sub-tier-4 users', () => {
	expect(formatDurationWithTimestamp(30_000, PerkTier.Three, true)).toBe('30 seconds');
});

test('formatDurationWithTimestamp includes return timestamp for tier-4+ users when enabled', () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

	expect(formatDurationWithTimestamp(90_000, PerkTier.Four, true)).toBe('1 minute, 30 seconds (<t:1735689690:t>)');
});
