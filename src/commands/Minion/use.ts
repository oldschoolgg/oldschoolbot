import { randInt, Time } from 'e';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { bossActiveIsActiveOrSoonActive, bossEvents, startBossEvent } from '../../lib/bossEvents';
import { BitField } from '../../lib/constants';
import { addToDoubleLootTimer } from '../../lib/doubleLoot';
import { dyedItems } from '../../lib/dyedItems';
import { monkeyTiers } from '../../lib/monkeyRumble';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';

const combinedUsables = [
	{
		items: ['Knife', 'Turkey'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			await msg.author.removeItemsFromBank(new Bank().add('Turkey'));
			await msg.author.addItemsToBank({ items: new Bank().add('Turkey drumstick', 3), collectionLog: true });
			return msg.channel.send('You cut your Turkey into 3 drumsticks!');
		}
	},
	{
		items: ['Shiny mango', 'Magus scroll'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			await msg.author.removeItemsFromBank(new Bank().add('Shiny mango').add('Magus scroll'));
			await msg.author.addItemsToBank({ items: new Bank().add('Magical mango'), collectionLog: true });
			return msg.channel.send('You enchanted your Shiny mango into a Magical mango!');
		}
	},
	{
		items: ['Blabberbeak', 'Mango'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			return msg.channel.send("Blabberbeak won't eat it.");
		}
	},
	{
		items: ['Blabberbeak', 'Shiny mango'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			return msg.channel.send("Blabberbeak won't eat it.");
		}
	},
	{
		items: ['Blabberbeak', 'Magical mango'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			if (
				!monkeyTiers
					.map(t => t.greegrees)
					.flat(2)
					.some(t => msg.author.hasItemEquippedAnywhere(t.id))
			) {
				return msg.channel.send("Blabberbeak doesn't trust you, they won't eat it.");
			}
			await msg.author.removeItemsFromBank(new Bank().add('Magical mango').add('Blabberbeak'));
			await msg.author.addItemsToBank({ items: new Bank().add('Mangobeak'), collectionLog: true });
			return msg.channel.send(
				'You fed a Magical mango to Blabberbeak, and he transformed into a weird-looking mango bird, oops.'
			);
		}
	},
	{
		items: ['Candle', 'Celebratory cake'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			await msg.author.removeItemsFromBank(new Bank().add('Candle').add('Celebratory cake'));
			await msg.author.addItemsToBank({
				items: new Bank().add('Celebratory cake with candle'),
				collectionLog: true
			});
			return msg.channel.send('You stick a candle in your cake.');
		}
	},
	{
		items: ['Tinderbox', 'Celebratory cake with candle'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			await msg.author.removeItemsFromBank(new Bank().add('Celebratory cake with candle'));
			await msg.author.addItemsToBank({ items: new Bank().add('Lit celebratory cake'), collectionLog: true });
			return msg.channel.send('You light the candle in your cake.');
		}
	},
	{
		items: ['Klik', 'Celebratory cake with candle'].map(getOSItem),
		run: async (msg: KlasaMessage) => {
			await msg.author.removeItemsFromBank(new Bank().add('Celebratory cake with candle'));
			await msg.author.addItemsToBank({ items: new Bank().add('Burnt celebratory cake'), collectionLog: true });
			return msg.channel.send('You try to get Klik to light the candle... but he burnt the cake..');
		}
	}
];

