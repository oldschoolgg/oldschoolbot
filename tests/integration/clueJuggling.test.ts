import type { InteractionReplyOptions } from 'discord.js';
import { EItem, EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { clueCommand } from '../../src/mahoji/commands/clue';
import { createTestUser, mockClient } from './util';

describe('Clue Juggling', async () => {
	await mockClient();
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
				user_id: user.id,
				used: false
			}
		});
		expect(droppedClues.length).toBeGreaterThan(0);
		const cmdResult = (await user.runCommand(clueCommand, {
			tier: 'beginner'
		})) as InteractionReplyOptions;
		expect(cmdResult.content).toContain('is now completing ');
		expect(cmdResult.content).not.toContain('is now completing 1x');
		expect(
			await prisma.droppedClueScroll.count({
				where: {
					user_id: user.id,
					used: false
				}
			})
		).toBeLessThan(droppedClues.length);
	});
});
