import { Bank } from 'oldschooljs';
import { describe, it } from 'vitest';

import { Gear } from '../../../src/lib/structures/Gear';
import { fishCommand } from '../../../src/mahoji/commands/fish';
import { testRunCmd } from '../utils';

describe('Fish Command', () => {
	it('should handle insufficient fishing level', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'trout', quantity: 1 },
			result: '<:minion:778418736180494347> Your minion needs 20 Fishing to fish Trout.'
		});
	});

	it('should handle insufficient QP', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'karambwanji', quantity: 1 },
			user: { skills_fishing: 9_999_999, QP: 0 },
			result: 'You need 15 qp to catch those!'
		});
	});

	it('should handle invalid fish', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'asdf' },
			result: 'Thats not a valid fish to catch.'
		});
	});

	it('should handle insufficient barb fishing levels', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'Barbarian fishing' },
			user: { skills_fishing: 1 },
			result: '<:minion:778418736180494347> Your minion needs 48 Fishing to fish Barbarian fishing.'
		});
	});

	it('should fish', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'shrimps' },
			result: "<:minion:778418736180494347> Your minion is now fishing 251x Shrimps, it'll take around 29 minutes, 58 seconds to finish."
		});
	});

	it('should catch insufficient feathers', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'Barbarian fishing' },
			user: {
				skills_fishing: 999_999,
				skills_agility: 999_999,
				skills_strength: 999_999,
				meleeGear: new Gear({ weapon: 'Pearl barbarian rod' })
			},
			result: 'You need Feather to fish Barbarian fishing!'
		});
	});

	it('should boost', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'Barbarian fishing' },
			user: {
				skills_fishing: 999_999,
				skills_agility: 999_999,
				skills_strength: 999_999,
				meleeGear: new Gear({ weapon: 'Pearl barbarian rod' }),
				bank: new Bank().add('Feather', 100)
			},
			result: `<:minion:778418736180494347> Your minion is now fishing 100x Barbarian fishing, it'll take around 6 minutes, 1 second to finish.

**Boosts:** 5% for Pearl barbarian rod.`
		});
	});

	it('should fish barrel boost', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'shrimps' },
			user: {
				skills_fishing: 999_999,
				meleeGear: new Gear({ cape: 'Fish sack barrel' })
			},
			result: `<:minion:778418736180494347> Your minion is now fishing 511x Shrimps, it'll take around 38 minutes, 56 seconds to finish.

**Boosts:** +9 trip minutes for having a Fish sack barrel.`
		});
	});

	it('should handle using flakes without flakes in bank', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'shrimps', flakes: true },
			user: {
				skills_fishing: 999_999
			},
			result: 'You need to have at least one spirit flake!'
		});
	});

	it('should fish with flakes', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'shrimps', flakes: true },
			user: {
				bank: new Bank({ 'Spirit flakes': 10000 })
			},
			result: `<:minion:778418736180494347> Your minion is now fishing 251x Shrimps, it'll take around 29 minutes, 58 seconds to finish.

**Boosts:** More fish from using 251x Spirit flakes.`
		});
	});

	it('should still use flakes if bank contains fewer flakes than fish quantity', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'shrimps', flakes: true },
			user: {
				bank: new Bank({ 'Spirit flakes': 100 })
			},
			result: `<:minion:778418736180494347> Your minion is now fishing 251x Shrimps, it'll take around 29 minutes, 58 seconds to finish.

**Boosts:** More fish from using 100x Spirit flakes.`
		});
	});
});
