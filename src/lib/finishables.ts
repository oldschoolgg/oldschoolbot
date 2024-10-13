import { stringMatches } from '@oldschoolgg/toolkit/util';
import { notEmpty, randArrItem, roll } from 'e';
import {
	Bank,
	BeginnerCasket,
	ChambersOfXeric,
	EasyCasket,
	EliteCasket,
	EliteMimicTable,
	HardCasket,
	MasterCasket,
	MasterMimicTable,
	MediumCasket,
	Monsters,
	Nightmare,
	resolveItems
} from 'oldschooljs';

import { allCollectionLogsFlat } from './data/Collections';
import {
	NexCL,
	chambersOfXericCL,
	chambersOfXericNormalCL,
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesHardCL,
	cluesMasterCL,
	cluesMediumCL,
	evilChickenOutfit,
	temporossCL,
	theGauntletCL,
	theNightmareCL,
	theNightmareNormalCL,
	theatreOfBLoodCL,
	theatreOfBLoodNormalCL,
	wintertodtCL
} from './data/CollectionsExport';
import pets from './data/pets';
import killableMonsters from './minions/data/killableMonsters';
import { openShadeChest } from './shadesKeys';
import { birdsNestID, treeSeedsNest } from './simulation/birdsNest';
import { gauntlet } from './simulation/gauntlet';
import { handleNexKills } from './simulation/nex';
import { getTemporossLoot } from './simulation/tempoross';
import { TheatreOfBlood } from './simulation/tob';
import { WintertodtCrate } from './simulation/wintertodt';
import getOSItem from './util/getOSItem';
import itemID from './util/itemID';

interface KillArgs {
	accumulatedLoot: Bank;
	totalRuns: number;
}

interface Finishable {
	name: string;
	aliases?: string[];
	cl: number[];
	kill: (args: KillArgs) => Bank | { cost: Bank; loot: Bank };
	customResponse?: (kc: number) => string;
	maxAttempts?: number;
	tertiaryDrops?: { itemId: number; kcNeeded: number }[];
}

