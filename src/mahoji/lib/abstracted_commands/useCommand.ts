import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { notEmpty, Time } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField, Emoji } from '../../../lib/constants';
import { assert, awaitMessageComponentInteraction, makeComponents } from '../../../lib/util';
import getOSItem, { getItem } from '../../../lib/util/getOSItem';
import { deferInteraction } from '../../../lib/util/interactionReply';
import { flowerTable } from './hotColdCommand';

interface Usable {
	items: Item[];
	run: (user: MUser, channel: TextChannel, interaction: ChatInputCommandInteraction) => Promise<string>;
}
export const usables: Usable[] = [];

interface UsableUnlock {
	item: Item;
	bitfield: BitField;
	resultMessage: string;
}
const usableUnlocks: UsableUnlock[] = [
	{
		item: getOSItem('Torn prayer scroll'),
		bitfield: BitField.HasTornPrayerScroll,
		resultMessage: 'You used your Torn prayer scroll, and unlocked the Preserve prayer.'
	},
	{
		item: getOSItem('Dexterous prayer scroll'),
		bitfield: BitField.HasDexScroll,
		resultMessage: 'You used your Dexterous prayer scroll, and unlocked the Rigour prayer.'
	},
	{
		item: getOSItem('Arcane prayer scroll'),
		bitfield: BitField.HasArcaneScroll,
		resultMessage: 'You used your Arcane prayer scroll, and unlocked the Augury prayer.'
	},
	{
		item: getOSItem('Slepey tablet'),
		bitfield: BitField.HasSlepeyTablet,
		resultMessage: 'You used your Slepey tablet, and unlocked the Slepe teleport.'
	},
	{
		item: getOSItem('Runescroll of bloodbark'),
		bitfield: BitField.HasBloodbarkScroll,
		resultMessage: 'You used your Runescroll of bloodbark, and unlocked the ability to create Bloodbark armour.'
	},
	{
		item: getOSItem('Runescroll of swampbark'),
		bitfield: BitField.HasSwampbarkScroll,
		resultMessage: 'You used your Runescroll of Swampbark, and unlocked the ability to create Swampbark armour.'
	},
	{
		item: getOSItem("Saradomin's light"),
		bitfield: BitField.HasSaradominsLight,
		resultMessage: "You used your Saradomin's light."
	},
	{
		item: getOSItem('Frozen tablet'),
		bitfield: BitField.UsedFrozenTablet,
		resultMessage: 'You used your Frozen tablet.'
	},
	{
		item: getOSItem('Scarred tablet'),
		bitfield: BitField.UsedScarredTablet,
		resultMessage: 'You used your Scarred tablet.'
	},
	{
		item: getOSItem('Sirenic tablet'),
		bitfield: BitField.UsedSirenicTablet,
		resultMessage: 'You used your Sirenic tablet.'
	},
	{
		item: getOSItem('Strangled tablet'),
		bitfield: BitField.UsedStrangledTablet,
		resultMessage: 'You used your Strangled tablet.'
	}
];
for (const usableUnlock of usableUnlocks) {
	usables.push({
		items: [usableUnlock.item],
		run: async user => {
			if (user.bitfield.includes(usableUnlock.bitfield)) {
				return "You already used this item, you can't use it again.";
			}
			await user.removeItemsFromBank(new Bank().add(usableUnlock.item.id));
			await user.update({
				bitfield: {
					push: usableUnlock.bitfield
				}
			});
			return usableUnlock.resultMessage;
		}
	});
}

const genericUsables: {
	items: [Item, Item] | [Item];
	cost: Bank;
	loot: Bank | (() => Bank) | null;
	response: (loot: Bank) => string;
}[] = [
	{
		items: [getOSItem('Banana'), getOSItem('Monkey')],
		cost: new Bank().add('Banana').freeze(),
		loot: null,
		response: () => 'You fed a Banana to your Monkey!'
	},
	{
		items: [getOSItem('Mithril seeds')],
		cost: new Bank().add('Mithril seeds').freeze(),
		loot: () => flowerTable.roll(),
		response: loot => `You planted a Mithril seed and got ${loot}!`
	}
];
for (const genericU of genericUsables) {
	usables.push({
		items: genericU.items,
		run: async user => {
			const cost = genericU.cost ? genericU.cost : undefined;
			const loot =
				genericU.loot === null ? undefined : genericU.loot instanceof Bank ? genericU.loot : genericU.loot();
			if (loot || cost) await user.transactItems({ itemsToAdd: loot, itemsToRemove: cost, collectionLog: true });
			return genericU.response(loot ?? new Bank());
		}
	});
}
const dyeUsables: {
	name: string;
	items: [Item, Item] | [Item];
	cost: Bank;
	response: (loot: Bank) => string;
}[] = [
	{
		name: 'Abyssal red dye',
		items: [getOSItem('Abyssal red dye')],
		cost: new Bank().add('Abyssal red dye').freeze(),
		response: loot => `You swapped 1x Abyssal red dye for ${loot}!`
	},
	{
		name: 'Abyssal blue dye',
		items: [getOSItem('Abyssal blue dye')],
		cost: new Bank().add('Abyssal blue dye').freeze(),
		response: loot => `You swapped 1x Abyssal blue dye for ${loot}!`
	},
	{
		name: 'Abyssal green dye',
		items: [getOSItem('Abyssal green dye')],
		cost: new Bank().add('Abyssal green dye').freeze(),
		response: loot => `You swapped 1x Abyssal green dye for ${loot}!`
	}
];

