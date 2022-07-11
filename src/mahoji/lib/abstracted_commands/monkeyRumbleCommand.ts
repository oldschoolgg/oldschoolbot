import { randArrItem, reduceNumByPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
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
} from '../../../lib/monkeyRumble';
import { getMinigameEntity } from '../../../lib/settings/minigames';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { mahojiChatHead } from '../../../lib/util/chatHeadImage';

export async function monkeyRumbleStatsCommand(user: KlasaUser) {
	const tier = monkeyTiers.find(t => t.id === monkeyTierOfUser(user))!;
	const scores = await getMinigameEntity(user.id);
	return `**Mad Marimbo's Monkey Rumble**

**Fights Done:** ${scores.monkey_rumble}
**Unique Monkeys Fought:** ${user.settings.get(UserSettings.MonkeysFought).length}/${TOTAL_MONKEYS.toLocaleString()}
**Greegree Level:** ${tier.greegrees[0].name} - ${tier.id}/${monkeyTiers.length.toLocaleString()}
**Rumble tokens:** ${user.bank().amount('Rumble token')}`;
}

export async function monkeyRumbleCommand(user: KlasaUser, channelID: bigint): CommandResponse {
	if (!user.hasItemEquippedAnywhere("M'speak amulet")) {
		return {
			...(await mahojiChatHead({
				head: 'wurMuTheMonkey',
				content: getMonkeyPhrase()
			}))
		};
	}

	if (
		!monkeyTiers
			.map(t => t.greegrees)
			.flat(2)
			.some(t => user.hasItemEquippedAnywhere(t.id))
	) {
		return {
			content:
				"You need to have a rumble greegree equipped. If you don't have a rumble greegree yet, just buy the Beginner Rumble Greegree with the buy command.",
			...(await mahojiChatHead({
				head: 'wurMuTheMonkey',
				content: "Humans aren't allowed! Leave, leave!"
			}))
		};
	}

	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}

	const boosts = [];

	let fightDuration = Time.Minute * 9;
	if (user.hasItemEquippedOrInBank('Strength master cape')) {
		fightDuration = reduceNumByPercent(fightDuration, 17);
		boosts.push('17% faster fights for strength master cape');
	}
	if (user.hasItemEquippedAnywhere('Gorilla rumble greegree')) {
		fightDuration = reduceNumByPercent(fightDuration, 17);
		boosts.push('17% faster fights for gorilla rumble greegree');
	}
	const quantity = Math.floor(user.maxTripLength('MonkeyRumble') / fightDuration);
	let duration = quantity * fightDuration;

	let chanceOfSpecial = Math.floor(125 * (6 - monkeyTierOfUser(user) / 2));
	if (user.hasItemEquippedAnywhere('Big banana')) {
		chanceOfSpecial = reduceNumByPercent(chanceOfSpecial, 12);
		boosts.push('12% higher chance of purple monkeys from Big banana');
	}
	if (user.hasItemEquippedAnywhere('Ring of luck')) {
		chanceOfSpecial = reduceNumByPercent(chanceOfSpecial, 4);
		boosts.push('4% higher chance of purple monkeys from ring of luck');
	}
	const monkeysToFight: Monkey[] = [];
	for (let i = 0; i < quantity; i++) {
		monkeysToFight.push(getRandomMonkey(monkeysToFight, chanceOfSpecial));
	}
	monkeysToFight.sort((a, b) => (a.special === b.special ? 0 : a.special ? -1 : 1));
	let foodRequired = Math.floor(duration / (Time.Minute * 1.34));
	if (user.hasItemEquippedAnywhere('Big banana')) {
		foodRequired = reduceNumByPercent(foodRequired, 25);
		foodRequired = Math.floor(foodRequired);
		boosts.push('25% less food from Big banana');
	}

	const bank = user.bank();
	const eatable = monkeyEatables.find(e => bank.amount(e.item.id) >= foodRequired);

	if (!eatable) {
		return `You don't have enough food to fight. In your monkey form, you can only eat certain items (${monkeyEatables
			.map(i => i.item.name + (i.boost ? ` (${i.boost}% boost)` : ''))
			.join(', ')}). For this trip, you'd need ${foodRequired} of one of these items.`;
	}
	if (eatable.boost) {
		duration = reduceNumByPercent(duration, eatable.boost);
		boosts.push(`${eatable.boost}% for ${eatable.item.name} food`);
	}
	const cost = new Bank().add(eatable.item.id, foodRequired);
	await user.removeItemsFromBank(cost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.MonkeyRumbleCost, cost);

	await addSubTaskToActivityTask<MonkeyRumbleOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		duration,
		type: 'MonkeyRumble',
		minigameID: 'monkey_rumble',
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

	return {
		content: str,
		attachments: [
			{
				fileName: 'monkey.png',
				buffer: await monkeyHeadImage({ monkey: monkeysToFight[0], content: randArrItem(fightingMessages) })
			}
		]
	};
}
