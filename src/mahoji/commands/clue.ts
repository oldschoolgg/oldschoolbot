import { clamp, randInt, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { ClueTier, ClueTiers } from '../../lib/clues/clueTiers';
import { clueHunterOutfit } from '../../lib/data/CollectionsExport';
import { getPOHObject } from '../../lib/poh';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { calcClueScores, formatDuration, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import getOSItem from '../../lib/util/getOSItem';
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

function shouldApplyBoost(clueTier: ClueTier, item: string, hasAchievementDiaryCape: boolean) {
	switch (clueTier.name) {
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
	item: Item;
	boost: string;
	durationMultiplier: number;
}

function applyClueBoosts(user: MUser, boostList: ClueBoost[], boosts: string[], duration: number, clueTier: ClueTier) {
	let hasAchievementDiaryCape = false;
	for (const boost of boostList) {
		if (user.hasEquippedOrInBank(boost.item.name)) {
			if (shouldApplyBoost(clueTier, boost.item.name, hasAchievementDiaryCape)) {
				boosts.push(boost.boost);
				duration *= boost.durationMultiplier;
			}
			if (boost.item.name === 'Achievement diary cape') {
				hasAchievementDiaryCape = true;
			}
		}
	}
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
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to do.',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ tier: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);

		const clueTier = ClueTiers.find(
			tier => stringMatches(tier.id.toString(), options.tier) || stringMatches(tier.name, options.tier)
		);
		if (!clueTier) return 'Invalid clue tier.';

		if (clueTier.name === 'Grandmaster') {
			const clueScores = await calcClueScores(user);
			for (const { tier, actualOpened } of clueScores) {
				if (actualOpened < tier.qtyForGrandmasters) {
					return `You're too inexperienced to complete Grandmaster clues, you need to complete ${tier.qtyForGrandmasters} ${tier.name} clues first.`;
				}
			}

			if (user.QP < 250) return 'You need atleast 250 QP to do Grandmaster clues.';

			for (const [key, value] of Object.entries(user.skillsAsLevels)) {
				if (value < 90) {
					return `You need atleast level 90 in all skills to do Grandmaster clues, you have level ${value} ${key}.`;
				}
			}
		}

		const maxTripLength = calcMaxTripLength(user, 'ClueCompletion');

		const boosts = [];
		const stats = await user.fetchStats({ openable_scores: true });

		let [timeToFinish, percentReduced] = reducedClueTime(
			clueTier,
			(stats.openable_scores as ItemBank)[clueTier.id] ?? 1
		);

		if (percentReduced >= 1) boosts.push(`${percentReduced}% for Clue score`);
		const poh = await getPOH(user.id);
		const hasOrnateJewelleryBox = poh.jewellery_box === getPOHObject('Ornate jewellery box').id;
		const hasJewelleryBox = poh.jewellery_box !== null;
		const hasXericTalisman = poh.amulet === getPOHObject("Mounted xeric's talisman").id;

		// Global Boosts
		const globalBoosts = [
			{
				condition: () => true,
				boost: '👻 2x Boost',
				durationMultiplier: 0.5
			},
			{
				condition: () => user.hasEquippedOrInBank(clueHunterOutfit, 'every'),
				boost: '2x Boost for Clue hunter outfit',
				durationMultiplier: 0.5
			},
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

		for (const { condition, boost, durationMultiplier } of globalBoosts) {
			if (condition()) {
				boosts.push(boost);
				timeToFinish *= durationMultiplier;
			}
		}

		// Xeric's Talisman boost
		if (clueTier.name === 'Medium' && hasXericTalisman) {
			boosts.push("2% for Mounted Xeric's Talisman");
			timeToFinish *= 0.98;
		}

		// Specific boosts
		const clueTierBoosts: Record<ClueTier['name'], ClueBoost[]> = {
			Beginner: [
				{
					item: getOSItem('Ring of the elements'),
					boost: '10% for Ring of the elements',
					durationMultiplier: 0.9
				}
			],
			Easy: [
				{
					item: getOSItem('Achievement diary cape'),
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: getOSItem('Ring of the elements'),
					boost: '6% for Ring of the elements',
					durationMultiplier: 0.94
				}
			],
			Medium: [
				{
					item: getOSItem('Ring of the elements'),
					boost: '8% for Ring of the elements',
					durationMultiplier: 0.92
				}
			],
			Hard: [
				{
					item: getOSItem('Achievement diary cape'),
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: getOSItem('Wilderness sword 3'),
					boost: '8% for Wilderness sword 3',
					durationMultiplier: 0.92
				},
				{
					item: getOSItem('Royal seed pod'),
					boost: '6% for Royal seed pod',
					durationMultiplier: 0.94
				},
				{
					item: getOSItem('Eternal teleport crystal'),
					boost: '4% for Eternal teleport crystal',
					durationMultiplier: 0.96
				},
				{
					item: getOSItem("Pharaoh's sceptre"),
					boost: "4% for Pharaoh's sceptre",
					durationMultiplier: 0.96
				},
				{
					item: getOSItem('Toxic blowpipe'),
					boost: '4% for Toxic blowpipe',
					durationMultiplier: 0.96
				}
			],
			Elite: [
				{
					item: getOSItem('Achievement diary cape'),
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: getOSItem('Kandarin headgear 4'),
					boost: '7% for Kandarin headgear 4',
					durationMultiplier: 0.93
				},
				{
					item: getOSItem('Fremennik sea boots 4'),
					boost: '3% for Fremennik sea boots 4',
					durationMultiplier: 0.97
				},
				{
					item: getOSItem("Pharaoh's sceptre"),
					boost: "4% for Pharaoh's sceptre",
					durationMultiplier: 0.96
				},
				{
					item: getOSItem('Toxic blowpipe'),
					boost: '4% for Toxic blowpipe',
					durationMultiplier: 0.96
				}
			],
			Master: [
				{
					item: getOSItem('Achievement diary cape'),
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				},
				{
					item: getOSItem('Kandarin headgear 4'),
					boost: '6% for Kandarin headgear 4',
					durationMultiplier: 0.94
				},
				{
					item: getOSItem('Music cape'),
					boost: '5% for Music cape',
					durationMultiplier: 0.95
				},
				{
					item: getOSItem('Eternal teleport crystal'),
					boost: '3% for Eternal teleport crystal',
					durationMultiplier: 0.97
				},
				{
					item: getOSItem('Toxic blowpipe'),
					boost: '2% for Toxic blowpipe',
					durationMultiplier: 0.98
				},
				{
					item: getOSItem('Dragon claws'),
					boost: '1% for Dragon claws',
					durationMultiplier: 0.99
				}
			],
			Grandmaster: [
				{
					item: getOSItem('Achievement diary cape'),
					boost: '10% for Achievement diary cape',
					durationMultiplier: 0.9
				}
			],
			Elder: []
		};

		const clueTierName = clueTier.name;
		const boostList = clueTierBoosts[clueTierName];
		const result = applyClueBoosts(user, boostList, boosts, timeToFinish, clueTier);

		timeToFinish = result.duration;

		let { quantity } = options;
		const maxPerTrip = Math.floor(maxTripLength / timeToFinish);

		if (!quantity) {
			quantity = maxPerTrip;
		}
		quantity = clamp(quantity, 1, user.bank.amount(clueTier.scrollID));

		let duration = timeToFinish * quantity;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on Clue trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${Math.floor(
				maxTripLength / timeToFinish
			)}.`;
		}

		const { bank } = user;
		const numOfScrolls = bank.amount(clueTier.scrollID);

		if (!numOfScrolls || numOfScrolls < quantity) {
			return `You don't have ${quantity} ${clueTier.name} clue scrolls.`;
		}

		await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));

		const randomAddedDuration = randInt(
			clueTierName === 'Grandmaster' ? -5 : 1,
			clueTierName === 'Grandmaster' ? 5 : 20
		);
		duration += (randomAddedDuration * duration) / 100;

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
