import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';

import { type Item, Items, Monsters } from 'oldschooljs';

import { slayerMaskLeaderboardCache } from '@/lib/cache.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';

interface SlayerMaskHelm {
	mask: Item;
	helm: Item;
	monsters: number[];
	slayerLevel: number;
	maskDropRate: number;
	killsRequiredForUpgrade: number;
}

const defaultMaskDropRate = 340;
const defaultKillsRequiredForUpgrade = 3400;

function maskRates({
	maskDropRate = defaultMaskDropRate,
	killsRequiredForUpgrade = defaultKillsRequiredForUpgrade
}: {
	maskDropRate?: number;
	killsRequiredForUpgrade?: number;
} = {}) {
	return { maskDropRate, killsRequiredForUpgrade };
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
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Jelly mask'),
		helm: Items.getOrThrow('Jelly slayer helm'),
		monsters: [Monsters.Jelly.id, Monsters.WarpedJelly.id],
		slayerLevel: 52,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Abyssal mask'),
		helm: Items.getOrThrow('Abyssal slayer helm'),
		monsters: [Monsters.AbyssalDemon.id, Monsters.AbyssalSire.id],
		slayerLevel: 85,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Black demonical mask'),
		helm: Items.getOrThrow('Black demonical slayer helm'),
		monsters: [Monsters.BlackDemon.id, Monsters.Skotizo.id],
		slayerLevel: 1,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Troll mask'),
		helm: Items.getOrThrow('Troll slayer helm'),
		monsters: [Monsters.MountainTroll.id, Monsters.IceTroll.id, Monsters.ReanimatedTroll.id],
		slayerLevel: 1,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Ganodermic mask'),
		helm: Items.getOrThrow('Ganodermic slayer helm'),
		monsters: [EBSOMonster.GANODERMIC_BEAST, EBSOMonster.GANODERMIC_RUNT],
		slayerLevel: 95,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Gargoyle mask'),
		helm: Items.getOrThrow('Gargoyle slayer helm'),
		monsters: [Monsters.Gargoyle.id, Monsters.GrotesqueGuardians.id, Monsters.MarbleGargoyle.id],
		slayerLevel: 75,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Dark beast mask'),
		helm: Items.getOrThrow('Dark beast slayer helm'),
		monsters: [Monsters.DarkBeast.id],
		slayerLevel: 90,
		...maskRates({ maskDropRate: 300, killsRequiredForUpgrade: 3000 })
	},
	{
		mask: Items.getOrThrow('Dust devil mask'),
		helm: Items.getOrThrow('Dust devil slayer helm'),
		monsters: [Monsters.DustDevil.id],
		slayerLevel: 65,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Crawling hand mask'),
		helm: Items.getOrThrow('Crawling hand slayer helm'),
		monsters: [Monsters.CrawlingHand.id],
		slayerLevel: 5,
		...maskRates({ maskDropRate: 140, killsRequiredForUpgrade: 1400 })
	},
	{
		mask: Items.getOrThrow('Basilisk mask'),
		helm: Items.getOrThrow('Basilisk slayer helm'),
		monsters: [Monsters.Basilisk.id, Monsters.BasiliskKnight.id, Monsters.BasiliskSentinel.id],
		slayerLevel: 40,
		...maskRates()
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
		...maskRates()
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
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Cockatrice mask'),
		helm: Items.getOrThrow('Cockatrice slayer helm'),
		monsters: [Monsters.Cockatrice.id, Monsters.Cockathrice.id],
		slayerLevel: 25,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Aberrant mask'),
		helm: Items.getOrThrow('Aberrant slayer helm'),
		monsters: [Monsters.AberrantSpectre.id, Monsters.DeviantSpectre.id],
		slayerLevel: 60,
		...maskRates()
	},
	{
		mask: Items.getOrThrow('Kurask mask'),
		helm: Items.getOrThrow('Kurask slayer helm'),
		monsters: [Monsters.Kurask.id],
		slayerLevel: 70,
		...maskRates()
	}
];

const allPossibleSlayerMonsters = slayerMasters.map(i => i.tasks.map(t => t.monsters)).flat(3);

for (const mask of slayerMaskHelms) {
	if (!mask.monsters.some(monsterId => allPossibleSlayerMonsters.includes(monsterId))) {
		throw new Error(`\n\nMissing ${mask.mask.name} from slayerMasters\n\n`);
	}
}

export const slayerMasksHelmsCL: number[] = slayerMaskHelms.flatMap(i => [i.helm.id, i.mask.id]);
const allSpecialSlayerHelms: Set<number> = new Set(slayerMaskHelms.map(i => i.helm.id));

export function handleSlayerMaskGlow({
	itemID,
	user,
	glow
}: {
	itemID: number;
	user: MUser | undefined | null;
	glow:
		| {
				color: string;
				radius: number;
				blur: number;
		  }
		| undefined;
}):
	| {
			color: string;
			radius: number;
			blur: number;
	  }
	| undefined {
	if (!user) return glow;
	if (!allSpecialSlayerHelms.has(itemID)) return glow;
	if (slayerMaskLeaderboardCache.get(itemID) !== user.id) return glow;

	return {
		color: OSRSCanvas.COLORS.PURPLE,
		radius: 12,
		blur: 16
	};
}
