import { formatOrdinal, stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, randArrItem, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { resolveItems } from 'oldschooljs/dist/util/util';
import { Events } from '../../lib/constants';
import { evilChickenOutfit } from '../../lib/data/CollectionsExport';
import { Offerables } from '../../lib/data/offerData';
import { birdsNestID, treeSeedsNest } from '../../lib/simulation/birdsNest';
import Prayer from '../../lib/skilling/skills/prayer';
import { SkillsEnum } from '../../lib/skilling/types';
import type { OfferingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import getOSItem from '../../lib/util/getOSItem';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import type { OSBMahojiCommand } from '../lib/util';
import { userStatsBankUpdate, userStatsUpdate } from '../mahojiSettings';

const specialBones = [
	{
		item: getOSItem('Long bone'),
		xp: 4500
	},
	{
		item: getOSItem('Curved bone'),
		xp: 6750
	}
];

const eggs = ['Red bird egg', 'Green bird egg', 'Blue bird egg'].map(getOSItem);

const offerables = new Set(
	[...Offerables, ...specialBones.map(i => i.item), ...eggs, ...Prayer.Bones]
		.map(i => resolveItems(i.name))
		.map(i => i[0])
);

function notifyUniques(user: MUser, activity: string, uniques: number[], loot: Bank, qty: number, randQty?: number) {
	const itemsToAnnounce = loot.filter(item => uniques.includes(item.id));
	if (itemsToAnnounce.length > 0) {
		globalClient.emit(
			Events.ServerNotification,
			`**${user.badgedUsername}'s** minion, ${
				user.minionName
			}, while offering ${qty}x ${activity}, found **${itemsToAnnounce}**${
				randQty ? ` on their ${formatOrdinal(randQty)} offering!` : '!'
			}`
		);
	}
}

export const offerCommand: OSBMahojiCommand = {
	name: 'offer',
	description: 'Offer bones or bird eggs.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/offer name:Dragon bones']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to offer.',
			required: true,
			autocomplete: async (value: string, user: User) => {
				const botUser = await mUserFetch(user.id);

				return botUser.bank
					.items()
					.filter(i => offerables.has(i[0].id))
					.filter(i => {
						if (!value) return true;
						return i[0].name.toLowerCase().includes(value.toLowerCase());
					})
					.map(i => ({ name: `${i[0].name} (${i[1]}x Owned)`, value: i[0].name.toLowerCase() }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to offer (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({
		options,
		userID,
		channelID,
		interaction
	}: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		const userBank = user.bank;

		await deferInteraction(interaction);
		let { quantity } = options;
		const whichOfferable = Offerables.find(
			item =>
				stringMatches(options.name, item.name) ||
				item.aliases?.some(alias => stringMatches(alias, options.name))
		);
		if (whichOfferable) {
			const offerableOwned = userBank.amount(whichOfferable.itemID);
			if (offerableOwned === 0) {
				return `You don't have any ${whichOfferable.name} to offer to the ${whichOfferable.offerWhere}.`;
			}
			if (!quantity) quantity = offerableOwned;
			if (quantity > offerableOwned) {
				return `You don't have ${quantity} ${whichOfferable.name} to offer the ${whichOfferable.offerWhere}. You have ${offerableOwned}.`;
			}
			const loot = new Bank().add(whichOfferable.table.roll(quantity));

			const { previousCL, itemsAdded } = await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot,
				itemsToRemove: new Bank().add(whichOfferable.itemID, quantity)
			});
			if (whichOfferable.economyCounter) {
				const newStats = await userStatsUpdate(
					user.id,
					{
						[whichOfferable.economyCounter]: {
							increment: quantity
						}
					},
					{ slayer_chewed_offered: true, slayer_unsired_offered: true }
				); // Notify uniques
				if (whichOfferable.uniques) {
					const current = newStats[whichOfferable.economyCounter];
					notifyUniques(
						user,
						whichOfferable.name,
						whichOfferable.uniques,
						itemsAdded,
						quantity,
						current + randInt(1, quantity)
					);
				}
			}

			const { file } = await makeBankImage({
				bank: itemsAdded,
				title: `Loot from offering ${quantity} ${whichOfferable.name}`,
				flags: { showNewCL: 1 },
				user,
				previousCL
			});
			return {
				files: [file]
			};
		}

		const egg = eggs.find(egg => stringMatches(options.name, egg.name));
		if (egg) {
			const quantityOwned = userBank.amount(egg.id);
			if (quantityOwned === 0) {
				return "You don't own any of these eggs.";
			}
			if (!quantity) quantity = quantityOwned;
			const cost = new Bank().add(egg.id, quantity);
			if (!user.owns(cost)) return "You don't own enough of these eggs.";

			const loot = new Bank();
			for (let i = 0; i < quantity; i++) {
				if (roll(300)) {
					loot.add(randArrItem(evilChickenOutfit));
				} else {
					loot.add(birdsNestID);
					loot.add(treeSeedsNest.roll());
				}
			}

			const xpStr = await user.addXP({
				skillName: SkillsEnum.Prayer,
				amount: quantity * 100
			});

			const { previousCL, itemsAdded } = await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot,
				itemsToRemove: cost
			});
			await userStatsBankUpdate(user, 'bird_eggs_offered_bank', cost);

			notifyUniques(user, egg.name, evilChickenOutfit, loot, quantity);

			const { file } = await makeBankImage({
				bank: itemsAdded,
				title: `${quantity}x ${egg.name}`,
				user,
				previousCL,
				showNewCL: true
			});

			return {
				content: `You offered ${quantity}x ${egg.name} to the Shrine and received the attached loot and ${xpStr}.`,
				files: [file]
			};
		}

		const specialBone = specialBones.find(bone => stringMatches(bone.item.name, options.name));
		if (specialBone) {
			if (user.QP < 8) {
				return 'You need at least 8 QP to offer long/curved bones for XP.';
			}
			if (user.skillLevel(SkillsEnum.Construction) < 30) {
				return 'You need at least level 30 Construction to offer long/curved bones for XP.';
			}
			const amountHas = userBank.amount(specialBone.item.id);
			if (!quantity) quantity = Math.max(amountHas, 1);
			if (amountHas < quantity) {
				return `You don't have ${quantity}x ${specialBone.item.name}, you have ${amountHas}.`;
			}
			const xp = quantity * specialBone.xp;
			await Promise.all([
				user.addXP({
					skillName: SkillsEnum.Construction,
					amount: xp
				}),
				user.removeItemsFromBank(new Bank().add(specialBone.item.id, quantity))
			]);
			return `You handed over ${quantity} ${specialBone.item.name}${
				quantity > 1 ? "'s" : ''
			} to Barlak and received ${xp} Construction XP.`;
		}

		const speedMod = 1.5;

		const bone = Prayer.Bones.find(
			bone => stringMatches(bone.name, options.name) || stringMatches(bone.name.split(' ')[0], options.name)
		);

		if (!bone) {
			return "That's not a valid bone to offer.";
		}

		if (user.skillLevel(SkillsEnum.Prayer) < bone.level) {
			return `${user.minionName} needs ${bone.level} Prayer to offer ${bone.name}.`;
		}

		const timeToBuryABone = speedMod * (Time.Second * 1.2 + Time.Second / 4);

		const amountOfThisBone = userBank.amount(bone.inputId);
		if (!amountOfThisBone) return `You have no ${bone.name}.`;

		const maxTripLength = calcMaxTripLength(user, 'Offering');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.min(Math.floor(maxTripLength / timeToBuryABone), amountOfThisBone);
		}

		// Check the user has the required bones to bury.
		if (amountOfThisBone < quantity) {
			return `You dont have ${quantity}x ${bone.name}.`;
		}

		const duration = quantity * timeToBuryABone;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${bone.name}s you can bury is ${Math.floor(
				maxTripLength / timeToBuryABone
			)}.`;
		}

		await user.removeItemsFromBank(new Bank().add(bone.inputId, quantity));

		await addSubTaskToActivityTask<OfferingActivityTaskOptions>({
			boneID: bone.inputId,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Offering'
		});
		return `${user.minionName} is now offering ${quantity}x ${
			bone.name
		} at the Chaos altar, it'll take around ${formatDuration(duration)} to finish.`;
	}
};
