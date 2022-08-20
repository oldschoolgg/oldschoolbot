import { randInt, roll } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';
import { ChambersOfXeric } from 'oldschooljs/dist/simulation/misc';
import { toKMB } from 'oldschooljs/dist/util';

import { PerkTier } from '../../lib/constants';
import pets from '../../lib/data/pets';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { OSBMahojiCommand } from '../lib/util';

export function determineCoxLimit(user: KlasaUser) {
	if (globalClient.owners.has(user)) {
		return Infinity;
	}

	const perkTier = getUsersPerkTier(user);

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

async function coxCommand(
	user: KlasaUser,
	quantity: number,
	cm = false,
	points = 25_000,
	teamSize = 4
): CommandResponse {
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

	let loot = new Bank();
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
		attachments: [image.file]
	};
}

export const simulateCommand: OSBMahojiCommand = {
	name: 'simulate',
	description: 'Simulate various OSRS related things.',
	attributes: {
		requiresMinion: true,
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
		}
	],
	run: async ({
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
	}>) => {
		const user = await globalClient.fetchUser(userID.toString());
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
