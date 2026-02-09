import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { MAX_CLUES_DROPPED } from '@/lib/constants.js';

const clueTurtleXP = 50;

const oceanManDrinks = [
	'Short green guy',
	'Blurberry special',
	'Fruit blast',
	'Pineapple punch',
	'Drunk dragon',
	'Choc saturday',
	'Wizard blizzard'
];

const mysteriousGlowGems = [
	'Uncut opal',
	'Uncut sapphire',
	'Uncut emerald',
	'Uncut ruby',
	'Uncut diamond',
	'Uncut red topaz',
	'Uncut dragonstone'
];

const giantClamPearls = [
	{ name: 'Tiny pearl', min: 1, max: 199 },
	{ name: 'Small pearl', min: 202, max: 996 },
	{ name: 'Shiny pearl', min: 1005, max: 1920 },
	{ name: 'Bright pearl', min: 2040, max: 4800 },
	{ name: 'Big pearl', min: 5400, max: 9984 },
	{ name: 'Huge pearl', min: 10_200, max: 19_200 },
	{ name: 'Enormous pearl', min: 21_120, max: 49_800 },
	{ name: 'Shimmering pearl', min: 50_000, max: 96_000 },
	{ name: 'Glistening pearl', min: 112_500, max: 180_000 },
	{ name: 'Brilliant pearl', min: 240_000, max: 480_000 },
	{ name: 'Radiant pearl', min: 540_000, max: null }
];

const lostCaskets = [
	{ id: 'Lost casket (beginner)', xp: 25, minLevel: 1 },
	{ id: 'Lost casket (easy)', xp: 50, minLevel: 5 },
	{ id: 'Lost casket (medium)', xp: 150, minLevel: 30 },
	{ id: 'Lost casket (hard)', xp: 235, minLevel: 50 },
	{ id: 'Lost casket (elite)', xp: 335, minLevel: 70 },
	// TODO: OSRS wiki does not state a min level for master caskets.
	{ id: 'Lost casket (master)', xp: 450, minLevel: 90 }
];

const lostCrates = [
	{ id: 'Lost wooden crate', xp: 25, minLevel: 5 },
	{ id: 'Lost oak crate', xp: 50, minLevel: 26 },
	{ id: 'Lost teak crate', xp: 150, minLevel: 51 },
	{ id: 'Lost mahogany crate', xp: 235, minLevel: 71 },
	{ id: 'Lost camphor crate', xp: 335, minLevel: 86 },
	{ id: 'Lost ironwood crate', xp: 450, minLevel: 95 }
];

function getClueTierForLevel(level: number, rng: RNGProvider) {
	if (level < 5) return null;
	if (level < 30) return ClueTiers.find(t => t.name === 'Easy')!;
	if (level < 50) {
		const roll = rng.randInt(1, 20);
		return roll <= 8 ? ClueTiers.find(t => t.name === 'Easy')! : ClueTiers.find(t => t.name === 'Medium')!;
	}
	if (level < 70) {
		const roll = rng.randInt(1, 20);
		if (roll <= 9) return ClueTiers.find(t => t.name === 'Easy')!;
		if (roll <= 15) return ClueTiers.find(t => t.name === 'Medium')!;
		return ClueTiers.find(t => t.name === 'Hard')!;
	}
	const roll = rng.randInt(1, 20);
	if (roll <= 9) return ClueTiers.find(t => t.name === 'Easy')!;
	if (roll <= 15) return ClueTiers.find(t => t.name === 'Medium')!;
	if (roll <= 18) return ClueTiers.find(t => t.name === 'Hard')!;
	return ClueTiers.find(t => t.name === 'Elite')!;
}

function getMysteriousGlowMaxXP(level: number): number | null {
	if (level <= 8) return null;
	if (level <= 23) return 64;
	if (level <= 40) return 64;
	if (level <= 60) return 128;
	if (level <= 70) return 256;
	if (level <= 80) return 512;
	if (level <= 90) return 1024;
	return 2048;
}

function getPearlForHighAlch(highAlchValue: number) {
	if (highAlchValue <= 0) return giantClamPearls[0].name;
	let fallback = giantClamPearls[0].name;
	for (const pearl of giantClamPearls) {
		if (highAlchValue >= pearl.min && (pearl.max === null || highAlchValue <= pearl.max)) {
			return pearl.name;
		}
		if (highAlchValue >= pearl.min) fallback = pearl.name;
	}
	return fallback;
}