const redDye = new ButtonBuilder()
	.setLabel('Abyssal red dye')
	.setStyle(ButtonStyle.Secondary)
	.setCustomId('ABBY_RED_DYE')
	.setEmoji(Emoji.Red);

const blueDye = new ButtonBuilder()
	.setLabel('Abyssal blue dye')
	.setStyle(ButtonStyle.Secondary)
	.setCustomId('ABBY_BLUE_DYE')
	.setEmoji(Emoji.Blue);

const greenDye = new ButtonBuilder()
	.setLabel('Abyssal green dye')
	.setStyle(ButtonStyle.Secondary)
	.setCustomId('ABBY_GREEN_DYE')
	.setEmoji(Emoji.Green);

for (const dye of dyeUsables) {
	usables.push({
		items: dye.items,
		run: async (user, channel, interaction) => {
			const components = [];

			await deferInteraction(interaction);

			// Only show the two dyes that doesn't match the dye being swapped
			switch (dye.name) {
				case 'Abyssal red dye': {
					components.push(blueDye, greenDye);
					break;
				}
				case 'Abyssal blue dye': {
					components.push(redDye, greenDye);
					break;
				}
				case 'Abyssal green dye': {
					components.push(redDye, blueDye);
					break;
				}
			}
			const str = `Select the Abyssal dye you would like to swap ${dye.name} with.`;
			const sentMessage = await channel.send({
				content: str,
				components: makeComponents(components)
			});

			try {
				const selection = await awaitMessageComponentInteraction({
					message: sentMessage,
					filter: i => {
						if (i.user.id !== user.id) {
							i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
							return false;
						}
						return true;
					},
					time: Time.Second * 15
				});

				const loot = new Bank();
				switch (selection.customId) {
					case 'ABBY_RED_DYE': {
						await user.transactItems({
							itemsToAdd: loot.add(getOSItem('Abyssal red dye')).freeze(),
							itemsToRemove: dye.cost,
							collectionLog: false
						});
						break;
					}
					case 'ABBY_BLUE_DYE': {
						await user.transactItems({
							itemsToAdd: loot.add(getOSItem('Abyssal blue dye')).freeze(),
							itemsToRemove: dye.cost,
							collectionLog: false
						});
						break;
					}
					case 'ABBY_GREEN_DYE': {
						await user.transactItems({
							itemsToAdd: loot.add(getOSItem('Abyssal green dye')).freeze(),
							itemsToRemove: dye.cost,
							collectionLog: false
						});
						break;
					}
				}
				await sentMessage.delete();
				return dye.response(loot);
			} catch (err) {
				await sentMessage.delete();
				return "You didn't select a dye in time.";
			}
		}
	});
}

export const allUsableItems = new Set(usables.map(i => i.items.map(i => i.id)).flat(2));

export async function useCommand(
	user: MUser,
	channel: TextChannel,
	interaction: ChatInputCommandInteraction,
	_firstItem: string,
	_secondItem?: string
) {
	const firstItem = getItem(_firstItem);
	const secondItem = _secondItem === undefined ? null : getItem(_secondItem);
	if (!firstItem || (_secondItem !== undefined && !secondItem)) return "That's not a valid item.";
	const items = [firstItem, secondItem].filter(notEmpty);
	assert(items.length === 1 || items.length === 2);

	const { bank } = user;
	const checkBank = new Bank();
	for (const i of items) checkBank.add(i.id);
	if (!bank.has(checkBank)) return `You don't own ${checkBank}.`;

	const usable = usables.find(i => i.items.length === items.length && i.items.every(t => items.includes(t)));
	if (!usable) return `That's not a usable ${items.length === 1 ? 'item' : 'combination'}.`;
	return usable.run(user, channel, interaction);
}
