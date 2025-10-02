import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';

import { type Item, Items, type Monster, Monsters } from 'oldschooljs';

import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { allSlayerTasks } from '@/lib/slayer/tasks/index.js';

interface SlayerMaskHelm {
	mask: Item;
	helm: Item;
	monsters: number[];
	slayerLevel: number;
	maskDropRate: number;
	killsRequiredForUpgrade: number;
}

function calculateDroprates(monster: Monster) {
	const task = allSlayerTasks.find(i => i.monsters.includes(monster.id));
	if (!task) throw new Error(`No slayer task found for ${monster.name}.`);
	const droprate = task.extendedAmount?.[1] ?? task.amount[1];
	return {
		killsRequiredForUpgrade: droprate * 5 * 2 * 2,
		maskDropRate: droprate * 2
	};
}

export const slayerMaskHelms: SlayerMaskHelm[] = [
	{
		mask: Items.getOrThrow('Dagannoth mask'),
		helm: Items.getOrThrow('Dagannoth slayer helm'),
		monsters: [
			Monsters.Dagannoth.id,
			Monsters.DagannothPrime.id,
			Monsters.DagannothRex.id,
			Monsters.DagannothSupreme.id
		],
		slayerLevel: 1,
		...calculateDroprates(Monsters.Dagannoth)
	},
	{
		mask: Items.getOrThrow('Jelly mask'),
		helm: Items.getOrThrow('Jelly slayer helm'),
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		slayerLevel: 52,
		...calculateDroprates(Monsters.Jelly)
	},
	{
		mask: Items.getOrThrow('Abyssal mask'),
		helm: Items.getOrThrow('Abyssal slayer helm'),
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		slayerLevel: 85,
		...calculateDroprates(Monsters.AbyssalDemon)
	},
	{
		mask: Items.getOrThrow('Black demonical mask'),
		helm: Items.getOrThrow('Black demonical slayer helm'),
		monsters: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		slayerLevel: 1,
		...calculateDroprates(Monsters.BlackDemon)
	},
	{
		mask: Items.getOrThrow('Troll mask'),
		helm: Items.getOrThrow('Troll slayer helm'),
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.ReanimatedTroll.id],
		slayerLevel: 1,
		...calculateDroprates(Monsters.MountainTroll)
	},
	{
		mask: Items.getOrThrow('Ganodermic mask'),
		helm: Items.getOrThrow('Ganodermic slayer helm'),
		monsters: [BSOMonsters.GanodermicBeast.id, BSOMonsters.GanodermicRunt.id],
		slayerLevel: 95,
		...calculateDroprates(Monsters.BlackDemon)
	},
	{
		mask: Items.getOrThrow('Gargoyle mask'),
		helm: Items.getOrThrow('Gargoyle slayer helm'),
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id, Monsters.MarbleGargoyle.id],
		slayerLevel: 75,
		...calculateDroprates(Monsters.Gargoyle)
	},
	{
		mask: Items.getOrThrow('Dark beast mask'),
		helm: Items.getOrThrow('Dark beast slayer helm'),
		monsters: [Monsters.DarkBeast.id],
		slayerLevel: 90,
		...calculateDroprates(Monsters.DarkBeast)
	},
	{
		mask: Items.getOrThrow('Dust devil mask'),
		helm: Items.getOrThrow('Dust devil slayer helm'),
		monsters: [Monsters.DustDevil.id],
		slayerLevel: 65,
		...calculateDroprates(Monsters.DustDevil)
	},
	{
		mask: Items.getOrThrow('Crawling hand mask'),
		helm: Items.getOrThrow('Crawling hand slayer helm'),
		monsters: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		...calculateDroprates(Monsters.CrawlingHand)
	},
	{
		mask: Items.getOrThrow('Basilisk mask'),
		helm: Items.getOrThrow('Basilisk slayer helm'),
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id, Monsters.BasiliskSentinel.id],
		slayerLevel: 40,
		...calculateDroprates(Monsters.Basilisk)
	},
	{
		mask: Items.getOrThrow('Bloodveld mask'),
		helm: Items.getOrThrow('Bloodveld slayer helm'),
		monsters: [
			Monsters.Bloodveld.id,
			Monsters.MutatedBloodveld.id,
			Monsters.InsatiableBloodveld.id,
			Monsters.ReanimatedBloodveld.id,
			Monsters.InsatiableMutatedBloodveld.id
		],
		slayerLevel: 50,
		...calculateDroprates(Monsters.Bloodveld)
	},
	{
		mask: Items.getOrThrow("Banshee's mask"),
		helm: Items.getOrThrow('Banshee slayer helm'),
		monsters: [
			Monsters.Banshee.id,
			Monsters.TwistedBanshee.id,
			Monsters.ScreamingBanshee.id,
			Monsters.ScreamingTwistedBanshee.id
		],
		slayerLevel: 15,
		...calculateDroprates(Monsters.Banshee)
	},
	{
		mask: Items.getOrThrow('Cockatrice mask'),
		helm: Items.getOrThrow('Cockatrice slayer helm'),
		monsters: [Monsters.Cockatrice.id, Monsters.Cockathrice.id],
		slayerLevel: 25,
		...calculateDroprates(Monsters.Cockatrice)
	},
	{
		mask: Items.getOrThrow('Aberrant mask'),
		helm: Items.getOrThrow('Aberrant slayer helm'),
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		slayerLevel: 60,
		...calculateDroprates(Monsters.AberrantSpectre)
	},
	{
		mask: Items.getOrThrow('Kurask mask'),
		helm: Items.getOrThrow('Kurask slayer helm'),
		monsters: [Monsters.Kurask.id],
		slayerLevel: 70,
		...calculateDroprates(Monsters.Kurask)
	}
];

const allPossibleSlayerMonsters = slayerMasters.map(i => i.tasks.map(t => t.monsters)).flat(3);

for (const mask of slayerMaskHelms) {
	if (!mask.monsters.some(monsterId => allPossibleSlayerMonsters.includes(monsterId))) {
		throw new Error(`\n\nMissing ${mask.mask.name} from slayerMasters\n\n`);
	}
}

export const slayerMasksHelmsCL = slayerMaskHelms.flatMap(i => [i.helm.id, i.mask.id]);
