import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { randInt, roll } from 'e';
import { Bank, averageBank } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc';
import { toKMB } from 'oldschooljs/dist/util';

import { PerkTier } from '@oldschoolgg/toolkit/util';
import { ColosseumWaveBank, startColosseumRun } from '../../lib/colosseum';
import pets from '../../lib/data/pets';
import { assert, formatDuration } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
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
		return 'Invalid command.';
	}
};
