import { formatDuration, PerkTier } from '@oldschoolgg/toolkit';
import { MathRNG, randInt, roll } from 'node-rng';
import { averageBank, Bank, ChambersOfXeric, toKMB } from 'oldschooljs';

import { ColosseumWaveBank, startColosseumRun } from '@/lib/colosseum.js';
import pets from '@/lib/data/pets.js';
import {
	calculateMiscellaniaDays,
	calculateTopupTripSeconds,
	daysElapsedSince,
	MISCELLANIA_TRIP_SECONDS_PER_DAY,
	type MiscellaniaState,
	miscellaniaAreaKeys,
	miscellaniaAreaLabels,
	normalizeMiscellaniaAreaKey,
	normalizeMiscellaniaState,
	simulateDetailedMiscellania,
	validateAreas
} from '@/lib/miscellania/calc.js';
import { assert } from '@/lib/util/logError.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

async function determineCoxLimit(user: MUser) {
	const perkTier = await user.fetchPerkTier();

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
				bloodFuryCharges: 0,
				rng: MathRNG
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
	const limit = await determineCoxLimit(user);
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
		files: [image]
	};
}

export const simulateCommand = defineCommand({
	name: 'simulate',
	description: 'Simulate various OSRS related things.',
	attributes: {
		examples: ['/simulate cox quantity:1']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'cox',
			description: 'Simulate Chambers of Xeric.',
			options: [
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The amount of raids to simulate.',
					min_value: 1,
					required: true
				},
				{
					type: 'Integer',
					name: 'points',
					description: 'How many points to have (default 25k).',
					min_value: 1,
					max_value: 1_000_000,
					required: false
				},
				{
					type: 'Integer',
					name: 'team_size',
					description: 'The size of your team (default 4).',
					min_value: 1,
					required: false
				},
				{
					type: 'Boolean',
					name: 'challenge_mode',
					description: 'Challenge mode raids? (default false)',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'petroll',
			description: 'Simulate rolls at every pet at once.',
			options: [
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The amount of rolls.',
					min_value: 1,
					max_value: 100,
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'colosseum',
			description: 'Simulate colosseum.'
		},
		{
			type: 'Subcommand',
			name: 'managing_miscellania',
			description: 'Preview Managing Miscellania GP and trip duration.',
			options: [
				{
					type: 'Boolean',
					name: 'detailed',
					description: 'Use detailed coffer/favour/resource-point simulation.',
					required: false
				},
				{
					type: 'Integer',
					name: 'days',
					description: 'Days to simulate in detailed mode.',
					required: false,
					min_value: 1,
					max_value: 10000
				},
				{
					type: 'Integer',
					name: 'starting_coffer',
					description: 'Starting coffer amount (detailed mode).',
					required: false,
					min_value: 0,
					max_value: 7_500_000
				},
				{
					type: 'Integer',
					name: 'starting_favour',
					description: 'Starting favour percent (detailed mode).',
					required: false,
					min_value: 25,
					max_value: 100
				},
				{
					type: 'Boolean',
					name: 'constant_favour',
					description: 'Treat favour as maintained daily (detailed mode).',
					required: false
				},
				{
					type: 'String',
					name: 'primary_area',
					description: 'Main collection area (10 workers).',
					required: false,
					choices: miscellaniaAreaKeys.map(key => ({ name: miscellaniaAreaLabels[key], value: key }))
				},
				{
					type: 'String',
					name: 'secondary_area',
					description: 'Secondary collection area (5 workers).',
					required: false,
					choices: miscellaniaAreaKeys.map(key => ({ name: miscellaniaAreaLabels[key], value: key }))
				}
			]
		}
	],
	run: async ({ interaction, options, user }) => {
		await interaction.defer();
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
		if (options.managing_miscellania) {
			const now = Date.now();
			const stateRes = await prisma.user.findUnique({
				where: { id: user.id },
				select: { miscellania_state: true }
			});
			const existing = normalizeMiscellaniaState(
				(stateRes?.miscellania_state as MiscellaniaState | null) ?? null,
				{
					now
				}
			);
			const primaryArea = normalizeMiscellaniaAreaKey(
				options.managing_miscellania.primary_area ?? existing.primaryArea,
				'maple'
			);
			const secondaryArea = normalizeMiscellaniaAreaKey(
				options.managing_miscellania.secondary_area ?? existing.secondaryArea,
				'herbs'
			);
			const areaErr = validateAreas(primaryArea, secondaryArea);
			if (areaErr) return areaErr;

			if (options.managing_miscellania.detailed) {
				const days = options.managing_miscellania.days ?? calculateMiscellaniaDays(existing, now);
				const startingCoffer = options.managing_miscellania.starting_coffer ?? 7_500_000;
				const startingFavour = options.managing_miscellania.starting_favour ?? 100;
				const constantFavour = options.managing_miscellania.constant_favour ?? false;

				const detailed = simulateDetailedMiscellania({
					days,
					startingCoffer,
					startingFavour,
					constantFavour,
					startingResourcePoints: existing.resourcePoints
				});

				return `Managing Miscellania detailed simulation:
Primary area: ${miscellaniaAreaLabels[primaryArea]}
Secondary area: ${miscellaniaAreaLabels[secondaryArea]}
Days simulated: ${detailed.days}
Starting coffer: ${detailed.startingCoffer.toLocaleString()}
Ending coffer: ${detailed.endingCoffer.toLocaleString()}
GP spent: ${detailed.gpSpent.toLocaleString()}
Starting favour: ${detailed.startingFavour.toFixed(1)}%
Ending favour: ${detailed.endingFavour.toFixed(1)}%
Constant favour mode: ${detailed.constantFavour ? 'yes' : 'no'}
Resource points: ${detailed.resourcePoints.toLocaleString()}`;
			}

			const days = calculateMiscellaniaDays(existing, now);
			const daysSinceLastUpdate = daysElapsedSince(existing.lastUpdatedAt, now);
			let endingCoffer = existing.coffer;
			let endingFavour = existing.favour;
			let resourcePoints = existing.resourcePoints;
			if (daysSinceLastUpdate > 0) {
				const projected = simulateDetailedMiscellania({
					days: daysSinceLastUpdate,
					startingCoffer: existing.coffer,
					startingFavour: existing.favour,
					constantFavour: false,
					startingResourcePoints: existing.resourcePoints
				});
				endingCoffer = projected.endingCoffer;
				endingFavour = projected.endingFavour;
				resourcePoints = projected.resourcePoints;
			}
			const gpCost = Math.max(0, existing.cofferAtLastClaim - endingCoffer);
			const resourcePointsGained = Math.max(0, resourcePoints - existing.resourcePoints);
			const topupTripSeconds = calculateTopupTripSeconds(existing, now);
			const topupDays = Math.max(1, Math.floor(topupTripSeconds / MISCELLANIA_TRIP_SECONDS_PER_DAY));
			const duration = topupTripSeconds * 1000;
			const maxTripLength = await user.calcMaxTripLength('MiscellaniaTopup');
			const canAfford = user.GP >= gpCost;
			const fitsTrip = duration <= maxTripLength;

			return `Managing Miscellania preview:
Primary area: ${miscellaniaAreaLabels[primaryArea]}
Secondary area: ${miscellaniaAreaLabels[secondaryArea]}
Days to claim: ${days}
Days since last top-up: ${topupDays}
Starting coffer: ${existing.coffer.toLocaleString()}
Ending coffer: ${endingCoffer.toLocaleString()}
Cost if started now: ${gpCost.toLocaleString()} GP
Starting favour: ${existing.favour.toFixed(1)}%
Ending favour (before top-up): ${endingFavour.toFixed(1)}%
Resource points gained: ${resourcePointsGained.toLocaleString()}
Total resource points: ${resourcePoints.toLocaleString()}
Trip duration: ${formatDuration(duration)}
Your max trip length: ${formatDuration(maxTripLength)}
Can afford now: ${canAfford ? 'yes' : 'no'}
Fits max trip length: ${fitsTrip ? 'yes' : 'no'}`;
		}
		return 'Invalid command.';
	}
});
