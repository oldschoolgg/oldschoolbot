import { Bank } from 'oldschooljs';
import { describe, it } from 'vitest';

import { Gear } from '../../../src/lib/structures/Gear';
import { fishCommand } from '../../../src/mahoji/commands/fish';
import { testRunCmd } from '../utils';

describe('Fish Command', () => {
	it('should handle insufficient fishing level', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'Trout/Salmon', quantity: 1 },
			result: '<:minion:778418736180494347> Your minion needs 20 Fishing to fish Trout/Salmon.'
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
			opts: { name: 'Shrimps/Anchovies' },
			result: "<:minion:778418736180494347> Your minion is now fishing Shrimps/Anchovies, it'll take 30 minutes, 1 second to finish."
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
				bank: new Bank().add('Feather', 1000)
			},
			result: `<:minion:778418736180494347> Your minion is now fishing Barbarian fishing, it'll take 30 minutes, 3 seconds to finish.`
		});
	});

	it('should fish barrel boost', () => {
		testRunCmd({
			cmd: fishCommand,
			opts: { name: 'Shrimps/Anchovies' },
			user: {
				skills_fishing: 999_999,
				meleeGear: new Gear({ cape: 'Fish sack barrel' })
			},
			result: `<:minion:778418736180494347> Your minion is now fishing Shrimps/Anchovies, it'll take around 39 minutes, 1 second to finish.

  **Boosts:** +9 trip minutes and +28 inventory slots for having a Fish sack barrel.`
		});
	});
});