const usables = [
	{
		item: getOSItem('Scroll of farming'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasScrollOfFarming)) {
				return msg.channel.send('You have already unlocked the Scroll of farming.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Scroll of farming'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasScrollOfFarming);
			return msg.channel.send(
				'You have used your Scroll of farming - you feel your Farming skills have improved and are now able to use more Farming patches.'
			);
		}
	},
	{
		item: getOSItem('Scroll of longevity'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasScrollOfLongevity)) {
				return msg.channel.send('You have already unlocked the Scroll of longevity.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Scroll of longevity'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasScrollOfLongevity);
			return msg.channel.send(
				'You have used your Scroll of longevity - your future slayer tasks will always have 2x more quantity.'
			);
		}
	},
	{
		item: getOSItem('Scroll of the hunt'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasScrollOfTheHunt)) {
				return msg.channel.send('You have already unlocked the Scroll of the hunt.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Scroll of the hunt'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasScrollOfTheHunt);
			return msg.channel.send(
				'You have used your Scroll of the hunt - you feel your hunting skills have improved.'
			);
		}
	},
	{
		item: getOSItem('Banana enchantment scroll'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasBananaEnchantmentScroll)) {
				return msg.channel.send('You have already used a Banana enchantment scroll.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Banana enchantment scroll'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasBananaEnchantmentScroll);
			return msg.channel.send(
				'You have used your Banana enchantment scroll - you feel your monkey magic skills have improved.'
			);
		}
	},
	{
		item: getOSItem('Daemonheim agility pass'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasDaemonheimAgilityPass)) {
				return msg.channel.send('You have already used a Daemonheim agility pass.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Daemonheim agility pass'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasDaemonheimAgilityPass);
			return msg.channel.send(
				'You show your pass to the Daemonheim guards, and they grant you access to their rooftops.'
			);
		}
	},
	{
		item: getOSItem('Mysterious token'),
		run: async (msg: KlasaMessage) => {
			if ((await bossActiveIsActiveOrSoonActive()) || !msg.client.owners.has(msg.author)) {
				return msg.channel.send("You can't use your Mysterious token right now.");
			}
			await startBossEvent({
				boss: bossEvents.find(b => b.id === 93_898_458)!,
				client: msg.client as KlasaClient
			});
			await msg.author.removeItemsFromBank(new Bank().add('Mysterious token'));
			return msg.channel.send('You used your Mysterious token... I wonder what will happen?');
		}
	},
	{
		item: getOSItem('Torn prayer scroll'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasTornPrayerScroll)) {
				return msg.channel.send('You have already used a Torn prayer scroll.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Torn prayer scroll'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasTornPrayerScroll);
			return msg.channel.send('You used your Torn prayer scroll, and unlocked the Preserve prayer.');
		}
	},
	{
		item: getOSItem('Dexterous prayer scroll'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasDexScroll)) {
				return msg.channel.send('You have already used a Dexterous prayer scroll.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Dexterous prayer scroll'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasDexScroll);
			return msg.channel.send('You used your Dexterous prayer scroll, and unlocked the Rigour prayer.');
		}
	},
	{
		item: getOSItem('Arcane prayer scroll'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasArcaneScroll)) {
				return msg.channel.send('You have already used a Arcane prayer scroll.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Arcane prayer scroll'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasArcaneScroll);
			return msg.channel.send('You used your Arcane prayer scroll, and unlocked the Augury prayer.');
		}
	},
	{
		item: getOSItem('Slepey tablet'),
		run: async (msg: KlasaMessage) => {
			const bits = msg.author.bitfield;
			if (bits.includes(BitField.HasSlepeyTablet)) {
				return msg.channel.send('You have already used a Slepey tablet.');
			}
			await msg.author.removeItemsFromBank(new Bank().add('Slepey tablet'));
			await msg.author.settings.update(UserSettings.BitField, BitField.HasSlepeyTablet);
			return msg.channel.send('You used your Slepey tablet, and unlocked the Slepe teleport.');
		}
	},
	{
		item: getOSItem('Double loot token'),
		run: async (msg: KlasaMessage) => {
			await addToDoubleLootTimer(
				msg.client as KlasaClient,
				Time.Minute * randInt(6, 36),
				`${msg.author} used a Double Loot token!`
			);
			await msg.author.removeItemsFromBank(new Bank().add('Double loot token'));
			return msg.channel.send('You used your Double Loot Token!');
		}
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<item:...string>',
			cooldown: 5,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [firstItemStr]: [string]) {
		const bank = msg.author.bank();

		// Combined Usables
		const items = firstItemStr
			.split(',')
			.map(part => part.trim().toLowerCase())
			.map(getOSItem);

		// Redying
		if (items.length === 2) {
			// e.g. [Blood Dye, Dwarven warhammer (blood)]
			const baseItem = dyedItems.find(i => i.dyedVersions.some(o => items.includes(o.item)));
			const dyeToApply = baseItem?.dyedVersions.find(i => items.includes(i.dye));
			const dyedVariantTheyHave = baseItem?.dyedVersions.find(i => items.includes(i.item));
			if (baseItem && dyeToApply && dyedVariantTheyHave) {
				await msg.confirm(
					`Are you sure you want to use a ${dyeToApply.dye.name} on your ${dyedVariantTheyHave.item.name}?`
				);
				const cost = new Bank().add(dyedVariantTheyHave.item.id).add(dyeToApply.dye.id);
				if (!msg.author.owns(cost)) {
					return msg.channel.send("You don't own that.");
				}
				await msg.author.removeItemsFromBank(cost);
				await msg.author.addItemsToBank({ items: new Bank().add(dyeToApply.item.id), collectionLog: false });
				return msg.channel.send(
					`You redyed your ${dyedVariantTheyHave.item.name} into a ${dyeToApply.item.name} using a ${dyeToApply.dye.name}.`
				);
			}
		}

		const combinedUsable = combinedUsables.find(
			i => i.items.length === items.length && i.items.every(item => items.includes(item))
		);
		if (combinedUsable) {
			if (combinedUsable.items.some(i => !msg.author.owns(i.id))) {
				return msg.channel.send("You don't own these items.");
			}
			return combinedUsable.run(msg);
		}

		const firstItem = getOSItem(firstItemStr);
		const usable = usables.find(u => u.item === firstItem);
		if (!usable) {
			return msg.channel.send("That's not a usable item.");
		}

		if (!bank.has(firstItem.id)) {
			return msg.channel.send("You don't own this item.");
		}

		return usable.run(msg);
	}
}
