import { randInt, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { getMinigameEntity } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randomVariation, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

const OuraniaBuyables = [
	{
		item: getOSItem('Master runecrafter hat'),
		cost: 250
	},
	{
		item: getOSItem('Master runecrafter robe'),
		cost: 350
	},
	{
		item: getOSItem('Master runecrafter skirt'),
		cost: 300
	},
	{
		item: getOSItem('Master runecrafter boots'),
		cost: 200
	},
	{
		item: getOSItem('Elder thread'),
		cost: 500
	},
	{
		item: getOSItem('Elder talisman'),
		cost: 350
	},
	{
		item: getOSItem('Magic crate'),
		cost: 115
	}
];

export default class ODSCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to complete Ourania Delivery Service trips, or buy rewards.',
			examples: ['+ods start'],
			subcommands: true,
			usage: '[start|buy] [qty:integer] [buyable:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		await msg.author.settings.sync(true);
		const minigames = await getMinigameEntity(msg.author.id);
		return msg.channel.send(`**Ourania Delivery Service** (ODS)

**Deliveries done:** ${minigames.OuraniaDeliveryService.toLocaleString()}
**Ourania Tokens:** ${msg.author.settings.get(UserSettings.OuraniaTokens).toLocaleString()}`);
	}

	async buy(msg: KlasaMessage, [qty = 1, input = '']: [number, string]) {
		const buyable = OuraniaBuyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.channel.send(
				`Here are the items you can buy: \n\n${OuraniaBuyables.map(
					i => `**${i.item.name}:** ${i.cost.toLocaleString()} points`
				).join('\n')}.`
			);
		}

		let { item, cost } = buyable;
		cost *= qty;
		const balance = msg.author.settings.get(UserSettings.OuraniaTokens);
		if (balance < cost) {
			return msg.channel.send(
				`You don't have enough Ourania Tokens to buy the ${qty.toLocaleString()}x ${
					item.name
				}. You need ${cost.toLocaleString()}, but you have only ${balance.toLocaleString()}.`
			);
		}

		await msg.author.settings.update(UserSettings.OuraniaTokens, balance - cost);
		await msg.author.addItemsToBank({ [item.id]: qty }, true);

		return msg.channel.send(
			`Successfully purchased ${qty.toLocaleString()}x ${item.name} for ${cost.toLocaleString()} Ourania Tokens.`
		);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage) {
		const boosts = [];

		let waveTime = randomVariation(Time.Minute * 4, 10);

		if (msg.author.hasItemEquippedAnywhere('Runecraft master cape')) {
			waveTime /= 2;
			boosts.push(`${Emoji.RunecraftMasterCape} 2x faster`);
		}

		const quantity = Math.floor(msg.author.maxTripLength(Activity.OuraniaDeliveryService) / waveTime);
		const duration = quantity * waveTime;
		const essenceRequired = quantity * randInt(235, 265);
		const cost = new Bank().add('Pure essence', essenceRequired);
		if (!msg.author.owns(cost)) {
			return msg.channel.send("You don't have enough Pure Essence to do Ourania Deliveries.");
		}

		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.ODSCost, cost);

		let str = `${
			msg.author.minionName
		} is now off to do ${quantity} deliveries. The total trip will take ${formatDuration(
			duration
		)}. Removed ${cost} from your bank.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.OuraniaDeliveryService,
			minigameID: 'OuraniaDeliveryService'
		});

		return msg.channel.send(str);
	}
}
