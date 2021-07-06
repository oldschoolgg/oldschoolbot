import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity } from '../../lib/constants';
import { GearSetupType } from '../../lib/gear';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClueTier } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, rand, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

export const ClueHunterOutfit = resolveItems([
	'Helm of raedwald',
	'Clue hunter garb',
	'Clue hunter trousers',
	'Clue hunter boots',
	'Clue hunter gloves',
	'Clue hunter cloak'
]);

export const GlobetrottlerOutfit = resolveItems([
	'Globetrotter headress',
	'Globetrotter top',
	'Globetrotter legs',
	'Globetrotter boots',
	'Globetrotter gloves',
	'Globetrotter backpack'
]);

export function hasClueHunterEquipped(user: KlasaUser, setup: GearSetupType) {
	const gearSetup = user.getGear(setup);
	for (const [index, value] of ClueHunterOutfit.entries()) {
		// If the CHO exists, we check if the user has either of them equipped
		if (user.hasItemEquippedOrInBank(value)) {
			if (!gearSetup.hasEquipped([value, GlobetrottlerOutfit[index]])) {
				return false;
			}
		} else {
			return false;
		}
	}
	return true;
}

function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to complete a clue scroll.',
			examples: ['+mclue easy']
		});
	}

	invalidClue(msg: KlasaMessage): string {
		return `That isn't a valid clue tier, the valid tiers are: ${ClueTiers.map(tier => tier.name).join(
			', '
		)}. For example, \`${msg.cmdPrefix}minion clue 1 easy\``;
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, tierName]: [number | string, string]) {
		await msg.author.settings.sync(true);

		if (typeof quantity === 'string') {
			tierName = quantity;
			quantity = 1;
		}

		if (!tierName) return msg.channel.send(this.invalidClue(msg));

		const clueTier = ClueTiers.find(tier => stringMatches(tier.name, tierName));

		if (!clueTier) return msg.channel.send(this.invalidClue(msg));

		const boosts = [];

		if (
			clueTier.name === 'Grandmaster' &&
			(msg.author.settings.get(UserSettings.ClueScores)[19836] === undefined ||
				msg.author.settings.get(UserSettings.ClueScores)[19836] < 100)
		) {
			return msg.channel.send("You aren't experienced enough to complete a Grandmaster clue.");
		}

		let [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 1
		);

		timeToFinish /= 2;
		boosts.push('👻 2x Boost');

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for clue score`);

		let globetrotterReduction = 0;
		GlobetrottlerOutfit.forEach(item => {
			globetrotterReduction += msg.author.hasItemEquippedAnywhere(item) ? 0.05 : 0;
		});

		// Apply reduction for having the Globetrottler outfit equipped
		if (globetrotterReduction > 0) {
			const reductionPercent = globetrotterReduction === 0.3 ? 0.55 : globetrotterReduction;
			timeToFinish *= 1 - reductionPercent;
			boosts.push(
				`${Math.floor(reductionPercent * 100)}% Boost for having ${
					globetrotterReduction === 0.3
						? 'the Globetrotter outfit equipped'
						: `${Math.floor(globetrotterReduction / 0.05)}x pieces of the Globetrotter outfit equipped.`
				}`
			);
		}

		// Check for the clue hunter + globetrotter compatibility (globetrotter can act as clue hunter, as long the user
		// have the clue hunter outfit in the bank and vice-versa

		if (hasClueHunterEquipped(msg.author, 'skilling')) {
			timeToFinish /= 2;
			boosts.push('50% Boost for Clue hunter outfit');
		}

		let duration = timeToFinish * quantity;

		const maxTripLength = msg.author.maxTripLength(Activity.ClueCompletion);

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on Clue trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
					maxTripLength / timeToFinish
				)}.`
			);
		}

		const bank = msg.author.settings.get(UserSettings.Bank);
		const numOfScrolls = bank[clueTier.scrollID];

		if (!numOfScrolls || numOfScrolls < quantity) {
			return msg.channel.send(`You don't have ${quantity} ${clueTier.name} clue scrolls.`);
		}

		await msg.author.removeItemFromBank(clueTier.scrollID, quantity);

		const randomAddedDuration = rand(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		if (globetrotterReduction < 0.1 && msg.author.hasGracefulEquipped()) {
			boosts.push('10% for Graceful');
			duration *= 0.9;
		}

		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		if (
			// Has the achievement cape equipped
			msg.author.hasItemEquippedAnywhere(['Achievement diary cape', 'Achievement diary cape(t)'], false) ||
			// Or has the achievement cape in the bank/equipped and have the Globbletrotter backpack equipped
			((msg.author.hasItemEquippedOrInBank('Achievement diary cape') ||
				msg.author.hasItemEquippedOrInBank('Achievement diary cape(t)')) &&
				msg.author.hasItemEquippedAnywhere('Globetrotter backpack', false))
		) {
			boosts.push('10% for Achievement diary cape');
			duration *= 0.9;
		}

		await addSubTaskToActivityTask<ClueActivityTaskOptions>({
			clueID: clueTier.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.ClueCompletion
		});
		return msg.channel.send(
			`${msg.author.minionName} is now completing ${quantity}x ${
				clueTier.name
			} clues, it'll take around ${formatDuration(duration)} to finish.${
				boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}` : ''
			}`
		);
	}
}
