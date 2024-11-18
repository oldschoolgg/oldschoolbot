import { Bank, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { mockMUser } from './userutil';

const testUser = mockMUser({
	skills_agility: convertLVLtoXP(50),
	GP: 100_000,
	bank: new Bank().add('Coal').add('Egg'),
	cl: new Bank().add('Coal')
});

const bankWithGP = new Bank().add('Coal').add('Egg').add('Coins', 100_000).freeze();

describe('MUser.test', () => {
	test('hasSkillReqs', () => {
		expect(testUser.hasSkillReqs({ agility: 49 })).toEqual(true);
		expect(testUser.hasSkillReqs({ agility: 50 })).toEqual(true);
		expect(testUser.hasSkillReqs({ agility: 51 })).toEqual(false);
		expect(testUser.hasSkillReqs({ agility: 50, attack: 99 })).toEqual(false);
	});
	test('skillsAsLevels', () => {
		expect(testUser.skillsAsLevels).toEqual({
			agility: 50,
			attack: 1,
			construction: 1,
			cooking: 1,
			crafting: 1,
			defence: 1,
			farming: 1,
			firemaking: 1,
			fishing: 1,
			fletching: 1,
			herblore: 1,
			hitpoints: 10,
			hunter: 1,
			magic: 1,
			mining: 1,
			prayer: 1,
			ranged: 1,
			runecraft: 1,
			slayer: 1,
			smithing: 1,
			strength: 1,
			thieving: 1,
			woodcutting: 1
		});
	});
	test('bankWithGP', () => {
		expect(testUser.bankWithGP.equals(bankWithGP)).toEqual(true);
	});
	test('combatLevel', () => {
		expect(testUser.combatLevel).toEqual(3);
	});
	test('owns', () => {
		const shouldOwn = [new Bank().add('Coal'), bankWithGP];
		for (const b of shouldOwn) {
			expect(testUser.owns(b)).toEqual(true);
		}
		const shouldntOwn = [new Bank().add('Twisted bow'), new Bank().add('Coal').add('Egg').add('Coins', 100_001)];
		for (const b of shouldntOwn) {
			expect(testUser.owns(b)).toEqual(false);
		}
	});
	test('cl', () => {
		expect(testUser.cl.has('Coal')).toEqual(true);
		expect(testUser.cl.length).toEqual(1);
	});
});
