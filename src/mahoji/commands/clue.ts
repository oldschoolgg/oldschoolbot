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

function shouldApplyBoost(clueTierName: string, item: string, hasAchievementDiaryCape: boolean) {
	switch (clueTierName) {
		case 'Elite':
			return (item !== 'Kandarin headgear 4' && item !== 'Fremennik sea boots 4') || !hasAchievementDiaryCape;
		case 'Master':
			return item !== 'Kandarin headgear 4' || !hasAchievementDiaryCape;
		case 'Hard':
			return item !== 'Wilderness sword 3' || !hasAchievementDiaryCape;
		default:
			return true;
	}
}

interface ClueBoost {
	item: string;
	boost: string;
	durationMultiplier: number;
}

function applyClueBoosts(user: MUser, boostList: ClueBoost[], boosts: any[], duration: number, clueTierName: string) {
	let hasAchievementDiaryCape = false;
	boostList.forEach(boost => {
		if (user.hasEquippedOrInBank(boost.item)) {
			if (shouldApplyBoost(clueTierName, boost.item, hasAchievementDiaryCape)) {
				boosts.push(boost.boost);
				duration *= boost.durationMultiplier;
			}
			if (boost.item === 'Achievement diary cape') {
				hasAchievementDiaryCape = true;
			}
		}
	});
	return { duration, boosts };
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

		const randomAddedDuration = randInt(1, 20);
		duration += (randomAddedDuration * duration) / 100;

		const cost = new Bank().add(clueTier.scrollID, quantity);
		if (!user.owns(cost)) return `You don't own ${cost}.`;
		await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		const poh = await getPOH(user.id);
		const hasOrnateJewelleryBox = poh.jewellery_box === getPOHObject('Ornate jewellery box').id;
		const hasJewelleryBox = poh.jewellery_box !== null;

		// Global Boosts
		const globalBoosts = [
			{
				condition: isWeekend,
				boost: '10% for Weekend',
				durationMultiplier: 1
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

		globalBoosts.forEach(({ condition, boost, durationMultiplier }) => {
			if (condition()) {
				boosts.push(boost);
				duration *= durationMultiplier;
			}
		});

		// Specific boosts
		const clueTierBoosts: { [index: string]: ClueBoost[] } = {
			Beginner: [
				{
					item: 'Ring of the elements',
					boost: '10% for Ring of the elements',
					durationMultiplier: 0.9
				}
			],
			Easy: [
				{
					item: 'Achievement diary cape',
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: 'Ring of the elements',
					boost: '6% for Ring of the elements',
					durationMultiplier: 0.94
				},
				{
					item: 'Master scroll book',
					boost: '6% for Master scroll book',
					durationMultiplier: 0.94
				},
				{
					item: "Xeric's talisman",
					boost: "4% for Xeric's talisman",
					durationMultiplier: 0.96
				}
			],

			Medium: [
				{ item: 'Master scroll book', boost: '10% for Master scroll book', durationMultiplier: 0.9 },
				{
					item: 'Ring of the elements',
					boost: '8% for Ring of the elements',
					durationMultiplier: 0.92
				},
				{ item: "Xeric's talisman", boost: "6% for Xeric's talisman", durationMultiplier: 0.94 }
			],
			Hard: [
				{
					item: 'Achievement diary cape',
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: 'Wilderness sword 3',
					boost: '8% for Wilderness sword 3',
					durationMultiplier: 0.92
				},
				{
					item: 'Royal seed pod',
					boost: '6% for Royal seed pod',
					durationMultiplier: 0.94
				},
				{
					item: 'Eternal teleport crystal',
					boost: '4% for Eternal teleport crystal',
					durationMultiplier: 0.96
				},
				{
					item: "Pharaoh's sceptre",
					boost: "4% for Pharaoh's sceptre",
					durationMultiplier: 0.96
				},
				{
					item: 'Toxic blowpipe',
					boost: '4% for Toxic blowpipe',
					durationMultiplier: 0.96
				}
			],
			Elite: [
				{
					item: 'Achievement diary cape',
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: 'Kandarin headgear 4',
					boost: '7% for Kandarin headgear 4',
					durationMultiplier: 0.93
				},
				{
					item: 'Fremennik sea boots 4',
					boost: '3% for Fremennik sea boots 4',
					durationMultiplier: 0.97
				},
				{
					item: "Pharaoh's sceptre",
					boost: "4% for Pharaoh's sceptre",
					durationMultiplier: 0.96
				},
				{
					item: 'Toxic blowpipe',
					boost: '4% for Toxic blowpipe',
					durationMultiplier: 0.96
				}
			],
			Master: [
				{
					item: 'Achievement diary cape',
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: 'Kandarin headgear 4',
					boost: '6% for Kandarin headgear 4',
					durationMultiplier: 0.94
				},
				{
					item: 'Eternal teleport crystal',
					boost: '3% for Eternal teleport crystal',
					durationMultiplier: 0.97
				},
				{
					item: "Xeric's talisman",
					boost: "2% for Xeric's talisman",
					durationMultiplier: 0.98
				},
				{
					item: 'Toxic blowpipe',
					boost: '2% for Toxic blowpipe',
					durationMultiplier: 0.98
				},
				{
					item: 'Dragon claws',
					boost: '1% for Dragon claws',
					durationMultiplier: 0.99
				}
			]
		};

		const clueTierName = clueTier.name;
		const boostList = clueTierBoosts[clueTierName];
		const result = applyClueBoosts(user, boostList, boosts, duration, clueTierName);

		duration = result.duration;

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