function chooseEncounterPool(level: number) {
	const pool: Array<
		'clue_turtle' | 'castaway' | 'lost_casket' | 'lost_shipment' | 'mysterious_glow' | 'ocean_man' | 'giant_clam'
	> = ['castaway', 'ocean_man'];

	if (level >= 5) {
		pool.push('clue_turtle', 'lost_shipment', 'lost_casket');
	}
	if (level >= 9) {
		pool.push('mysterious_glow');
	}
	if (level >= 40) {
		pool.push('giant_clam');
	}

	// TODO: Strong winds encounter requires more details on XP/behavior.

	return pool;
}

export function rollOceanEncounters({
	duration,
	sailingLevel,
	clamItemId,
	user,
	rng
}: {
	duration: number;
	sailingLevel: number;
	clamItemId?: number | null;
	user: MUser;
	rng: RNGProvider;
}) {
	let encounters = 0;
	let timeLeft = duration;
	while (timeLeft > 0) {
		const interval = rng.randInt(5, 10) * Time.Minute;
		timeLeft -= interval;
		if (timeLeft >= 0) encounters++;
	}

	// TODO: Add +4% encounter rate for kraken ink stout keg when keg mechanics exist.

	const pool = chooseEncounterPool(sailingLevel);
	const loot = new Bank();
	const messages: string[] = [];
	let xp = 0;
	let clamConsumed = false;

	for (let i = 0; i < encounters; i++) {
		const encounter = pool[rng.randInt(0, pool.length - 1)];
		switch (encounter) {
			case 'clue_turtle': {
				xp += clueTurtleXP;
				const clueTier = getClueTierForLevel(sailingLevel, rng);
				if (!clueTier) break;
				const clueStack = ClueTiers.reduce((acc, tier) => acc + user.bank.amount(tier.scrollID), 0);
				if (clueStack >= MAX_CLUES_DROPPED) {
					messages.push('A clue turtle appeared, but you are at the maximum clue stack.');
					break;
				}
				// TODO: Replace with scroll boxes once X Marks the Spot quest is modeled.
				loot.add(clueTier.scrollID);
				messages.push(`Clue turtle: ${clueTier.name} clue scroll.`);
				break;
			}
			case 'castaway': {
				const castawayXP = sailingLevel * 15;
				xp += castawayXP;
				messages.push(`Castaway rescued: ${castawayXP} Sailing XP.`);
				break;
			}
			case 'lost_casket': {
				const eligible = lostCaskets.filter(c => sailingLevel >= c.minLevel);
				const chosen = eligible[rng.randInt(0, eligible.length - 1)];
				loot.add(chosen.id);
				xp += chosen.xp;
				messages.push(`Found ${chosen.id}.`);
				break;
			}
			case 'lost_shipment': {
				const eligible = lostCrates.filter(c => sailingLevel >= c.minLevel);
				const chosen = eligible[rng.randInt(0, eligible.length - 1)];
				loot.add(chosen.id);
				xp += chosen.xp;
				messages.push(`Recovered ${chosen.id}.`);
				break;
			}
			case 'mysterious_glow': {
				const maxGlowXP = getMysteriousGlowMaxXP(sailingLevel);
				if (!maxGlowXP) break;
				let glowXP = 8;
				let totalGlowXP = 0;
				while (glowXP <= maxGlowXP) {
					totalGlowXP += glowXP;
					glowXP *= 2;
				}
				xp += totalGlowXP;
				// TODO: Rarity is unknown; select a gem uniformly from the known list.
				loot.add(mysteriousGlowGems[rng.randInt(0, mysteriousGlowGems.length - 1)]);
				messages.push(`Mysterious glow chain: ${totalGlowXP} Sailing XP.`);
				break;
			}
			case 'ocean_man': {
				const drink = oceanManDrinks[rng.randInt(0, oceanManDrinks.length - 1)];
				loot.add(drink);
				messages.push(`Ocean Man gave you a ${drink}.`);
				break;
			}
			case 'giant_clam': {
				if (!clamItemId) {
					messages.push('A giant clam appeared, but you have not fed it an item yet.');
					break;
				}
				const item = Items.get(clamItemId);
				const highAlch = item?.highalch ?? (item?.cost ? Math.floor(item.cost * 0.6) : 0);
				const pearl = getPearlForHighAlch(highAlch);
				loot.add(pearl);
				const clamXP = sailingLevel * 15;
				xp += clamXP;
				clamConsumed = true;
				messages.push(`Giant clam polished your ${item?.name ?? 'item'} into a ${pearl}.`);
				break;
			}
		}
	}

	return { loot, xp, messages, encounters, clamConsumed };
}