export const finishables: Finishable[] = [
	{
		name: 'Chambers of Xeric (Solo, Non-CM)',
		aliases: ['cox', 'raid1', 'raids1', 'chambers', 'xeric'],
		cl: chambersOfXericNormalCL,
		kill: () => ChambersOfXeric.complete({ team: [{ id: '1', personalPoints: 25_000 }] })['1']
	},
	{
		name: 'Chambers of Xeric (Solo, CM)',
		aliases: ['coxcm', 'raid1cm', 'raids1cm', 'chamberscm', 'xericcm'],
		cl: chambersOfXericCL,
		kill: () =>
			ChambersOfXeric.complete({
				challengeMode: true,
				team: [{ id: '1', personalPoints: 25_000, canReceiveAncientTablet: true, canReceiveDust: true }],
				timeToComplete: 1
			})['1'],
		tertiaryDrops: [
			{ itemId: itemID("Xeric's guard"), kcNeeded: 100 },
			{ itemId: itemID("Xeric's warrior"), kcNeeded: 500 },
			{ itemId: itemID("Xeric's sentinel"), kcNeeded: 1000 },
			{ itemId: itemID("Xeric's general"), kcNeeded: 1500 },
			{ itemId: itemID("Xeric's champion"), kcNeeded: 2000 }
		]
	},
	{
		name: 'Theatre of Blood (Solo, Non-HM)',
		aliases: ['tob', 'theatre of blood'],
		cl: theatreOfBLoodNormalCL,
		kill: () => new Bank(TheatreOfBlood.complete({ hardMode: false, team: [{ id: '1', deaths: [] }] }).loot['1']),
		tertiaryDrops: [
			{ itemId: itemID('Sinhaza shroud tier 1'), kcNeeded: 100 },
			{ itemId: itemID('Sinhaza shroud tier 2'), kcNeeded: 500 },
			{ itemId: itemID('Sinhaza shroud tier 3'), kcNeeded: 1000 },
			{ itemId: itemID('Sinhaza shroud tier 4'), kcNeeded: 1500 },
			{ itemId: itemID('Sinhaza shroud tier 5'), kcNeeded: 2000 }
		]
	},
	{
		name: 'Theatre of Blood (Solo, HM)',
		aliases: ['tob hard', 'tob hard mode', 'tobhm'],
		cl: theatreOfBLoodCL,
		kill: () => new Bank(TheatreOfBlood.complete({ hardMode: true, team: [{ id: '1', deaths: [] }] }).loot['1']),
		tertiaryDrops: [
			{ itemId: itemID('Sinhaza shroud tier 1'), kcNeeded: 100 },
			{ itemId: itemID('Sinhaza shroud tier 2'), kcNeeded: 500 },
			{ itemId: itemID('Sinhaza shroud tier 3'), kcNeeded: 1000 },
			{ itemId: itemID('Sinhaza shroud tier 4'), kcNeeded: 1500 },
			{ itemId: itemID('Sinhaza shroud tier 5'), kcNeeded: 2000 }
		]
	},
	{
		name: 'The Nightmare',
		aliases: ['nightmare'],
		cl: theNightmareNormalCL,
		kill: () => new Bank(Nightmare.kill({ isPhosani: false, team: [{ id: '1', damageDone: 2400 }] })['1'])
	},
	{
		name: "Phosani's Nightmare",
		aliases: ['phosani'],
		cl: theNightmareCL,
		kill: () => new Bank(Nightmare.kill({ isPhosani: true, team: [{ id: '1', damageDone: 2400 }] })['1'])
	},
	{
		name: 'Gauntlet',
		aliases: ['gauntlet', 'gaunt', 'ng'],
		cl: theGauntletCL.filter(i => i !== itemID('Gauntlet cape')),
		kill: () => gauntlet({ died: false, type: 'normal' })
	},
	{
		name: 'Corrupted Gauntlet',
		aliases: ['cgauntlet', 'corruptedg', 'corruptg', 'cg'],
		cl: theGauntletCL,
		kill: () => gauntlet({ died: false, type: 'corrupted' }),
		tertiaryDrops: [{ itemId: itemID('Gauntlet cape'), kcNeeded: 1 }]
	},
	{
		name: 'Nex',
		aliases: [],
		cl: NexCL,
		kill: () => handleNexKills({ quantity: 1, team: [{ id: '1', contribution: 100, deaths: [] }] }).get('1')
	},
	{
		name: 'Wintertodt (500pt crates, Max stats)',
		cl: wintertodtCL,
		aliases: ['todt', 'wintertodt', 'wt'],
		kill: ({ accumulatedLoot }) =>
			new Bank(
				WintertodtCrate.open({
					points: 500,
					itemsOwned: accumulatedLoot,
					skills: {
						herblore: 99,
						firemaking: 99,
						woodcutting: 99,
						fishing: 99,
						mining: 99,
						crafting: 99,
						farming: 99
					},
					firemakingXP: 1000
				})
			)
	},
	{
		name: 'Tempoross',
		cl: temporossCL,
		aliases: ['temp', 'ross', 'tempo', 'watertodt'],
		kill: () => getTemporossLoot(1, 99, new Bank()),
		tertiaryDrops: [
			{ itemId: itemID('Spirit angler top'), kcNeeded: 65 },
			{ itemId: itemID('Spirit angler waders'), kcNeeded: 65 },
			{ itemId: itemID('Spirit angler headband'), kcNeeded: 65 },
			{ itemId: itemID('Spirit angler boots'), kcNeeded: 65 }
		]
	},
	{
		name: 'Beginner Clue Scolls',
		cl: cluesBeginnerCL,
		aliases: ['beginner clues', 'beginner clue', 'beginner clue scroll', 'beginner clue scrolls'],
		kill: () => BeginnerCasket.roll()
	},
	{
		name: 'Easy Clue Scolls',
		cl: cluesEasyCL,
		aliases: ['easy clues', 'easy clue', 'easy clue scroll', 'easy clue scrolls'],
		kill: () => EasyCasket.roll()
	},
	{
		name: 'Medium Clue Scolls',
		cl: cluesMediumCL,
		aliases: ['medium clues', 'medium clue', 'medium clue scroll', 'medium clue scrolls'],
		kill: () => MediumCasket.roll()
	},
	{
		name: 'Hard Clue Scolls',
		cl: cluesHardCL,
		aliases: ['hard clues', 'hard clue', 'hard clue scroll', 'hard clue scrolls'],
		kill: () => HardCasket.roll()
	},
	{
		name: 'Elite Clue Scolls',
		cl: cluesEliteCL,
		aliases: ['elite clues', 'elite clue', 'elite clue scroll', 'elite clue scrolls'],
		kill: () => {
			if (roll(35)) {
				return EliteMimicTable.roll().add(EliteCasket.roll());
			}
			return EliteCasket.roll();
		}
	},
	{
		name: 'Master Clue Scolls',
		cl: cluesMasterCL,
		aliases: ['master clues', 'master clue', 'master clue scroll', 'master clue scrolls'],
		kill: () => {
			if (roll(15)) {
				return MasterMimicTable.roll().add(MasterCasket.roll());
			}
			return MasterCasket.roll();
		}
	},
	{
		name: 'Evil Chicken Outfit',
		cl: evilChickenOutfit,
		aliases: ['evil chicken outfit'],
		kill: () => {
			const loot = new Bank();
			if (roll(300)) {
				loot.add(randArrItem(evilChickenOutfit));
			} else {
				loot.add(birdsNestID);
				loot.add(treeSeedsNest.roll());
			}
			return loot;
		}
	},
	{
		name: 'Shades of Morton (Gold Keys)',
		cl: resolveItems([
			'Amulet of the damned (full)',
			'Flamtaer bag',
			'Fine cloth',
			'Bronze locks',
			'Steel locks',
			'Black locks',
			'Silver locks',
			'Gold locks',
			"Zealot's helm",
			"Zealot's robe top",
			"Zealot's robe bottom",
			"Zealot's boots",
			"Tree wizards' journal",
			'Bloody notes'
		]),
		aliases: ['shades of morton'],
		kill: ({ accumulatedLoot, totalRuns }) => {
			for (const tier of ['Bronze', 'Steel', 'Black', 'Silver', 'Gold'] as const) {
				const key = getOSItem(`${tier} key red`);
				const lock = getOSItem(`${tier} locks`);
				if (accumulatedLoot.has(lock.id) && tier !== 'Gold') continue;
				return openShadeChest({ item: key, allItemsOwned: accumulatedLoot, qty: totalRuns }).bank;
			}
			throw new Error('Not possible!');
		}
	}
];

