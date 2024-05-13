import { Monsters } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';

import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import { slayerMasters } from '../slayer/slayerMasters';
import { allSlayerTasks } from '../slayer/tasks';
import getOSItem from '../util/getOSItem';

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
		mask: getOSItem('Dagannoth mask'),
		helm: getOSItem('Dagannoth slayer helm'),
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
		mask: getOSItem('Jelly mask'),
		helm: getOSItem('Jelly slayer helm'),
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		slayerLevel: 52,
		...calculateDroprates(Monsters.Jelly)
	},
	{
		mask: getOSItem('Abyssal mask'),
		helm: getOSItem('Abyssal slayer helm'),
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		slayerLevel: 85,
		...calculateDroprates(Monsters.AbyssalDemon)
	},
	{
		mask: getOSItem('Black demonical mask'),
		helm: getOSItem('Black demonical slayer helm'),
		monsters: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		slayerLevel: 1,
		...calculateDroprates(Monsters.BlackDemon)
	},
	{
		mask: getOSItem('Troll mask'),
		helm: getOSItem('Troll slayer helm'),
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.ReanimatedTroll.id],
		slayerLevel: 1,
		...calculateDroprates(Monsters.MountainTroll)
	},
	{
		mask: getOSItem('Ganodermic mask'),
		helm: getOSItem('Ganodermic slayer helm'),
		monsters: [BSOMonsters.GanodermicBeast.id, BSOMonsters.GanodermicRunt.id],
		slayerLevel: 95,
		...calculateDroprates(Monsters.BlackDemon)
	},
	{
		mask: getOSItem('Gargoyle mask'),
		helm: getOSItem('Gargoyle slayer helm'),
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id, Monsters.MarbleGargoyle.id],
		slayerLevel: 75,
		...calculateDroprates(Monsters.Gargoyle)
	},
	{
		mask: getOSItem('Dark beast mask'),
		helm: getOSItem('Dark beast slayer helm'),
		monsters: [Monsters.DarkBeast.id],
		slayerLevel: 90,
		...calculateDroprates(Monsters.DarkBeast)
	},
	{
		mask: getOSItem('Dust devil mask'),
		helm: getOSItem('Dust devil slayer helm'),
		monsters: [Monsters.DustDevil.id],
		slayerLevel: 65,
		...calculateDroprates(Monsters.DustDevil)
	},
	{
		mask: getOSItem('Crawling hand mask'),
		helm: getOSItem('Crawling hand slayer helm'),
		monsters: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		...calculateDroprates(Monsters.CrawlingHand)
	},
	{
		mask: getOSItem('Basilisk mask'),
		helm: getOSItem('Basilisk slayer helm'),
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id, Monsters.BasiliskSentinel.id],
		slayerLevel: 40,
		...calculateDroprates(Monsters.Basilisk)
	},
	{
		mask: getOSItem('Bloodveld mask'),
		helm: getOSItem('Bloodveld slayer helm'),
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
		mask: getOSItem("Banshee's mask"),
		helm: getOSItem('Banshee slayer helm'),
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
		mask: getOSItem('Cockatrice mask'),
		helm: getOSItem('Cockatrice slayer helm'),
		monsters: [Monsters.Cockatrice.id, Monsters.Cockathrice.id],
		slayerLevel: 25,
		...calculateDroprates(Monsters.Cockatrice)
	},
	{
		mask: getOSItem('Aberrant mask'),
		helm: getOSItem('Aberrant slayer helm'),
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		slayerLevel: 60,
		...calculateDroprates(Monsters.AberrantSpectre)
	},
	{
		mask: getOSItem('Kurask mask'),
		helm: getOSItem('Kurask slayer helm'),
		monsters: [Monsters.Kurask.id],
		slayerLevel: 70,
		...calculateDroprates(Monsters.Kurask)
	}
];

const allPossibleSlayerMonster = slayerMasters.map(i => i.tasks.map(t => t.monsters)).flat(3);

for (const a of slayerMaskHelms) {
	if (!a.monsters.some(m => allPossibleSlayerMonster.includes(m))) {
		throw new Error(`\n\nMissing ${a.mask.name} from slayerMasters\n\n`);
	}
}

export const slayerMasksHelmsCL = slayerMaskHelms.map(i => [i.helm.id, i.mask.id]).flat();
