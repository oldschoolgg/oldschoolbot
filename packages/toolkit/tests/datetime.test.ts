import { afterEach, expect, test, vi } from 'vitest';

import { formatDurationWithTimestamp, parseDuration, Time } from '../src/util/datetime.js';
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

test('parseDuration parses compact duration strings', () => {
	expect(parseDuration('1d')).toBe(Time.Day);
	expect(parseDuration('7d')).toBe(Time.Day * 7);
	expect(parseDuration('30s')).toBe(Time.Second * 30);
	expect(parseDuration('12h')).toBe(Time.Hour * 12);
	expect(parseDuration('1y')).toBe(Time.Year);
	expect(parseDuration('1mo')).toBe(Time.Month);
	expect(parseDuration('1m')).toBe(Time.Minute);
	expect(parseDuration('1ms')).toBe(Time.Millisecond);
	expect(parseDuration('1w')).toBe(Time.Week);
});

test('parseDuration supports negative and chained durations', () => {
	expect(parseDuration('-1d')).toBe(-Time.Day);
	expect(parseDuration('1h30m')).toBe(Time.Hour + Time.Minute * 30);
	expect(parseDuration('1 day 30 seconds')).toBe(Time.Day + Time.Second * 30);
});

test('parseDuration returns zero for invalid input', () => {
	expect(parseDuration('')).toBe(0);
	expect(parseDuration('abc')).toBe(0);
	expect(parseDuration('1')).toBe(0);
	expect(parseDuration('1q')).toBe(0);
});