const monsterPairedCLs = Monsters.map(mon => {
	const cl = allCollectionLogsFlat.find(c => stringMatches(c.name, mon.name));
	if (!cl) return null;
	if (!cl.items.every(id => mon.allItems.includes(id))) return null;
	return {
		name: mon.name,
		aliases: mon.aliases,
		cl: cl.items,
		mon
	};
}).filter(notEmpty);

for (const mon of monsterPairedCLs) {
	const killableMonster = killableMonsters.find(m => m.id === mon.mon.id);
	finishables.push({
		name: mon.name,
		aliases: mon.aliases,
		cl: mon.cl,
		kill: ({ accumulatedLoot }) => {
			const cost = new Bank();
			if (killableMonster?.healAmountNeeded) {
				cost.add('Swordfish', Math.ceil(killableMonster.healAmountNeeded / 14));
			}

			const loot = mon.mon.kill(1, {});
			if (killableMonster?.specialLoot) {
				killableMonster.specialLoot({ ownedItems: accumulatedLoot, loot, quantity: 1, cl: new Bank() });
			}
			return { loot, cost };
		}
	});
}

for (const pet of pets) {
	finishables.push({
		name: `${pet.name} Pet`,
		cl: [itemID(pet.name)],
		maxAttempts: 1_000_000,
		kill: () => {
			const bank = new Bank();
			if (roll(pet.chance)) bank.add(itemID(pet.name));
			return bank;
		},
		customResponse: kc => pet.formatFinish(kc)
	});
}
