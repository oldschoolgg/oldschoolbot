import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Activity, Emoji } from '../../lib/constants';
import { Eatable, Eatables } from '../../lib/data/eatables';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Cooking, { Cookables } from '../../lib/skilling/skills/cooking';
import { Cookable, SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to cook food.',
			categoryFlags: ['minion', 'skilling'],
			examples: ['+cook manta ray', '+cook 50 shrimps']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, cookableName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			cookableName = quantity;
			quantity = null;
		}

		if (cookableName.includes('bait')) {
			return this.bait(msg, [quantity, cookableName]);
		}

		await msg.author.settings.sync(true);
		const cookable = Cooking.Cookables.find(
			cookable =>
				stringMatches(cookable.name, cookableName) || stringMatches(cookable.name.split(' ')[0], cookableName)
		);

		if (!cookable) {
			return msg.channel.send(
				`Thats not a valid item to cook. Valid cookables are ${Cooking.Cookables.map(
					cookable => cookable.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Cooking) < cookable.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${cookable.level} Cooking to cook ${cookable.name}s.`
			);
		}

		const hasRemy = msg.author.equippedPet() === itemID('Remy');

		// Based off catherby fish/hr rates
		let timeToCookSingleCookable = Time.Second * 2.88;
		if (cookable.id === itemID('Jug of wine') || cookable.id === itemID('Wine of zamorak')) {
			timeToCookSingleCookable /= 1.6;
		} else if (msg.author.hasItemEquippedAnywhere(itemID('Cooking master cape'))) {
			timeToCookSingleCookable /= 5;
		} else if (hasRemy) {
			timeToCookSingleCookable /= 2;
		} else if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven gauntlets'))) {
			timeToCookSingleCookable /= 3;
		}

		const userBank = msg.author.bank();
		const inputCost = new Bank(cookable.inputCookables);

		const maxTripLength = msg.author.maxTripLength(Activity.Cooking);

		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToCookSingleCookable);
			const max = userBank.fits(inputCost);
			if (max < quantity && max !== 0) quantity = max;
		}

		const totalCost = inputCost.clone().multiply(quantity);

		if (!userBank.fits(totalCost)) {
			return msg.channel.send(`You don't have enough items. You need: ${inputCost}.`);
		}

		const duration = quantity * timeToCookSingleCookable;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)} minutes, try a lower quantity. The highest amount of ${cookable.name}s you can cook is ${Math.floor(
					maxTripLength / timeToCookSingleCookable
				)}.`
			);
		}

		await msg.author.removeItemsFromBank(totalCost);

		await addSubTaskToActivityTask<CookingActivityTaskOptions>({
			cookableID: cookable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Cooking
		});

		return msg.channel.send(
			`${msg.author.minionName} is now cooking ${quantity}x ${cookable.name}, it'll take around ${formatDuration(
				duration
			)} to finish. ${
				hasRemy
					? "\n<:remy:748491189925183638> Remy jumps on your minions' head to help them with their cooking!"
					: ''
			}`
		);
	}

	@minionNotBusy
	@requiresMinion
	async bait(msg: KlasaMessage, [quantity, foodName = '']: [null | number | string, string]) {
		if (!foodName) {
			foodName = String(quantity);
			quantity = 0;
		}

		// Remove the bait param
		foodName = foodName.substr(foodName.indexOf(' ')).trim();

		// Force qty type to number
		quantity = Number(quantity);

		const cookingLevel = msg.author.skillLevel(SkillsEnum.Cooking);

		// Get possible raw foods and how much their cooked version heals
		const rawFoods: [Eatable, Item, Cookable][] = [];
		Cookables.forEach(c => {
			// Only allow 1 input raw food
			if (Object.keys(c.inputCookables).length === 1) {
				const rawFood = new Bank(c.inputCookables);
				const eatable = Eatables.find(e => e.id === c.id);
				if (eatable) rawFoods.push([eatable, rawFood.items()[0][0], c]);
			}
		});

		const food = rawFoods.find(r => {
			return (
				// Search by full name
				stringMatches(r[1].name, foodName) ||
				// If the food second word (raw usually is the first) is the same as the search
				stringMatches(r[1].name.split(' ')[1] ?? '', foodName) ||
				// Or if the name contains the search
				r[1].name.toLowerCase().includes(foodName.toLowerCase())
			);
		});

		if (!food) {
			return msg.channel.send(
				`That's not a valid food to cut. Here are a list of all available foods to cut into bait: ${rawFoods
					.map(food => food[1].name)
					.join(', ')}.`
			);
		}

		if (food[2].level > cookingLevel) {
			return msg.channel.send(
				`You are not skilled enough to transform this into bait. You need ${food[2].level} ${Emoji.Cooking} cooking for that.`
			);
		}

		let worstFood: number = Number.MAX_SAFE_INTEGER;

		Eatables.forEach(f => {
			if (f.healAmount < worstFood) {
				worstFood = f.healAmount;
			}
		});

		const maxTripLength = msg.author.maxTripLength(Activity.BaitCutting);

		const boosts: string[] = [];

		// Calculate boosts
		let possibleOutcomeBoost = 0;
		// Having high cooking
		if (msg.author.skillLevel(SkillsEnum.Cooking) >= 99) {
			possibleOutcomeBoost += 0.1;
			if (msg.author.hasItemEquippedAnywhere(itemID('Cooking master cape'))) {
				possibleOutcomeBoost += 0.1;
				boosts.push('20% for having a Cooking master cape equipped');
			} else {
				boosts.push('10% for being a great cooker');
			}
		}
		// Having a dwarven knife
		if (msg.author.hasItemEquippedOrInBank('Dwarven knife')) {
			possibleOutcomeBoost += 0.15;
			boosts.push('15% for owning a Dwarven knife');
		}
		// Having Pet?
		if (msg.author.equippedPet() === itemID('Remy')) {
			possibleOutcomeBoost += 0.25;
			boosts.push('25% for having Remi helping you');
		}

		// 3 Ticks per action
		const timePerFood = (3 * 0.6 * 1000) / (1 + possibleOutcomeBoost);

		// Extra quantity that can be done in the same triplength
		let duration = 0;
		let extra = '';

		// If no quantity provided, set it to the max.
		if (quantity === 0) {
			const amountOfFoodOwned = msg.author.bank().amount(food[1].id);
			if (!amountOfFoodOwned) return msg.channel.send(`You have no ${food[1].name}s in your bank..`);
			quantity = Math.min(Math.floor(maxTripLength / timePerFood), amountOfFoodOwned);
			if (quantity === amountOfFoodOwned) {
				extra += ' (That is all you have in bank!)';
			}
		}

		// Get duration
		duration = quantity * timePerFood;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${food[1].name}s you can turn into bait is ${Math.floor(
					maxTripLength / timePerFood
				)}.`
			);
		}

		await msg.confirm(
			`Are you sure you want to transform ${quantity}x ${
				food[1].name
			}${extra} into raw bait? This trip will take around ${formatDuration(duration)}.`
		);

		const toRemove = new Bank().add(food[1].id, quantity);
		await msg.author.removeItemsFromBank(toRemove);

		await addSubTaskToActivityTask<CookingActivityTaskOptions>({
			cookableID: food[0].id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.BaitCutting
		});

		return msg.channel.send(
			`${msg.author.minionName} is now cutting ${toRemove} into raw bait. It'll take around ${formatDuration(
				duration
			)} to finish. ${boosts.length > 0 ? `\n\n${boosts.join(', ')}` : ''}`
		);
	}
}
