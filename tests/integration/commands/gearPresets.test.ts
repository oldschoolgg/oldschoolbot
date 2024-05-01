import { randInt } from 'e';
import { describe, expect, test, vi } from 'vitest';

import itemID from '../../../src/lib/util/itemID';
import { gearPresetsCommand } from '../../../src/mahoji/commands/gearpresets';
import { createTestUser } from '../util';

vi.mock('../../../src/lib/util', async () => {
	const actual: any = await vi.importActual('../../../src/lib/util');
	return {
		...actual,
		cryptoRand: (min: number, max: number) => randInt(min, max)
	};
});

describe('Gear Presets Command', async () => {
	const user = await createTestUser();

	test('Create preset with 2h', async () => {
		await user.runCommand(gearPresetsCommand, {
			create: {
				name: 'Test2h',
				'2h': 'Bronze 2h sword',
				weapon: 'Bronze dagger',
				shield: 'Bronze kiteshield',
				feet: 'Bronze boots',
				head: 'Bronze full helm'
			}
		});

		const gpResult = await global.prisma!.gearPreset.findFirst({ where: { user_id: user.id, name: 'test2h' } });
		// Verify row exists:
		expect(gpResult).toBeTruthy();
		if (!gpResult) return false;

		// Make sure row is as expected:
		expect(gpResult.head).toEqual(itemID('Bronze full helm'));
		expect(gpResult.feet).toEqual(itemID('Bronze boots'));
		expect(gpResult.weapon).toBeNull();
		expect(gpResult.shield).toBeNull();
		expect(gpResult.two_handed).toEqual(itemID('Bronze 2h sword'));
	});

	test('Test edit gearpreset', async () => {
		// Generate gearPreset to edit:
		await user.runCommand(gearPresetsCommand, {
			create: {
				name: 'TestEdit',
				weapon: 'Bronze dagger',
				shield: 'Bronze kiteshield',
				feet: 'Bronze boots',
				head: 'Bronze full helm'
			}
		});

		const gpResult = await global.prisma!.gearPreset.findFirst({ where: { user_id: user.id, name: 'testedit' } });
		// Verify row exists:
		expect(gpResult).toBeTruthy();
		if (!gpResult) return false;

		await user.runCommand(gearPresetsCommand, {
			edit: { gear_preset: 'TestEdit', weapon: 'Ghrazi rapier', feet: 'None' }
		});

		const gpEditResult = await global.prisma!.gearPreset.findFirst({
			where: { user_id: user.id, name: 'testedit' }
		});

		// Verify row found:
		expect(gpEditResult).toBeTruthy();
		if (!gpEditResult) return false;

		// Make sure row is as expected:
		expect(gpEditResult.head).toEqual(itemID('Bronze full helm'));
		expect(gpEditResult.feet).toBeNull();
		expect(gpEditResult.weapon).toEqual(itemID('Ghrazi rapier'));
		expect(gpEditResult.shield).toEqual(itemID('Bronze kiteshield'));
		expect(gpEditResult.hands).toBeNull();
		expect(gpEditResult.ammo).toBeNull();
	});
});
