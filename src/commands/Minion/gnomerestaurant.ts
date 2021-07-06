import { calcWhatPercent, randInt, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { GnomeRestaurantActivityTaskOptions } from '../../lib/types/minions';
import { addBanks, formatDuration, randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to work at the Gnome Restaurant.',
			examples: ['+gnomerestaurant'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: []
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		let deliveryLength = Time.Minute * 7;

		const itemsToRemove = new Bank();
		const gp = msg.author.settings.get(UserSettings.GP);
		if (gp < 5000) {
			return msg.channel.send('You need atleast 5k GP to work at the Gnome Restaurant.');
		}
		itemsToRemove.add('Coins', 5000);

		const boosts = [];

		const score = await msg.author.getMinigameScore('GnomeRestaurant');
		const scoreBoost = Math.min(100, calcWhatPercent(score, 100)) / 5;
		if (scoreBoost > 1) {
			deliveryLength = reduceNumByPercent(deliveryLength, scoreBoost);
			boosts.push(`${scoreBoost}% boost for experience in the minigame`);
		}

		// Reduce time if user has graceful/globetrotter equipped
		if (msg.author.hasGlobetrotterEquipped()) {
			deliveryLength = reduceNumByPercent(deliveryLength, 50);
			boosts.push('50% for having the Globetrotter Outfit');
		} else if (msg.author.hasGracefulEquipped()) {
			deliveryLength = reduceNumByPercent(deliveryLength, 25);
			boosts.push('25% for Graceful');
		}

		if (msg.author.skillLevel(SkillsEnum.Magic) >= 66) {
			deliveryLength = reduceNumByPercent(deliveryLength, 25);
			boosts.push('25% for 66 Magic (teleports)');
		}

		const bank = msg.author.bank();
		switch (randInt(1, 3)) {
			case 1: {
				if (msg.author.hasItemEquippedOrInBank('Amulet of eternal glory')) {
					deliveryLength = reduceNumByPercent(deliveryLength, 20);
					boosts.push('20% for Amulet of eternal glory');
				} else if (bank.has('Amulet of glory(6)')) {
					itemsToRemove.add('Amulet of glory(6)');
					deliveryLength = reduceNumByPercent(deliveryLength, 20);
					boosts.push('20% for Amulet of glory(6)');
				}
				break;
			}
			case 2: {
				if (bank.has('Ring of dueling(8)')) {
					itemsToRemove.add('Ring of dueling(8)');
					deliveryLength = reduceNumByPercent(deliveryLength, 20);
					boosts.push('20% for Ring of dueling(8)');
				}
				break;
			}
			case 3: {
				if (bank.has('Games necklace(8)')) {
					itemsToRemove.add('Games necklace(8)');
					deliveryLength = reduceNumByPercent(deliveryLength, 20);
					boosts.push('20% boost for Games necklace(8)');
				}
				break;
			}
		}

		const quantity = Math.floor(msg.author.maxTripLength(Activity.GnomeRestaurant) / deliveryLength);
		const duration = randomVariation(deliveryLength * quantity, 5);

		if (msg.author.skillLevel(SkillsEnum.Magic) >= 66) {
			itemsToRemove.add('Law rune', Math.max(1, Math.floor(randInt(1, quantity * 1.5) / 2)));
		}

		if (!msg.author.owns(itemsToRemove)) {
			return msg.channel.send(`You don't own the required items: ${itemsToRemove}.`);
		}

		await msg.author.removeItemsFromBank(itemsToRemove.bank);
		await this.client.settings.update(
			ClientSettings.EconomyStats.GnomeRestaurantCostBank,
			addBanks([
				this.client.settings.get(ClientSettings.EconomyStats.GnomeRestaurantCostBank),
				itemsToRemove.bank
			])
		);
		await addSubTaskToActivityTask<GnomeRestaurantActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.GnomeRestaurant,
			quantity,
			minigameID: 'GnomeRestaurant',
			gloriesRemoved: itemsToRemove.amount('Amulet of glory(6)')
		});

		let str = `${msg.author.minionName} is now working at the Gnome Restaurant for ${formatDuration(
			duration
		)}. Removed ${itemsToRemove} from your bank.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}
		return msg.channel.send(str);
	}
}
