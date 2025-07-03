import { type CommandResponse, type CommandRunOptions, PerkTier, formatDuration } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { randInt, roll } from 'e';
import { Bank, ChambersOfXeric, averageBank, toKMB } from 'oldschooljs';

import { ColosseumWaveBank, startColosseumRun } from '../../lib/colosseum';
import pets from '../../lib/data/pets';
import { simulateCollection } from '../../lib/miscellania';
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
					type: ApplicationCommandOptionType.Integer,
					name: 'woodcutting',
					description: 'Woodcutting workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'mining',
					description: 'Mining workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'fishing_raw',
					description: 'Raw fishing workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'fishing_cooked',
					description: 'Cooked fishing workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'herbs',
					description: 'Herb workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'flax',
					description: 'Flax workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'hardwood_mahogany',
					description: 'Mahogany workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'hardwood_teak',
					description: 'Teak workers',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'hardwood_both',
					description: 'Both hardwoods',
					required: false,
					min_value: 0,
					max_value: 15
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'farm_seeds',
					description: 'Farming seed workers',
					required: false,
					min_value: 0,
					max_value: 15
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
		colosseum?: {};
		miscellania?: {
			days: number;
			approval?: number;
			woodcutting?: number;
			mining?: number;
			fishing_raw?: number;
			fishing_cooked?: number;
			herbs?: number;
			flax?: number;
			hardwood_mahogany?: number;
			hardwood_teak?: number;
			hardwood_both?: number;
			farm_seeds?: number;
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
			const alloc: any = {};
			for (const key of [
				'woodcutting',
				'mining',
				'fishing_raw',
				'fishing_cooked',
				'herbs',
				'flax',
				'hardwood_mahogany',
				'hardwood_teak',
				'hardwood_both',
				'farm_seeds'
			]) {
				const val = (options.miscellania as any)[key];
				if (val !== undefined) alloc[key.replace(/_(.)/g, (_, c) => c.toUpperCase())] = val;
			}
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
