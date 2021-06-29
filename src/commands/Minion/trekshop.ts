import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import TrekShopItems, { TrekExperience } from '../../lib/data/buyables/trekBuyables';
import { rewardTokens } from '../../lib/minions/data/templeTrekking';
import { AddXpParams } from '../../lib/minions/types';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { percentChance, rand, reduceNumByPercent, stringMatches } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<easy|medium|hard> [quantity:integer{1,2147483647}] [item:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
			altProtection: true,
			aliases: ['ts'],
			categoryFlags: ['minion'],
			description: 'Allows you to redeem reward tokens from Temple Trekking.',
			examples: ['+ts easy bowstring', '+ts 5 hard herbs']
		});
	}

	async run(msg: KlasaMessage, [type = 'easy', quantity, name]: ['easy' | 'medium' | 'hard', number, string]) {
		const user = msg.author;
		await user.settings.sync(true);

		const userBank = user.bank();

		if (name === undefined) {
			return msg.channel.send(
				`Item is required. Possible items: ${TrekShopItems.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		const specifiedItem = TrekShopItems.find(
			item =>
				stringMatches(name, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!specifiedItem) {
			return msg.channel.send(
				`Item not recognized. Possible items: ${TrekShopItems.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		if (quantity === undefined) {
			quantity =
				type === 'easy'
					? userBank.amount(rewardTokens.easy)
					: type === 'medium'
					? userBank.amount(rewardTokens.medium)
					: userBank.amount(rewardTokens.hard);
		}

		if (quantity === 0) {
			return msg.channel.send("You don't have enough reward tokens for that.");
		}

		let outItems = new Bank();

		let inItems = new Bank();

		let outXP: AddXpParams[] = [
			{
				skillName: SkillsEnum.Agility,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Thieving,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Slayer,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Firemaking,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Fishing,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Woodcutting,
				amount: 0,
				minimal: true
			},
			{
				skillName: SkillsEnum.Mining,
				amount: 0,
				minimal: true
			}
		];

		for (let i = 0; i < quantity; i++) {
			let outputTotal = 0;

			switch (type) {
				case 'easy':
					inItems.addItem(rewardTokens.easy, 1);
					outputTotal = rand(specifiedItem.easyRange[0], specifiedItem.easyRange[1]);
					break;
				case 'medium':
					inItems.addItem(rewardTokens.medium, 1);
					outputTotal = rand(specifiedItem.medRange[0], specifiedItem.medRange[1]);
					break;
				case 'hard':
					inItems.addItem(rewardTokens.hard, 1);
					outputTotal = rand(specifiedItem.hardRange[0], specifiedItem.hardRange[1]);
					break;
			}

			if (specifiedItem.name === 'Herbs') {
				outItems.add(
					percentChance(50) ? 'Tarromin' : 'Harralander',
					Math.floor(reduceNumByPercent(outputTotal, 34))
				);
				outItems.add('Toadflax', Math.floor(reduceNumByPercent(outputTotal, 66)));
			} else if (specifiedItem.name === 'Ore') {
				outItems.add('Coal', Math.floor(reduceNumByPercent(outputTotal, 34)));
				outItems.add('Iron ore', Math.floor(reduceNumByPercent(outputTotal, 66)));
			} else if (specifiedItem.name === 'Experience') {
				const randXP = Math.floor(Math.random() * TrekExperience.length) + 1;

				(outXP.find(item => item.skillName === TrekExperience[randXP]) || outXP[0]).amount += outputTotal;
			} else {
				outItems.add(specifiedItem.name, outputTotal);
			}
		}

		if (!userBank.has(inItems.bank)) {
			return msg.channel.send("You don't have enough reward tokens for that.");
		}

		await msg.confirm(
			`${user}, please confirm that you want to use ${quantity} ${type} reward tokens to buy sets of ${specifiedItem.name}.`
		);

		// Remove tokens and give loot:
		await user.exchangeItemsFromBank({
			costBank: inItems,
			lootBank: outItems,
			collectionLog: true
		});

		let ret = `You redeemed **${inItems}** for `;
		if (outItems.length > 0) {
			ret += `**${outItems}**`;
		} else {
			ret += 'XP. You received: ';
		}

		ret += (await Promise.all(outXP.filter(xp => xp.amount > 0).map(xp => user.addXP(xp)))).join(', ');

		return msg.channel.send(`${ret}.`);
	}
}
