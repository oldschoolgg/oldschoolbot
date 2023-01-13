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

		// Global Boosts
		const globalBoosts = [
			{
				condition: isWeekend,
				boost: '10% for Weekend',
				durationMultiplier: 0.9
			},
			{
				condition: () => user.hasEquippedOrInBank('Max cape'),
				boost: '10% for Max cape',
				durationMultiplier: 0.9
			},
			{
				condition: () => !user.hasEquippedOrInBank('Max cape') && user.hasEquippedOrInBank('Construct. cape'),
				boost: '6% for Construction cape',
				durationMultiplier: 0.94
			},
			{
				condition: () => hasOrnateJewelleryBox,
				boost: '10% for Ornate jewellery box',
				durationMultiplier: 0.9
			},
			{
				condition: () => !hasOrnateJewelleryBox && hasJewelleryBox,
				boost: '5% for Basic/Fancy jewellery box',
				durationMultiplier: 0.95
			}
		];

		// Specific boosts
		const beginnerBoosts = {
			'Ring of the elements': {
				boost: '10% for Ring of the elements',
				durationMultiplier: 0.9
			}
		};

		const easyBoosts = {
			'Achievement diary cape': {
				boost: '10% for Achievement diary cape',
				durationMultiplier: 0.9
			},
			'Ring of the elements': {
				boost: '6% for Ring of the elements',
				durationMultiplier: 0.94
			},
			'Master scroll book': {
				boost: '6% for Master scroll book',
				durationMultiplier: 0.94
			},
			"Xeric's talisman": {
				boost: "4% for Xeric's talisman",
				durationMultiplier: 0.96
			}
		};

		const mediumBoosts = {
			'Master scroll book': {
				boost: '10% for Master scroll book',
				durationMultiplier: 0.9
			},
			'Ring of the elements': {
				boost: '8% for Ring of the elements',
				durationMultiplier: 0.92
			},
			"Xeric's talisman": {
				boost: "6% for Xeric's talisman",
				durationMultiplier: 0.94
			}
		};

		const hardBoosts = {
			'Achievement diary cape': {
				boost: '10% for Achievement diary cape',
				durationMultiplier: 0.9
			},
			'Wilderness sword 3': {
				boost: '8% for Wilderness sword 3',
				durationMultiplier: 0.92
			},
			'Royal seed pod': {
				boost: '6% for Royal seed pod',
				durationMultiplier: 0.94
			},
			'Eternal teleport crystal': {
				boost: '4% for Eternal teleport crystal',
				durationMultiplier: 0.96
			},
			"Pharaoh's sceptre": {
				boost: "4% for Pharaoh's sceptre",
				durationMultiplier: 0.96
			},
			'Toxic blowpipe': {
				boost: '4% for Toxic blowpipe',
				durationMultiplier: 0.96
			}
		};

		const eliteBoosts = {
			'Achievement diary cape': {
				boost: '10% for Achievement diary cape',
				durationMultiplier: 0.9
			},
			'Kandarin headgear 4': {
				boost: '7% for Kandarin headgear 4',
				durationMultiplier: 0.93
			},
			'Fremennik sea boots 4': {
				boost: '3% for Fremennik sea boots 4',
				durationMultiplier: 0.97
			},
			"Pharaoh's sceptre": {
				boost: "4% for Pharaoh's sceptre",
				durationMultiplier: 0.96
			},
			'Toxic blowpipe': {
				boost: '4% for Toxic blowpipe',
				durationMultiplier: 0.96
			}
		};

		const masterBoosts = {
			'Achievement diary cape': {
				boost: '10% for Achievement diary cape',
				durationMultiplier: 0.9
			},
			'Kandarin headgear 4': {
				boost: '6% for Kandarin headgear 4',
				durationMultiplier: 0.94
			},
			'Eternal teleport crystal': {
				boost: '3% for Eternal teleport crystal',
				durationMultiplier: 0.97
			},
			"Xeric's talisman": {
				boost: "2% for Xeric's talisman",
				durationMultiplier: 0.98
			},
			'Toxic blowpipe': {
				boost: '2% for Toxic blowpipe',
				durationMultiplier: 0.98
			},
			'Dragon claws': {
				boost: '1% for Dragon claws',
				durationMultiplier: 0.99
			}
		};

		globalBoosts.forEach(({ condition, boost, durationMultiplier }) => {
			if (condition()) {
				boosts.push(boost);
				duration *= durationMultiplier;
			}
		});

		if (clueTier.name === 'Beginner') {
			for (const [item, boost] of Object.entries(beginnerBoosts)) {
				if (user.hasEquippedOrInBank(item)) {
					boosts.push(boost.boost);
					duration *= boost.durationMultiplier;
				}
			}
		}

		if (clueTier.name === 'Easy') {
			for (const [item, boost] of Object.entries(easyBoosts)) {
				if (user.hasEquippedOrInBank(item) || user.owns(item)) {
					boosts.push(boost.boost);
					duration *= boost.durationMultiplier;
				}
			}
		}

		if (clueTier.name === 'Medium') {
			for (const [item, boost] of Object.entries(mediumBoosts)) {
				if (user.hasEquippedOrInBank(item) || user.owns(item)) {
					boosts.push(boost.boost);
					duration *= boost.durationMultiplier;
				}
			}
		}

		if (clueTier.name === 'Hard') {
			let hasAchievementDiaryCape = false;
			for (const [item, boost] of Object.entries(hardBoosts)) {
				if (user.hasEquippedOrInBank(item) || user.owns(item)) {
					if (item !== 'Wilderness sword 3' || !hasAchievementDiaryCape) {
						boosts.push(boost.boost);
						duration *= boost.durationMultiplier;
					}
					if (item === 'Achievement diary cape') {
						hasAchievementDiaryCape = true;
					}
				}
			}
		}

		if (clueTier.name === 'Elite') {
			let hasAchievementDiaryCape = false;
			for (const [item, boost] of Object.entries(eliteBoosts)) {
				if (user.hasEquippedOrInBank(item) || user.owns(item)) {
					if (
						(item !== 'Kandarin headgear 4' && item !== 'Fremennik sea boots 4') ||
						!hasAchievementDiaryCape
					) {
						boosts.push(boost.boost);
						duration *= boost.durationMultiplier;
					}
					if (item === 'Achievement diary cape') {
						hasAchievementDiaryCape = true;
					}
				}
			}
		}

		if (clueTier.name === 'Master') {
			let hasAchievementDiaryCape = false;
			for (const [item, boost] of Object.entries(masterBoosts)) {
				if (user.hasEquippedOrInBank(item) || user.owns(item)) {
					if (item !== 'Kandarin headgear 4' || !hasAchievementDiaryCape) {
						boosts.push(boost.boost);
						duration *= boost.durationMultiplier;
					}
					if (item === 'Achievement diary cape') {
						hasAchievementDiaryCape = true;
					}
				}
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
