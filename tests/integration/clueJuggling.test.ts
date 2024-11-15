import { EItem, EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { clueCommand } from '../../src/mahoji/commands/clue';
import { createTestUser } from './util';

describe('Clue Juggling', async () => {
	it('general test', async () => {
		const user = await createTestUser();
		await user.equip('melee', [
			EItem.PRIMORDIAL_BOOTS,
			EItem.INFERNAL_MAX_CAPE,
			EItem.FEROCIOUS_GLOVES,
			EItem.AMULET_OF_TORTURE,
			EItem.INQUISITORS_MACE,
			EItem.INQUISITORS_HAUBERK,
			EItem.INQUISITORS_PLATESKIRT
		]);
		expect(user.bank.amount(EItem.CLUE_SCROLL_BEGINNER)).toBe(0);
		expect(user.bank.amount(EItem.CLUE_SCROLL_EASY)).toBe(0);
		await user.kill(EMonster.MAN);
		await user.kill(EMonster.MAN);

		expect(user.bank.amount(EItem.CLUE_SCROLL_BEGINNER)).toEqual(1);
		expect(user.bank.amount(EItem.CLUE_SCROLL_EASY)).toEqual(1);

		const droppedClues = await prisma.droppedClueScroll.findMany({
			where: {
				user_id: user.id
			}
		});
		expect(droppedClues.length).toBeGreaterThan(0);
		const cmdResult = await user.runCommand(clueCommand, {
			tier: 'beginner'
		});
		expect(cmdResult).toContain('is now completing ');
		expect(cmdResult).not.toContain('is now completing 1x');
		expect(user.bank.amount(EItem.CLUE_SCROLL_BEGINNER)).toEqual(0);
	});
});
