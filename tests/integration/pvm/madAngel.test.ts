import { Bank, EItem, EMonster, resolveItems } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { QuestID } from '@/lib/minions/data/quests.js';
import { activitiesCommand } from '@/mahoji/commands/activities.js';
import { mockClient } from '../util.js';

const supplies = () => new Bank().add('Shark', 1000).add('Prayer potion(4)', 100).add('Super combat potion(4)', 100);

describe('Mad Angel', async () => {
	const client = await mockClient();

	it('requires Fallen From Grace', async () => {
		const user = await client.mockUser({ maxed: true, bank: supplies() });

		const res = await user.kill(EMonster.MAD_ANGEL, { quantity: 1, shouldFail: true });
		expect(res.commandResult).toContain('Fallen From Grace');
		expect(res.newKC).toEqual(0);
	});

	it('requires the Fallen From Grace skill levels to start the quest', async () => {
		const user = await client.mockUser({ levels: { crafting: 59, mining: 53, runecraft: 47 } });

		const res = await user.runCmdAndTrip(activitiesCommand, { quest: { name: 'Fallen From Grace' } });
		expect(res.commandResult).toContain('To complete Fallen From Grace, you need');
		expect(res.activityResult).toBeNull();
		expect(user.user.finished_quest_ids).not.toContain(QuestID.FallenFromGrace);
	});

	it('completes Fallen From Grace and gives its rewards', async () => {
		const user = await client.mockUser({ levels: { crafting: 60, mining: 53, runecraft: 47 }, QP: 10 });
		const craftingXP = user.skillsAsXP.crafting;

		const res = await user.runCmdAndTrip(activitiesCommand, { quest: { name: 'Fallen From Grace' } });
		expect(res.commandResult).toContain('is now completing Fallen From Grace');
		expect(user.user.finished_quest_ids).toContain(QuestID.FallenFromGrace);
		expect(user.QP).toEqual(12);
		expect(user.skillsAsXP.crafting - craftingXP).toEqual(10_000);
	});

	it('kills the Mad Angel with the quest done', async () => {
		const user = await client.mockUser({
			maxed: true,
			bank: supplies(),
			meleeGear: resolveItems(['Granite hammer', 'Amulet of rancour', 'Infernal cape', 'Ferocious gloves'])
		});
		await user.update({ finished_quest_ids: [QuestID.FallenFromGrace] });

		const res = await user.kill(EMonster.MAD_ANGEL, { quantity: 10 });
		expect(res.commandResult).toContain('is now killing 10x Mad Angel');
		expect(res.commandResult).toContain('15% for Granite hammer');
		expect(res.commandResult).toContain('4% for Amulet of rancour');
		expect(res.newKC).toEqual(10);

		const dust = user.bank.amount('Granite dust');
		expect(dust).toBeGreaterThanOrEqual(250);
		expect(dust).toBeLessThanOrEqual(350);
		expect(user.cl.amount('Granite dust')).toEqual(dust);

		expect(res.previousBank.amount('Prayer potion(4)') - res.tripStartBank.amount('Prayer potion(4)')).toBe(5);
		expect(
			res.previousBank.amount('Super combat potion(4)') - res.tripStartBank.amount('Super combat potion(4)')
		).toBeGreaterThan(0);
	});

	it('requires 43 Prayer', async () => {
		const user = await client.mockUser({ maxed: true, bank: supplies() });
		await user.update({ finished_quest_ids: [QuestID.FallenFromGrace], skills_prayer: 0 });

		const res = await user.kill(EMonster.MAD_ANGEL, { quantity: 1, shouldFail: true });
		expect(res.commandResult).toContain("You don't meet the skill requirements to kill Mad Angel");
		expect(res.commandResult).toContain('**43** Prayer');
		expect(res.newKC).toEqual(0);
	});

	it('records completing the Mad Angel collection log', async () => {
		const user = await client.mockUser({});
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: new Bank().add('Hallowfell').add('Ardeaglais teleport').add('Granite dust').add('Jar of Light')
		});
		await user.transactItems({ collectionLog: true, itemsToAdd: new Bank().add('Aggy') });

		const events = await prisma.userEvent.findMany({ where: { user_id: user.id, type: 'CLCompletion' } });
		expect(events.map(e => e.collection_log_name)).toContain('mad angel');
	});

	it('runs full-length trips and drops the Ardeaglais teleport', async () => {
		const user = await client.mockUser({ maxed: true, bank: supplies() });
		await user.update({ finished_quest_ids: [QuestID.FallenFromGrace] });

		for (let i = 0; i < 6; i++) {
			await user.kill(EMonster.MAD_ANGEL);
		}
		// 1/25 per kill, so over 150+ kills a teleport is all but certain
		expect(await user.getKC(EMonster.MAD_ANGEL)).toBeGreaterThan(150);
		expect(user.cl.amount(EItem.ARDEAGLAIS_TELEPORT)).toBeGreaterThan(0);
	});
});
