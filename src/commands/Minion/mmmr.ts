import { randArrItem, reduceNumByPercent, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Emoji } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import {
	fightingMessages,
	getMonkeyPhrase,
	getRandomMonkey,
	Monkey,
	monkeyEatables,
	monkeyHeadImage,
	monkeyTierOfUser,
	monkeyTiers,
	TOTAL_MONKEYS
} from '../../lib/monkeyRumble';
import { getMinigameEntity } from '../../lib/settings/settings';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MonkeyRumbleOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';

const buyables = monkeyTiers.map((t, index) => ({
	item: t.greegrees[0],
	gamesReq: t.gamesReq,
	strengthLevelReq: t.strengthLevelReq,
	cost: index === 0 ? 0 : Math.floor((index + 1) * 8.5),
	aliases: [t.name, t.greegrees[0].name]
}));

buyables.push({
	item: getOSItem('Banana enchantment scroll'),
	gamesReq: 0,
	strengthLevelReq: 0,
	cost: 200,
	aliases: ['bes', 'banana scroll', 'banana enchantment scroll']
});
buyables.push({
	item: getOSItem('Monkey dye'),
	gamesReq: 0,
	strengthLevelReq: 0,
	cost: 500,
	aliases: ['monkey dye']
});
buyables.push({
	item: getOSItem('Gorilla rumble greegree'),
	gamesReq: 1000,
	strengthLevelReq: 120,
	cost: 1000,
	aliases: ['gorilla greegree', 'gorilla rumble greegree']
});
buyables.push({
	item: getOSItem('Monkey crate'),
	gamesReq: 0,
	strengthLevelReq: 0,
	cost: 35,
	aliases: ['mc', 'monkey crate']
});

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'Sends your minion to do the Monkey Rumble minigame.',
			examples: ['=mr [start|buy]'],
			subcommands: true,
			usage: '[start|buy] [buyableOrGamble:...string]',
			usageDelim: ' ',
			aliases: ['mr', 'mmr', 'rumble']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const tier = monkeyTiers.find(t => t.id === monkeyTierOfUser(msg.author))!;
		const scores = await getMinigameEntity(msg.author.id);
		return msg.channel.send(
			`**Mad Marimbo's Monkey Rumble**

**Fights Done:** ${scores.MadMarimbosMonkeyRumble}
**Unique Monkeys Fought:** ${
				msg.author.settings.get(UserSettings.MonkeysFought).length
			}/${TOTAL_MONKEYS.toLocaleString()}
**Greegree Level:** ${tier.greegrees[0].name} - ${tier.id}/${monkeyTiers.length.toLocaleString()}
**Rumble tokens:** ${msg.author.bank().amount('Rumble token')}`
		);
	}

	async buy(msg: KlasaMessage, [input = '']: [string]) {
		const buyable = buyables.find(
			i => stringMatches(input, i.item.name) || i.aliases.some(a => stringMatches(a, input))
		);

		const score = await msg.author.getMinigameScore('MadMarimbosMonkeyRumble');

		if (!buyable) {
			return msg.channel.send(
				`You have ${msg.author.bank().amount('Rumble token')} Rumble tokens, and have done ${score} fights.

Here are the items you can buy: \n\n${buyables
					.map(
						i =>
							`**${i.item.name}:** ${i.cost} Rumble Tokens${
								i.gamesReq > 0 ? ` (${i.gamesReq} fights)` : ''
							}`
					)
					.join('\n')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Strength) < buyable.strengthLevelReq) {
			return msg.channel.send(`You need atleast level ${buyable.strengthLevelReq} Strength to buy this.`);
		}

		let beginnerGreegree = getOSItem('Beginner rumble greegree');
		if (buyable.item === beginnerGreegree) {
			if (msg.author.hasItemEquippedOrInBank('Beginner rumble greegree')) {
				return msg.channel.send('You already have one.');
			}
			await msg.author.addItemsToBank({ [beginnerGreegree.id]: 1 }, true);
			return msg.channel.send({
				files: [
					await chatHeadImage({
						head: 'wurMuTheMonkey',
						content:
							'Take this beginner rumble greegree for free! Any higher tier and you have to pay in Rumble tokens!!'
					})
				]
			});
		}

		if (score < buyable.gamesReq) {
			return msg.channel.send(
				`You need to have completed atleast ${
					buyable.gamesReq
				} rumble matches before you can buy this, you have ${buyable.gamesReq - score} remaining.`
			);
		}

		const { item, cost } = buyable;
		const bank = msg.author.bank();
		const balance = bank.amount('Rumble token');
		if (balance < cost) {
			return msg.channel.send(
				`You don't have enough Rumble tokens to buy the ${item.name}. You need ${cost}, but you have only ${balance}.`
			);
		}

		await msg.author.removeItemsFromBank(new Bank().add('Rumble token', cost));
		await msg.author.addItemsToBank({ [item.id]: 1 }, true);

		return msg.channel.send(`Successfully purchased 1x ${item.name} for ${cost} Rumble tokens.`);
	}

	@minionNotBusy
	@requiresMinion
	async start(msg: KlasaMessage) {
		if (!msg.author.hasItemEquippedAnywhere("M'speak amulet")) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						head: 'wurMuTheMonkey',
						content: getMonkeyPhrase()
					})
				]
			});
		}

		if (
			!monkeyTiers
				.map(t => t.greegrees)
				.flat(2)
				.some(t => msg.author.hasItemEquippedAnywhere(t.id))
		) {
			return msg.channel.send({
				content: `You need to have a rumble greegree equipped. If you don't have a rumble greegree yet, you can buy one using \`${msg.cmdPrefix}mr buy beginner rumble greegree\`.`,
				files: [
					await chatHeadImage({
						head: 'wurMuTheMonkey',
						content: "Humans aren't allowed! Leave, leave!"
					})
				]
			});
		}

		const boosts = [];

		let fightDuration = Time.Minute * 9;
		if (msg.author.hasItemEquippedOrInBank('Strength master cape')) {
			fightDuration = reduceNumByPercent(fightDuration, 15);
			boosts.push('15% faster fights for strength master cape');
		}
		const quantity = Math.floor(msg.author.maxTripLength(Activity.MonkeyRumble) / fightDuration);
		let duration = quantity * fightDuration;

		let chanceOfSpecial = Math.floor(150 * (6 - monkeyTierOfUser(msg.author) / 2));
		if (msg.author.hasItemEquippedAnywhere('Big banana')) {
			chanceOfSpecial = reduceNumByPercent(chanceOfSpecial, 5);
			boosts.push('10% higher chance of purple monkeys');
		}
		const monkeysToFight: Monkey[] = [];
		for (let i = 0; i < quantity; i++) {
			monkeysToFight.push(getRandomMonkey(monkeysToFight, chanceOfSpecial));
		}
		monkeysToFight.sort((a, b) => (a.special === b.special ? 0 : a.special ? -1 : 1));
		let foodRequired = Math.floor(duration / (Time.Minute * 1.34));
		if (msg.author.hasItemEquippedAnywhere('Big banana')) {
			foodRequired = reduceNumByPercent(foodRequired, 25);
			foodRequired = Math.floor(foodRequired);
			boosts.push('25% less food from Big banana');
		}

		const bank = msg.author.bank();
		const eatable = monkeyEatables.find(e => bank.amount(e.item.id) >= foodRequired);

		if (!eatable) {
			return msg.channel.send(
				`You don't have enough food to fight. In your monkey form, you can only eat certain items (${monkeyEatables
					.map(i => i.item.name + (i.boost ? ` (${i.boost}% boost)` : ''))
					.join(', ')}). For this trip, you'd need ${foodRequired} of one of these items.`
			);
		}
		if (eatable.boost) {
			duration = reduceNumByPercent(duration, eatable.boost);
			boosts.push(`${eatable.boost}% for ${eatable.item.name} food`);
		}
		const cost = new Bank().add(eatable.item.id, foodRequired);
		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.MonkeyRumbleCost, cost);

		await addSubTaskToActivityTask<MonkeyRumbleOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.MonkeyRumble,
			minigameID: 'MadMarimbosMonkeyRumble',
			monkeys: monkeysToFight
		});

		let str = `You are fighting ${quantity}x different monkeys (${monkeysToFight
			.map(m => `${m.special ? `${Emoji.Purple} ` : ''}${m.name}`)
			.join(', ')}). The trip will take ${formatDuration(
			duration
		)}. Removed ${cost} from your bank. **1 in ${chanceOfSpecial} chance of a monkey being special, with ${quantity} monkeys in this trip, there was a 1 in ${(
			chanceOfSpecial / quantity
		).toFixed(2)} chance that one of them would be special.**`;
		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return msg.channel.send({
			content: str,
			files: [await monkeyHeadImage({ monkey: monkeysToFight[0], content: randArrItem(fightingMessages) })]
		});
	}
}
