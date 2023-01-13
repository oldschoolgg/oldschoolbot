import { randInt, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { getPOHObject } from '../../lib/poh';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { getPOH } from '../lib/abstracted_commands/pohCommand';
import { OSBMahojiCommand } from '../lib/util';
import { getMahojiBank, mahojiUsersSettingsFetch } from '../mahojiSettings';

function reducedClueTime(clueTier: ClueTier, score: number) {
	// Every 3 hours become 1% better to a cap of 10%
	const percentReduced = Math.min(Math.floor(score / ((Time.Hour * 3) / clueTier.timeToFinish)), 10);
	const amountReduced = (clueTier.timeToFinish * percentReduced) / 100;
	const reducedTime = clueTier.timeToFinish - amountReduced;

	return [reducedTime, percentReduced];
}

export const clueCommand: OSBMahojiCommand = {
	name: 'clue',
	description: 'Send your minion to complete clue scrolls.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/clue tier:easy']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'tier',
			description: 'The clue you want to do.',
			required: true,
			autocomplete: async (_, user) => {
				const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id, { bank: true }));
				return ClueTiers.map(i => ({ name: `${i.name} (${bank.amount(i.scrollID)}x Owned)`, value: i.name }));
			}
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ tier: string }>) => {
		const user = await mUserFetch(userID);
		let quantity = 1;

		const clueTier = ClueTiers.find(
			tier => stringMatches(tier.id.toString(), options.tier) || stringMatches(tier.name, options.tier)
		);
		if (!clueTier) return 'Invalid clue tier.';

		const boosts = [];

		const [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			(user.user.openable_scores as ItemBank)[clueTier.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for Clue score`);

		let duration = timeToFinish * quantity;

		const maxTripLength = calcMaxTripLength(user, 'ClueCompletion');

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on Clue trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
				maxTripLength / timeToFinish
			)}.`;
		}

		const cost = new Bank().add(clueTier.scrollID, quantity);
		if (!user.owns(cost)) return `You don't own ${cost}.`;
		await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		const randomAddedDuration = randInt(1, 20);
		duration += (randomAddedDuration * duration) / 100;
		const poh = await getPOH(user.id);
		const hasOrnateJewelleryBox = poh.jewellery_box === getPOHObject('Ornate jewellery box').id;
		const hasJewelleryBox = poh.jewellery_box !== null;

		// Global boosts
		if (isWeekend()) {
			boosts.push('10% for Weekend');
			duration *= 0.9;
		}

		if (user.hasEquippedOrInBank('Max cape')) {
			boosts.push('10% for Max cape');
			duration *= 0.9;
		} else if (user.hasEquippedOrInBank('Construct. cape')) {
			boosts.push('6% for Construction cape');
			duration *= 0.94;
		}

		if (hasOrnateJewelleryBox) {
			boosts.push('10% for Ornate jewellery box');
			duration *= 0.9;
		} else if (hasJewelleryBox) {
			boosts.push('5% for Basic/Fancy jewellery box');
			duration *= 0.95;
		}

		// Specific boosts
		if (clueTier.name === 'Beginner') {
			if (user.hasEquippedOrInBank('Ring of the elements')) {
				boosts.push('10% for Ring of the elements');
				duration *= 0.9;
			}
		}

		if (clueTier.name === 'Easy') {
			if (user.hasEquippedOrInBank('Achievement diary cape')) {
				boosts.push('10% for Achievement diary cape');
				duration *= 0.9;
			}
			if (user.hasEquippedOrInBank('Ring of the elements')) {
				boosts.push('6% for Ring of the elements');
				duration *= 0.94;
			}
			if (user.owns('Master scroll book')) {
				boosts.push('6% for Master scroll book');
				duration *= 0.94;
			}
			if (user.hasEquippedOrInBank("Xeric's talisman")) {
				boosts.push("4% for Xeric's talisman");
				duration *= 0.96;
			}
		}

		if (clueTier.name === 'Medium') {
			if (user.owns('Master scroll book')) {
				boosts.push('10% for Master scroll book');
				duration *= 0.9;
			}
			if (user.hasEquippedOrInBank('Ring of the elements')) {
				boosts.push('8% for Ring of the elements');
				duration *= 0.92;
			}
			if (user.hasEquippedOrInBank("Xeric's talisman")) {
				boosts.push("6% for Xeric's talisman");
				duration *= 0.94;
			}
		}

		if (clueTier.name === 'Hard') {
			if (user.hasEquippedOrInBank('Achievement diary cape')) {
				boosts.push('10% for Achievement diary cape');
				duration *= 0.9;
			} else if (user.hasEquippedOrInBank('Wilderness sword 3')) {
				boosts.push('8% for Wilderness sword 3');
				duration *= 0.92;
			}
			if (user.owns('Royal seed pod')) {
				boosts.push('6% for Royal seed pod');
				duration *= 0.94;
			}
			if (user.owns('Eternal teleport crystal')) {
				boosts.push('4% for Eternal teleport crystal');
				duration *= 0.96;
			}
			if (user.owns("Pharaoh's sceptre")) {
				boosts.push("4% for Pharaoh's sceptre");
				duration *= 0.96;
			}
			if (user.hasEquippedOrInBank('Toxic blowpipe')) {
				boosts.push('4% for Toxic blowpipe');
				duration *= 0.96;
			}
		}

		if (clueTier.name === 'Elite') {
			if (user.hasEquippedOrInBank('Achievement diary cape')) {
				boosts.push('10% for Achievement diary cape');
				duration *= 0.9;
			} else {
				if (user.hasEquippedOrInBank('Kandarin headgear 4')) {
					boosts.push('7% for Kandarin headgear 4');
					duration *= 0.93;
				}
				if (user.hasEquippedOrInBank('Fremennik sea boots 4')) {
					boosts.push('3% for Fremennik sea boots 4');
					duration *= 0.97;
				}
			}

			if (user.owns("Pharaoh's sceptre")) {
				boosts.push("4% for Pharaoh's sceptre");
				duration *= 0.96;
			}
			if (user.hasEquippedOrInBank('Toxic blowpipe')) {
				boosts.push('4% for Toxic blowpipe');
				duration *= 0.96;
			}
		}

		if (clueTier.name === 'Master') {
			if (user.hasEquippedOrInBank('Achievement diary cape')) {
				boosts.push('10% for Achievement diary cape');
				duration *= 0.9;
			} else if (user.hasEquippedOrInBank('Kandarin headgear 4')) {
				boosts.push('6% for Kandarin headgear 4');
				duration *= 0.94;
			}
			if (user.owns('Eternal teleport crystal')) {
				boosts.push('3% for Eternal teleport crystal');
				duration *= 0.97;
			}
			if (user.hasEquippedOrInBank("Xeric's talisman")) {
				boosts.push("2% for Xeric's talisman");
				duration *= 0.98;
			}
			if (user.hasEquippedOrInBank('Toxic blowpipe')) {
				boosts.push('2% for Toxic blowpipe');
				duration *= 0.98;
			}
			if (user.hasEquippedOrInBank('Dragon claws')) {
				boosts.push('1% for Dragon claws');
				duration *= 0.99;
			}
		}

		await addSubTaskToActivityTask<ClueActivityTaskOptions>({
			clueID: clueTier.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'ClueCompletion'
		});
		return `${user.minionName} is now completing ${quantity}x ${
			clueTier.name
		} clues, it'll take around ${formatDuration(duration)} to finish.${
			boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}.` : ''
		}`;
	}
};
