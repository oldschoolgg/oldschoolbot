import { type CommandResponse, type CommandRunOptions, PerkTier, formatDuration } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { randInt, roll } from 'e';
import { Bank, ChambersOfXeric, averageBank, toKMB } from 'oldschooljs';

import { ColosseumWaveBank, startColosseumRun } from '../../lib/colosseum';
import pets from '../../lib/data/pets';
import { type MiscWorkerAllocation, simulateCollection } from '../../lib/miscellania';
import { deferInteraction } from '../../lib/util/interactionReply';
import { assert } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import type { OSBMahojiCommand } from '../lib/util';

function determineCoxLimit(user: MUser) {
	const perkTier = user.perkTier();

	if (perkTier >= PerkTier.Three) {
		return 2000;
	}

	if (perkTier === PerkTier.Two) {
		return 1000;
	}

	if (perkTier === PerkTier.One) {
		return 100;
	}

	return 10;
}

function simulateColosseumRuns(samples = 100) {
	const totalSimulations = samples;
	let totalAttempts = 0;
	let totalDeaths = 0;
	const totalLoot = new Bank();
	const finishAttemptAmounts = [];
	let totalDuration = 0;

	for (let i = 0; i < totalSimulations; i++) {
		let attempts = 0;
		let deaths = 0;
		let done = false;
		const kcBank = new ColosseumWaveBank();
		const runLoot = new Bank();

		while (!done) {
			attempts++;
			const result = startColosseumRun({
				kcBank,
				hasScythe: true,
				hasTBow: true,
				hasVenBow: true,
				hasBF: false,
				hasClaws: true,
				hasSGS: true,
				hasTorture: true,
				scytheCharges: 300,
				venatorBowCharges: 50,
				bloodFuryCharges: 0
			});
			totalDuration += result.realDuration;
			kcBank.add(result.addedWaveKCBank);
			if (result.diedAt === null) {
				if (result.loot) runLoot.add(result.loot);
				done = true;
			} else {
				deaths++;
			}
		}
		assert(kcBank.amount(12) > 0);
		finishAttemptAmounts.push(attempts);
		totalAttempts += attempts;
		totalDeaths += deaths;
		totalLoot.add(runLoot);
	}

	const averageAttempts = totalAttempts / totalSimulations;
	const averageDeaths = totalDeaths / totalSimulations;

	finishAttemptAmounts.sort((a, b) => a - b);

	const result = `Results from the simulation of ${totalSimulations}x people completing the Colosseum:
**Average duration to beat wave 12 for first time:** ${formatDuration(totalDuration / totalSimulations)}
**Average deaths before beating wave 12:** ${averageDeaths}
**Average loot:** ${averageBank(totalLoot, totalSimulations)}
**Fastest completion trips:** ${finishAttemptAmounts[0]}
**Mean completion trips:** ${finishAttemptAmounts[Math.floor(finishAttemptAmounts.length / 2)]}
**Average trips to beat wave 12:** ${averageAttempts}.
**Longest completion trips:** ${finishAttemptAmounts[finishAttemptAmounts.length - 1]}`;
	return result;
}

async function coxCommand(user: MUser, quantity: number, cm = false, points = 25_000, teamSize = 4): CommandResponse {
	const limit = determineCoxLimit(user);
	if (quantity > limit) {
		return `The quantity provided is over your limit of ${limit}. You can increase your limit up to 2000 by becoming a patron: <https://patreon.com/oldschoolbot>`;
	}

	const team = [
		{
			id: user.id,
			personalPoints: points
		}
	];
	while (team.length < Math.min(100, teamSize)) {
		team.push({ id: `${randInt(1, 10_000_000)}`, personalPoints: points });
	}

	const loot = new Bank();
	for (let i = 0; i < quantity; i++) {
		const singleRaidLoot = ChambersOfXeric.complete({
			team,
			challengeMode: cm,
			timeToComplete: 1
		});

		for (const lootBank of Object.values(singleRaidLoot)) {
			loot.add(lootBank);
		}
	}
	const image = await makeBankImage({
		bank: loot,
		title: `Loot from ${quantity} ${cm ? 'challenge mode ' : ''}raids`
	});

	return {
		content: `Personal Loot from ${quantity}x raids, with ${team.length} people, each with ${toKMB(
			points
		)} points.`,
		files: [image.file]
	};
}

