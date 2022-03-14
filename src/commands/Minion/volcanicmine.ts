import { objectEntries, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { minionNotBusy } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export const VolcanicMineGameTime = Time.Minute * 10;

const VolcanicMineShop: { name: string; output: ItemBank; cost: number; clOnly?: boolean }[] = [
	{
		name: 'Iron ore',
		output: resolveNameBank({ 'Iron ore': 1 }),
		cost: 30
	},
	{
		name: 'Silver ore',
		output: resolveNameBank({ 'Silver ore': 1 }),
		cost: 55
	},
	{
		name: 'Coal',
		output: resolveNameBank({ Coal: 1 }),
		cost: 60
	},
	{
		name: 'Gold ore',
		output: resolveNameBank({ 'Gold ore': 1 }),
		cost: 150
	},
	{
		name: 'Mithril ore',
		output: resolveNameBank({ 'Mithril ore': 1 }),
		cost: 150
	},
	{
		name: 'Adamantite ore',
		output: resolveNameBank({ 'Adamantite ore': 1 }),
		cost: 300
	},
	{
		name: 'Runite ore',
		output: resolveNameBank({ 'Runite ore': 1 }),
		cost: 855
	},
	{
		name: 'Volcanic ash',
		output: resolveNameBank({ 'Volcanic ash': 1 }),
		cost: 40
	},
	{
		name: 'Calcite',
		output: resolveNameBank({ Calcite: 1 }),
		cost: 70
	},
	{
		name: 'Pyrophosphite',
		output: resolveNameBank({ Pyrophosphite: 1 }),
		cost: 70
	},
	{
		name: 'Volcanic mine teleport',
		output: resolveNameBank({ 'Volcanic mine teleport': 1 }),
		cost: 200
	},
	{
		name: 'Large water container',
		output: resolveNameBank({ 'Large water container': 1 }),
		cost: 10_000,
		clOnly: true
	},
	{
		name: 'Ash covered tome',
		output: resolveNameBank({ 'Ash covered tome': 1 }),
		cost: 40_000,
		clOnly: true
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[shop] [numberOfGames|quantity:int] [item:...string]',
			subcommands: true,
			usageDelim: ' ',
			categoryFlags: ['minion'],
			aliases: ['vm'],
			description: 'Participate in games on the Volcanic Mine.',
			examples: ['+volcanicmine', '+vm 1']
		});
	}

	async shop(msg: KlasaMessage, [quantity = 1, item = '']: [number, string]) {
		const currentUserPoints = msg.author.settings.get(UserSettings.VolcanicMinePoints);
		if (!item) {
			return msg.channel.send(`You currently have ${currentUserPoints.toLocaleString()} Volcanic Mine points.`);
		}

		const shopItem = VolcanicMineShop.find(f => stringMatches(f.name, item));
		if (!shopItem) {
			return msg.channel.send(
				`This is not a valid item to buy. These are the items that can be bought using Volcanic Mine points: ${VolcanicMineShop.map(
					v => v.name
				).join(', ')}`
			);
		}
		if (quantity * shopItem.cost > currentUserPoints) {
			return msg.channel.send(
				`You don't have enough points to buy ${quantity.toLocaleString()}x ${shopItem.name}. ${
					currentUserPoints < shopItem.cost
						? "You don't have enough points for any of this item."
						: `You only have enough for ${Math.floor(currentUserPoints / shopItem.cost).toLocaleString()}`
				}`
			);
		}
		await msg.confirm(
			`Are you sure you want to spent **${(
				quantity * shopItem.cost
			).toLocaleString()}** Volcanic Mine points to buy **${quantity.toLocaleString()}x ${shopItem.name}**?`
		);

		if (shopItem.clOnly) {
			await msg.author.addItemsToCollectionLog({ items: new Bank().add(shopItem.output).multiply(quantity) });
		} else {
			await msg.author.addItemsToBank({
				items: new Bank().add(shopItem.output).multiply(quantity),
				collectionLog: true
			});
		}
		await msg.author.settings.update(UserSettings.VolcanicMinePoints, currentUserPoints - shopItem.cost * quantity);

		return msg.channel.send(
			`You sucessfully bought **${quantity.toLocaleString()}x ${shopItem.name}** for ${(
				shopItem.cost * quantity
			).toLocaleString()} Volcanic Mine points.${
				shopItem.clOnly
					? `\n${quantity > 1 ? 'These items were' : 'This item was'} directly added to your collection log.`
					: ''
			}`
		);
	}

	@minionNotBusy
	async run(msg: KlasaMessage, [numberOfGames = undefined]: [number | undefined]) {
		const skillReqs = {
			[SkillsEnum.Prayer]: 70,
			[SkillsEnum.Hitpoints]: 70,
			[SkillsEnum.Mining]: 50
		};
		if (!msg.author.hasSkillReqs(skillReqs)[0]) {
			return msg.channel.send(
				`You are not skilled enough to participate in the Volcanic Mine. You need the following requirements: ${objectEntries(
					skillReqs
				)
					.map(s => {
						return msg.author.skillLevel(s[0]) < s[1]
							? formatSkillRequirements({ [s[0]]: s[1] }, true)
							: undefined;
					})
					.filter(f => f)
					.join(', ')}`
			);
		}
		const maxGamesUserCanDo = Math.floor(msg.author.maxTripLength() / VolcanicMineGameTime);
		if (!numberOfGames || numberOfGames > maxGamesUserCanDo) numberOfGames = maxGamesUserCanDo;
		const userMiningLevel = msg.author.skillLevel(SkillsEnum.Mining);
		const userPrayerLevel = msg.author.skillLevel(SkillsEnum.Prayer);
		const userHitpointsLevel = msg.author.skillLevel(SkillsEnum.Hitpoints);
		const userSkillingGear = msg.author.getGear('skilling');
		const boosts: string[] = [];

		const suppliesUsage = new Bank()
			.add('Saradomin brew (4)', userHitpointsLevel < 80 ? 3 : 2)
			.add('Prayer potion (4)', 1)
			.add('Numulite', 30);

		// Activity boosts
		if (userMiningLevel >= 71 && userSkillingGear.hasEquipped('Crystal pickaxe')) {
			boosts.push(
				`50% boost for having a ${userSkillingGear.equippedWeapon()?.name ?? 'Crystal pickaxe'} equipped.`
			);
		} else if (userMiningLevel >= 61 && userSkillingGear.hasEquipped('Dragon pickaxe')) {
			boosts.push(
				`30% boost for having a ${userSkillingGear.equippedWeapon()?.name ?? 'Dragon pickaxe'} equipped.`
			);
		}

		if (
			userSkillingGear.hasEquipped(
				['Prospector helmet', 'Prospector jacket', 'Prospector legs', 'Prospector boots'],
				true
			)
		) {
			boosts.push('2.5% more Mining XP for having the Propector outfit equipped.');
		}

		if (userSkillingGear.hasEquipped('Elysian spirit shield')) {
			suppliesUsage.remove('Saradomin brew (4)', 1);
			boosts.push('Lower Saradomin Brew usage for having an Elysian spirit shield equipped.');
		}

		if (userPrayerLevel >= 90 || (userSkillingGear.hasEquipped('Dragonbone necklace') && userPrayerLevel >= 80)) {
			suppliesUsage.remove('Prayer potion (4)', 1);
			boosts.push(
				userPrayerLevel >= 90
					? 'No prayer potion usage for having 90+ Prayer.'
					: 'No prayer potion usage for having 80+ prayer and a Dragonbone necklace equipped.'
			);
		}

		suppliesUsage.multiply(numberOfGames);
		if (!msg.author.owns(suppliesUsage)) {
			return msg.channel.send(
				`You don't have all the required supplies for this number of games. You need ${suppliesUsage} for ${numberOfGames} games of Volcanic Mine.`
			);
		}

		await msg.author.removeItemsFromBank(suppliesUsage);

		let duration = VolcanicMineGameTime * numberOfGames;

		const str = `${
			msg.author.minionName
		} is now playing ${numberOfGames}x games of Volcanic Mine. It will be back in ${formatDuration(duration)}.${
			boosts.length > 0 ? `\n**Boosts**\n${boosts.join('\n')}` : ''
		}\n**Supply Usage:** ${suppliesUsage}`;

		await addSubTaskToActivityTask<ActivityTaskOptionsWithQuantity>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: numberOfGames,
			duration,
			type: 'VolcanicMine'
		});

		return msg.channel.send(str);
	}
}
