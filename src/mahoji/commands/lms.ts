import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions, MessageFlags } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import { lmsSimCommand } from '../../lib/minions/functions/lmsSimCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import { getUsersLMSStats } from '../../tasks/minions/minigames/lmsActivity';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate } from '../mahojiSettings';

interface LMSBuyable {
	item: Item;
	cost: number | null;
	quantity?: number;
	onlyCL?: true;
	wins?: number;
}

const LMSBuyables: LMSBuyable[] = [
	{ item: getOSItem("Deadman's chest"), cost: 160 },
	{ item: getOSItem("Deadman's legs"), cost: 160 },
	{ item: getOSItem("Deadman's cape"), cost: 160 },
	{ item: getOSItem('Swift blade'), cost: 350 },
	{ item: getOSItem('Guthixian icon'), cost: 500 },
	{ item: getOSItem('Trouver parchment'), cost: 30 },
	{ item: getOSItem('Wilderness crabs teleport'), cost: 1 },
	{ item: getOSItem('Blighted bind sack'), quantity: 300, cost: 1 },
	{ item: getOSItem('Blighted snare sack'), quantity: 150, cost: 1 },
	{ item: getOSItem('Blighted entangle sack'), quantity: 70, cost: 1 },
	{ item: getOSItem('Blighted teleport spell sack'), quantity: 50, cost: 1 },
	{ item: getOSItem('Blighted vengeance sack'), quantity: 50, cost: 1 },
	{ item: getOSItem('Blighted ancient ice sack'), quantity: 30, cost: 1 },
	{ item: getOSItem('Adamant arrow'), quantity: 350, cost: 1 },
	{ item: getOSItem('Bolt rack'), quantity: 200, cost: 1 },
	{ item: getOSItem('Rune arrow'), quantity: 300, cost: 3 },
	{ item: getOSItem('Dragonstone bolts (e)'), quantity: 20, cost: 3 },
	{ item: getOSItem('Blighted karambwan'), quantity: 12, cost: 1 },
	{ item: getOSItem('Blighted manta ray'), quantity: 15, cost: 1 },
	{ item: getOSItem('Blighted anglerfish'), quantity: 15, cost: 1 },
	{ item: getOSItem('Blighted super restore(4)'), quantity: 4, cost: 1 },
	{ item: getOSItem('Climbing boots'), quantity: 20, cost: 1 },
	{ item: getOSItem('Looting bag'), cost: 1 },
	{ item: getOSItem('Looting bag note'), cost: 1 },
	{ item: getOSItem('Ring of wealth scroll'), cost: 5 },
	{ item: getOSItem('Magic shortbow scroll'), cost: 5 },
	{ item: getOSItem('Clue box'), cost: 5 },
	{ item: getOSItem('Crystal weapon seed'), cost: 12 },
	{ item: getOSItem('Granite clamp'), cost: 25 },
	{ item: getOSItem('Ornate maul handle'), cost: 15 },
	{ item: getOSItem('Steam staff upgrade kit'), cost: 13 },
	{ item: getOSItem('Lava staff upgrade kit'), cost: 13 },
	{ item: getOSItem('Dragon pickaxe upgrade kit'), cost: 14 },
	{ item: getOSItem('Ward upgrade kit'), cost: 20 },
	{ item: getOSItem('Green dark bow paint'), cost: 25 },
	{ item: getOSItem('Yellow dark bow paint'), cost: 25 },
	{ item: getOSItem('White dark bow paint'), cost: 25 },
	{ item: getOSItem('Blue dark bow paint'), cost: 25 },
	{ item: getOSItem('Volcanic whip mix'), cost: 25 },
	{ item: getOSItem('Frozen whip mix'), cost: 25 },
	{ item: getOSItem('Rune pouch'), cost: 75 },
	{ item: getOSItem('Rune pouch note'), cost: 75 },
	{ item: getOSItem('Decorative emblem'), cost: 100 },
	{ item: getOSItem("Saradomin's tear"), cost: 150 },
	{ item: getOSItem('Target teleport scroll'), cost: 250 },
	{ item: getOSItem("Vesta's longsword (inactive)"), cost: 300 },
	{ item: getOSItem('Armadyl halo'), cost: 450 },
	{ item: getOSItem('Bandos halo'), cost: 450 },
	{ item: getOSItem('Seren halo'), cost: 450 },
	{ item: getOSItem('Ancient halo'), cost: 450 },
	{ item: getOSItem('Brassica halo'), cost: 450 },
	{ item: getOSItem('Paddewwa teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Senntisten teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Annakarl teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Carrallangar teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Dareeyak teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Ghorrock teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Kharyrll teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Lassar teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Target teleport'), cost: 1 },
	// Capes
	{ item: getOSItem("Victor's cape (1)"), cost: null, wins: 1 },
	{ item: getOSItem("Victor's cape (10)"), cost: null, wins: 10 },
	{ item: getOSItem("Victor's cape (50)"), cost: null, wins: 50 },
	{ item: getOSItem("Victor's cape (100)"), cost: null, wins: 100 },
	{ item: getOSItem("Victor's cape (500)"), cost: null, wins: 500 },
	{ item: getOSItem("Victor's cape (1000)"), cost: null, wins: 1000 },
	// Special attacks
	{ item: getOSItem('Golden armadyl special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden saradomin special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden bandos special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden zamorak special attack'), cost: 75, onlyCL: true }
];