export const simulateCommand: OSBMahojiCommand = {
	name: 'simulate',
	description: 'Simulate various OSRS related things.',
	attributes: {
		examples: ['/simulate cox quantity:1']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cox',
			description: 'Simulate Chambers of Xeric.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The amount of raids to simulate.',
					min_value: 1,
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'points',
					description: 'How many points to have (default 25k).',
					min_value: 1,
					max_value: 1_000_000,
					required: false
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'team_size',
					description: 'The size of your team (default 4).',
					min_value: 1,
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'challenge_mode',
					description: 'Challenge mode raids? (default false)',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'petroll',
			description: 'Simulate rolls at every pet at once.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The amount of rolls.',
					min_value: 1,
					max_value: 100,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'colosseum',
			description: 'Simulate colosseum.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'miscellania',
			description: 'Simulate collecting resources from Miscellania.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'days',
					description: 'Number of days to simulate.',
					required: true,
					min_value: 1,
					max_value: 100
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'approval',
					description: 'Starting approval percentage.',
					required: false,
					min_value: 0,
					max_value: 100
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'ten_workers',
					description: 'Task for your first 10 workers.',
					required: false,
					choices: [
						{ name: 'Woodcutting', value: 'woodcutting' },
						{ name: 'Mining', value: 'mining' },
						{ name: 'Fishing (raw)', value: 'fishing_raw' },
						{ name: 'Fishing (cooked)', value: 'fishing_cooked' },
						{ name: 'Herbs', value: 'herbs' },
						{ name: 'Flax', value: 'flax' },
						{ name: 'Hardwood (mahogany)', value: 'hardwood_mahogany' },
						{ name: 'Hardwood (teak)', value: 'hardwood_teak' },
						{ name: 'Hardwood (both)', value: 'hardwood_both' },
						{ name: 'Farming seeds', value: 'farm_seeds' }
					]
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'five_workers',
					description: 'Task for your remaining 5 workers (Royal Trouble).',
					required: false,
					choices: [
						{ name: 'Woodcutting', value: 'woodcutting' },
						{ name: 'Mining', value: 'mining' },
						{ name: 'Fishing (raw)', value: 'fishing_raw' },
						{ name: 'Fishing (cooked)', value: 'fishing_cooked' },
						{ name: 'Herbs', value: 'herbs' },
						{ name: 'Flax', value: 'flax' },
						{ name: 'Hardwood (mahogany)', value: 'hardwood_mahogany' },
						{ name: 'Hardwood (teak)', value: 'hardwood_teak' },
						{ name: 'Hardwood (both)', value: 'hardwood_both' },
						{ name: 'Farming seeds', value: 'farm_seeds' }
					]
				}
			]
		}
	],
	run: async ({
		interaction,
		options,
		userID
	}: CommandRunOptions<{
		cox?: {
			quantity: number;
			points?: number;
			team_size?: number;
			challenge_mode?: boolean;
		};
		petroll?: {
			quantity: number;
		};
		colosseum?: Record<string, never>;
		miscellania?: {
			days: number;
			approval?: number;
			ten_workers?: string;
			five_workers?: string;
		};
	}>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID.toString());
		if (options.colosseum) {
			return simulateColosseumRuns();
		}
		if (options.cox) {
			return coxCommand(
				user,
				options.cox.quantity,
				options.cox.challenge_mode,
				options.cox.points,
				options.cox.team_size
			);
		}
		if (options.petroll) {
			const received = [];

			for (let i = 0; i < options.petroll.quantity; i++) {
				for (const pet of pets) {
					if (roll(pet.chance)) received.push(pet.emoji);
				}
			}

			if (received.length === 0) return "You didn't get any pets!";
			return received.join(' ');
		}
		if (options.miscellania) {
			const zeroAlloc = {
				woodcutting: 0,
				mining: 0,
				fishingRaw: 0,
				fishingCooked: 0,
				herbs: 0,
				flax: 0,
				hardwoodMahogany: 0,
				hardwoodTeak: 0,
				hardwoodBoth: 0,
				farmSeeds: 0
			};
			const toCamel = (str: string | undefined) =>
				str?.replace(/_([a-z])/g, (_, c) => c.toUpperCase()) as keyof MiscWorkerAllocation | undefined;

			const alloc: MiscWorkerAllocation = { ...zeroAlloc } as MiscWorkerAllocation;

			const first = toCamel(options.miscellania.ten_workers);
			if (first) alloc[first] += 10;

			const second = toCamel(options.miscellania.five_workers);
			if (second) alloc[second] += 5;

			const loot = simulateCollection(options.miscellania.days, {
				approval: options.miscellania.approval,
				allocation: alloc
			});
			const image = await makeBankImage({
				bank: loot,
				title: `Loot from ${options.miscellania.days} days of Miscellania`
			});
			return { files: [image.file] };
		}
		return 'Invalid command.';
	}
};
