import { EItem, EMonster, Items, itemID, Monsters } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { madAngelCL } from '@/lib/data/CollectionsExport.js';
import pets from '@/lib/data/pets.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { QuestID, quests } from '@/lib/minions/data/quests.js';

describe('Mad Angel', () => {
	test('items exist with their in-game IDs', () => {
		expect(itemID('Hallowfell')).toEqual(EItem.HALLOWFELL);
		expect(itemID('Jar of Light')).toEqual(EItem.JAR_OF_LIGHT);
		expect(itemID('Ardeaglais teleport')).toEqual(EItem.ARDEAGLAIS_TELEPORT);
		expect(itemID('Aggy')).toEqual(EItem.AGGY);
		expect(Items.getOrThrow('Hallowfell').equipment?.requirements).toEqual({ attack: 75 });
	});

	test('monster is killable and requires Fallen From Grace', () => {
		expect(Monsters.MadAngel.id).toEqual(EMonster.MAD_ANGEL);
		const killable = killableMonsters.find(m => m.id === EMonster.MAD_ANGEL);
		expect(killable).toBeDefined();
		expect(killable!.requiredQuests).toEqual([QuestID.FallenFromGrace]);
		expect(quests.find(q => q.id === QuestID.FallenFromGrace)?.qp).toEqual(2);
	});

	test('every kill drops 25-35 granite dust', () => {
		for (let i = 0; i < 500; i++) {
			const loot = Monsters.MadAngel.kill(1, {});
			const dust = loot.amount('Granite dust');
			expect(dust).toBeGreaterThanOrEqual(25);
			expect(dust).toBeLessThanOrEqual(35);
		}
	});

	test('collection log and pet', () => {
		expect(Monsters.MadAngel.allItems).toEqual(expect.arrayContaining(madAngelCL));
		const aggy = pets.find(p => p.name === 'Aggy');
		expect(aggy?.chance).toEqual(2000);
	});
});
