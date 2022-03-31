import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { formatDuration, randFloat, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';

const buyables = [
	{
		item: getOSItem('Angler hat'),
		cost: 100,
		aliases: []
	},
	{
		item: getOSItem('Angler top'),
		cost: 100,
		aliases: []
	},
	{
		item: getOSItem('Angler waders'),
		cost: 100,
		aliases: ['angler legs']
	},
	{
		item: getOSItem('Angler boots'),
		cost: 100,
		aliases: []
	},
	{
		item: getOSItem('Pearl fishing rod'),
		cost: 100,
		aliases: []
	},
	{
		item: getOSItem('Pearl fly fishing rod'),
		cost: 120,
		aliases: ['pearl fly rod']
	},
	{
		item: getOSItem('Pearl barbarian rod'),
		cost: 150,
		aliases: ['pearl barb rod']
	},
	{
		item: getOSItem('Fish sack'),
		cost: 1000,
		aliases: []
	}
];

const sellables = [
	{
		item: getOSItem('Golden tench'),
		cost: 100,
		aliases: []
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[buy|sell|run] [name:...string|tripTime:int{1}]',
			subcommands: true,
			usageDelim: ' ',
			aliases: ['aerial', 'af'],
			description: 'Sends your minion to aerial fish, allowing you to get the angler outfit.',
			examples: ['+aerialfishing 30', '+aerialfishing buy fish sack'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [tripTime]: [number | string | undefined]) {
		const maxTripLength = msg.author.maxTripLength('AerialFishing');

		if (typeof tripTime !== 'number') {
			tripTime = Math.floor(maxTripLength / Time.Minute);
		}
		await msg.author.settings.sync(true);

		if (msg.author.skillLevel(SkillsEnum.Fishing) < 43 || msg.author.skillLevel(SkillsEnum.Hunter) < 35) {
			return msg.channel.send('You need atleast level 35 Hunter and 43 Fishing to do Aerial fishing.');
		}

		if (!Number(tripTime)) {
			return msg.channel.send(
				`Specify a valid trip length for example \`${msg.cmdPrefix}aerialfish 10\` will send you out on a 10 minute trip.`
			);
		}

		let tripLength = Time.Minute * tripTime;

		if (tripLength > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(
					maxTripLength / Time.Minute
				)}.`
			);
		}

		const randValue = randFloat(1.85, 2.15);
		const quantity = tripLength / (randValue * Time.Second);
		const duration = quantity * (randValue * Time.Second);

		await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'AerialFishing'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now doing Aerial fishing, it will take around ${formatDuration(
				duration
			)} to finish.`
		);
	}

	@requiresMinion
	async buy(msg: KlasaMessage, [itemName = '']: [string]) {
		const buyable = buyables.find(
			i => stringMatches(itemName, i.item.name) || i.aliases.some(alias => stringMatches(alias, itemName))
		);

		if (!buyable) {
			return msg.channel.send(
				`Here are the items you can buy: \n\n${buyables
					.map(i => `**${i.item.name}:** ${i.cost} Molch pearls`)
					.join('\n')}.`
			);
		}
		await msg.author.settings.sync(true);
		const bank = msg.author.bank();
		const amountPearlsHas = bank.amount('Molch pearl');
		if (amountPearlsHas === 0) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content:
							'You have no Molch pearls, but here is a joke... \nWhere do fish keep their money? \nIn a riverbank. Hehe!',
						head: 'alry'
					})
				]
			});
		}
		if (amountPearlsHas < buyable.cost) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "You don't have enough Molch pearls.",
						head: 'alry'
					})
				]
			});
		}
		await msg.author.removeItemsFromBank(new Bank().add('Molch pearl', buyable.cost));
		await msg.author.addItemsToBank({ items: { [buyable.item.id]: 1 }, collectionLog: true });
		return msg.channel.send(`Successfully purchased 1x ${buyable.item.name} for ${buyable.cost}x Molch pearls.`);
	}

	@requiresMinion
	async sell(msg: KlasaMessage, [itemName = '']: [string]) {
		const sellable = sellables.find(
			i => stringMatches(itemName, i.item.name) || i.aliases.some(alias => stringMatches(alias, itemName))
		);

		if (!sellable) {
			return msg.channel.send(
				`Here are the items you can sell: \n\n${sellables
					.map(i => `**${i.item.name}:** ${i.cost} Molch pearls`)
					.join('\n')}.`
			);
		}
		await msg.author.settings.sync(true);
		const bank = msg.author.bank();
		const amount = bank.amount(sellable.item.name);
		if (amount < 1) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: `You have no ${sellable.item.name}.`,
						head: 'alry'
					})
				]
			});
		}
		await msg.author.removeItemsFromBank(new Bank().add(sellable.item.id, 1));
		await msg.author.addItemsToBank({ items: new Bank().add('Molch pearl', sellable.cost), collectionLog: true });
		return msg.channel.send(`Successfully sold 1x ${sellable.item.name} for ${sellable.cost}x Molch pearls.`);
	}
}
