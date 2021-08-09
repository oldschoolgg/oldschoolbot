import { reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MinigameActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

let itemBoosts = [
	[getOSItem('Abyssal whip'), 12],
	[getOSItem('Barrows gloves'), 4],
	[getOSItem('Amulet of fury'), 5],
	[getOSItem('Fire cape'), 6]
] as const;

export type PestControlBoat = ['veteran' | 'intermediate' | 'novice', 3 | 4 | 5];

export function getBoatType(cbLevel: number): PestControlBoat {
	if (cbLevel >= 100) return ['veteran', 5];
	if (cbLevel >= 70) return ['intermediate', 4];
	return ['novice', 3];
}

let baseStats = {
	attack: 42,
	strength: 42,
	defence: 42,
	hitpoints: 42,
	ranged: 42,
	magic: 42,
	prayer: 22
};

const pestControlBuyables = [
	{
		item: getOSItem('Void knight mace'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight top'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight robe'),
		cost: 250,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void knight gloves'),
		cost: 150,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void melee helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void mage helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void ranger helm'),
		cost: 200,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Void seal(8)'),
		cost: 10,
		requiredStats: baseStats
	},
	{
		item: getOSItem('Elite void robe'),
		cost: 200,
		inputItem: getOSItem('Void knight robe'),
		requiredStats: baseStats
	},
	{
		item: getOSItem('Elite void top'),
		cost: 200,
		inputItem: getOSItem('Void knight top'),
		requiredStats: baseStats
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to do pest control.',
			examples: ['+pestcontrol', '+pc'],
			categoryFlags: ['minion', 'minigame'],
			subcommands: true,
			aliases: ['pc'],
			usage: '[start|buy] [quantity:int{1}|str:...str]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage) {
		const points = msg.author.settings.get(UserSettings.PestControlPoints);
		const kc = await msg.author.getMinigameScore('PestControl');
		return msg.channel.send(`You have ${points} Void knight commendation points.
You have completed ${kc} games of Pest Control.`);
	}

	@requiresMinion
	@minionNotBusy
	async start(msg: KlasaMessage, [quantity]: [number | undefined]) {
		const { combatLevel } = msg.author;
		if (combatLevel < 40) {
			return msg.channel.send('You need a combat level of atleast 40 to do Pest Control.');
		}

		let gameLength = Time.Minute * 2.8;
		const maxLength = msg.author.maxTripLength(Activity.PestControl);

		let boosts = [];
		const gear = msg.author.getGear('melee');
		for (const [item, percent] of itemBoosts) {
			if (gear.hasEquipped(item.name)) {
				gameLength = reduceNumByPercent(gameLength, percent);
				boosts.push(`${percent}% for ${item.name}`);
			}
		}
		if (!quantity || quantity * gameLength > maxLength) {
			quantity = Math.floor(maxLength / gameLength);
		}

		let duration = quantity * gameLength;

		await addSubTaskToActivityTask<MinigameActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.PestControl,
			quantity,
			minigameID: 'PestControl'
		});

		let [boat] = getBoatType(combatLevel);

		let str = `${
			msg.author.minionName
		} is now doing ${quantity}x Pest Control games on the ${boat} boat. The trip will take ${formatDuration(
			duration
		)}.`;

		if (boosts.length > 0) {
			str += `\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send(str);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		console.log(input);
		if (typeof input !== 'string') input = '';
		const buyable = pestControlBuyables.find(i => stringMatches(input, i.item.name));
		if (!buyable) {
			return msg.channel.send(
				`Here are the items you can buy: \n\n${pestControlBuyables
					.map(i => `**${i.item.name}:** ${i.cost} points`)
					.join('\n')}.`
			);
		}

		const { item, cost } = buyable;
		const balance = msg.author.settings.get(UserSettings.PestControlPoints);
		if (balance < cost) {
			return msg.channel.send(
				`You don't have enough Void knight commendation points to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		let [hasReqs, str] = msg.author.hasSkillReqs(buyable.requiredStats);
		if (!hasReqs) {
			return msg.channel.send(`You need ${str} to buy this item.`);
		}
		await msg.author.settings.update(UserSettings.PestControlPoints, balance - cost);

		if (buyable.inputItem && !msg.author.owns(buyable.inputItem.id)) {
			return msg.channel.send(`This item requires that you own a ${buyable.inputItem.name}.`);
		}

		if (buyable.inputItem) {
			await msg.author.removeItemsFromBank(new Bank().add(buyable.inputItem.id));
		}
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.channel.send(`Successfully purchased 1x ${item.name} for ${cost} Void knight commendation points.`);
	}
}