export const lmsCommand: OSBMahojiCommand = {
	name: 'lms',
	description: 'Sends your minion to do the Last Man Standing minigame.',
	attributes: {
		categoryFlags: ['minion', 'minigame'],
		description: 'Sends your minion to do the Last Man Standing minigame.',
		examples: ['/lms']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'See your Last Man Standing stats.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Start a Last Man Standing Trip'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Buy a reward using your points.',
			options: [
				{
					name: 'name',
					description: 'The item you want to purchase.',
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: async (value: string) => {
						return LMSBuyables.filter(i =>
							!value ? true : i.item.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({ name: i.item.name, value: i.item.name }));
					}
				},
				{
					name: 'quantity',
					description: 'The quantity you want to purchase.',
					type: ApplicationCommandOptionType.Integer,
					required: false,
					min_value: 1,
					max_value: 1000
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'simulate',
			description: 'Simulate a Last Man Standing game with your Discord friends.',
			options: [
				{
					name: 'names',
					description: 'Names. e.g. Magnaboy, Kyra, Alex',
					required: false,
					type: ApplicationCommandOptionType.String
				}
			]
		}
	],
	run: async ({
		channelID,
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		stats?: {};
		start?: {};
		buy?: { name?: string; quantity?: number };
		simulate?: { names?: string };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const stats = await getUsersLMSStats(user);

		if (options.stats) {
			return `**Last Man Standing**

**Wins:** ${stats.gamesWon}
**Reward Points:** ${stats.points}
**Average Kills Per Game:** ${stats.averageKills.toFixed(2)}
**Average Position:** ${stats.averagePosition.toFixed(2)}
**Highest Kill Match:** ${stats.highestKillInGame} kills
**Total Matches:** ${stats.totalGames}`;
		}

		if (options.simulate) {
			lmsSimCommand(client.channels.cache.get(channelID.toString()), options.simulate.names);
			return {
				content: 'Starting simulation...',
				flags: MessageFlags.Ephemeral
			};
		}

		if (options.buy) {
			const itemToBuy = LMSBuyables.find(i => stringMatches(i.item.name, options.buy?.name ?? ''));
			if (!itemToBuy) {
				return "That's not a valid item you can buy.";
			}
			const quantity = options.buy.quantity ?? 1;
			const cost = itemToBuy.cost ? itemToBuy.cost * quantity : itemToBuy.cost;
			if (cost && stats.points < cost) {
				return `You don't have enough points. ${quantity}x ${itemToBuy.item.name} costs ${cost}, but you have ${stats.points}.`;
			}
			if (itemToBuy.wins && stats.gamesWon < itemToBuy.wins) {
				return `You are not worthy! You need to have won atleast ${itemToBuy.wins} games to buy the ${itemToBuy.item.name}.`;
			}
			const loot = new Bank().add(itemToBuy.item.id, quantity * (itemToBuy.quantity ?? 1));
			await handleMahojiConfirmation(
				channelID.toString(),
				userID,
				interaction,
				`Are you sure you want to spend ${cost} points on buying ${loot}?`
			);
			if (!cost) {
				await user.addItemsToBank({ items: loot, collectionLog: true });
				return `You received ${loot}.`;
			}

			const { newUser } = await mahojiUserSettingsUpdate(user, {
				lms_points: {
					decrement: cost
				}
			});
			if (itemToBuy.onlyCL) {
				await user.addItemsToCollectionLog({ items: loot });
			} else {
				await user.addItemsToBank({ items: loot, collectionLog: true });
			}
			return `You spent ${cost} points to buy ${loot}. You now have ${newUser.lms_points} LMS points.`;
		}

		const durationPerGame = Time.Minute * 5.5;
		const quantity = Math.floor(user.maxTripLength('LastManStanding') / durationPerGame);
		const duration = randomVariation(quantity * durationPerGame, 5);

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			minigameID: 'lms',
			userID: user.id,
			channelID: channelID.toString(),
			duration,
			type: 'LastManStanding',
			quantity
		});

		return `${
			user.minionName
		} is now off to do ${quantity} games of competitive Last Man Standing. The trip will take ${formatDuration(
			duration
		)}.`;
	}
};
