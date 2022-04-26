import { randInt } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, LootTable } from 'oldschooljs';

import { client } from '../..';
import { Events } from '../../lib/constants';
import { allOpenables, allOpenablesIDs } from '../../lib/openables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { itemID, stringMatches, truncateString, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import { OSBMahojiCommand } from '../lib/util';

const regex = /^(.*?)( \([0-9]+x Owned\))?$/;

export const openCommand: OSBMahojiCommand = {
	name: 'open',
	description: 'Open an item (caskets, keys, boxes, etc).',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to open.',
			required: false,
			autocomplete: async (value, user) => {
				const botUser = await client.fetchUser(user.id);
				return botUser
					.bank()
					.items()
					.filter(i => allOpenablesIDs.has(i[0].id))
					.filter(i => {
						if (!value) return true;
						const openable = allOpenables.find(o => o.id === i[0].id);
						if (!openable) return false;
						return [i[0].name.toLowerCase(), ...openable.aliases].some(val =>
							val.toLowerCase().includes(value.toLowerCase())
						);
					})
					.map(i => ({ name: `${i[0].name} (${i[1]}x Owned)`, value: i[0].name.toLowerCase() }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to open (defaults to one).',
			required: false,
			min_value: 1,
			max_value: 100_000
		}
	],
	run: async ({ userID, options, interaction }: CommandRunOptions<{ name?: string; quantity?: number }>) => {
		await interaction.deferReply();
		const user = await client.fetchUser(userID);
		if (!options.name) {
			return `You have... ${truncateString(
				user
					.bank()
					.filter(item => allOpenablesIDs.has(item.id), false)
					.toString(),
				1950
			)}.`;
		}
		const name = options.name.replace(regex, '$1');
		const openable = allOpenables.find(o => o.aliases.some(alias => stringMatches(alias, name)));
		if (!openable) return "That's not a valid item.";

		const { openedItem, output } = openable;
		const bank = user.bank();
		const quantity = options.quantity ?? 1;
		const cost = new Bank().add(openedItem.id, quantity);
		if (!bank.has(cost)) return `You don't have ${cost}.`;

		const previousScore = user.getOpenableScore(openedItem.id);

		await user.removeItemsFromBank(cost);
		await user.incrementOpenableScore(openedItem.id, quantity);
		const loot =
			output instanceof LootTable
				? { bank: output.roll(quantity) }
				: await output({ user, self: openable, quantity });
		const { previousCL } = await user.addItemsToBank({
			items: loot.bank,
			collectionLog: true,
			filterLoot: false
		});
		const image = await client.tasks.get('bankImage')!.generateBankImage(
			loot.bank,
			`Loot from ${quantity}x ${openedItem.name}`,
			true,
			{
				showNewCL: 'showNewCL'
			},
			user,
			previousCL
		);

		if (loot.bank.has('Coins')) {
			await updateGPTrackSetting(client, ClientSettings.EconomyStats.GPSourceOpen, loot.bank.amount('Coins'));
		}

		const nthOpenable = formatOrdinal(previousScore + randInt(1, quantity));

		if (loot.bank.has("Lil' creator")) {
			client.emit(
				Events.ServerNotification,
				`<:lil_creator:798221383951319111> **${user.username}'s** minion, ${
					user.minionName
				}, just received a Lil' creator! They've done ${await user.getMinigameScore(
					'soul_wars'
				)} Soul wars games, and this is their ${nthOpenable} Spoils of war crate.`
			);
		}

		if (openedItem.id === itemID('Bag full of gems') && loot.bank.has('Uncut onyx')) {
			client.emit(
				Events.ServerNotification,
				`${user} just received an Uncut Onyx from their ${nthOpenable} Bag full of gems!`
			);
		}

		return {
			attachments: [
				{
					fileName: `loot.${image.isTransparent ? 'png' : 'jpg'}`,
					buffer: image.image!
				}
			],
			content:
				loot.message ??
				`You have opened the ${openedItem.name} ${user.getOpenableScore(openedItem.id).toLocaleString()} times.`
		};
	}
};
