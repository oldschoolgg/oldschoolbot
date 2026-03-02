import { describe, expect, test } from 'vitest';

import { formatGitSyncStatus } from '@/lib/constants.js';

describe('formatGitSyncStatus', () => {
	test('renders up-to-date status', () => {
		expect(formatGitSyncStatus(0, 0, 'origin/master')).toBe('Up to date with `origin/master`');
	});

	test('renders behind status', () => {
		expect(formatGitSyncStatus(1, 0, 'origin/master')).toBe('Behind `origin/master` by 1 commit');
		expect(formatGitSyncStatus(3, 0, 'origin/master')).toBe('Behind `origin/master` by 3 commits');
	});

	test('renders ahead status', () => {
		expect(formatGitSyncStatus(0, 1, 'origin/master')).toBe('Ahead of `origin/master` by 1 commit');
		expect(formatGitSyncStatus(0, 2, 'origin/master')).toBe('Ahead of `origin/master` by 2 commits');
	});

	test('renders diverged status', () => {
		expect(formatGitSyncStatus(2, 5, 'origin/master')).toBe('Diverged from `origin/master` (ahead 5, behind 2)');
	});
});
