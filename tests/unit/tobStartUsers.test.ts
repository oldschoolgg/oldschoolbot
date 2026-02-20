import { describe, expect, it } from 'vitest';

import { resolveToBUsersForStart } from '../../src/mahoji/lib/abstracted_commands/tobCommand.js';

describe('resolveToBUsersForStart', () => {
	const leader = { id: '1' } as MUser;
	const partyUsers = [{ id: '1' }, { id: '2' }] as MUser[];

	it('uses exactly one real user for true solo', () => {
		const users = resolveToBUsersForStart(leader, 'solo');
		expect(users.map(u => u.id)).toEqual(['1']);
	});

	it('uses three internal entries for trio simulation', () => {
		const users = resolveToBUsersForStart(leader, 'trio');
		expect(users.map(u => u.id)).toEqual(['1', '1', '1']);
	});

	it('uses party users when not solo mode', () => {
		const users = resolveToBUsersForStart(leader, undefined, partyUsers);
		expect(users.map(u => u.id)).toEqual(['1', '2']);
	});
});
