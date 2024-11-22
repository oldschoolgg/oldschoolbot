import type { CommandResponse, CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { PlayerOwnedHouse } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, clamp, notEmpty, randInt } from 'e';
import { Bank, type ItemBank } from 'oldschooljs';

import type { ClueTier } from '../../lib/clues/clueTiers';
import { ClueTiers } from '../../lib/clues/clueTiers';
import { BitField } from '../../lib/constants';
import { allOpenables, getOpenableLoot } from '../../lib/openables';
import { getPOHObject } from '../../lib/poh';
import { SkillsEnum } from '../../lib/skilling/types';
import type { ClueActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, isWeekend, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { getItem } from '../../lib/util/getOSItem';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { getParsedStashUnits } from '../../mahoji/lib/abstracted_commands/stashUnitsCommand';
import { getPOH } from '../lib/abstracted_commands/pohCommand';
import type { OSBMahojiCommand } from '../lib/util';
import { addToOpenablesScores, getMahojiBank, mahojiUsersSettingsFetch } from '../mahojiSettings';

const clueTierBoosts: Record<
	ClueTier['name'],
	{ condition: (user: MUser, poh: PlayerOwnedHouse) => boolean; boost: string; durationMultiplier: number }[]
> = {
	Beginner: [
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Ring of the elements'),
			boost: '10% for Ring of the elements',
			durationMultiplier: 0.9
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Skull sceptre'),
			boost: '5% for Skull sceptre',
			durationMultiplier: 0.95
		}
	],
	Easy: [
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Ring of the elements'),
			boost: '10% for Ring of the elements',
			durationMultiplier: 0.9
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Skull sceptre'),
			boost: '5% for Skull sceptre',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Music cape'),
			boost: '5% for Music cape',
			durationMultiplier: 0.95
		}
	],
	Medium: [
		{
			condition: (_, poh) => poh.amulet === getPOHObject("Mounted xeric's talisman").id,
			boost: "5% for Mounted Xeric's Talisman",
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Ring of the elements'),
			boost: '10% for Ring of the elements',
			durationMultiplier: 0.9
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Skull sceptre'),
			boost: '5% for Skull sceptre',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Music cape'),
			boost: '5% for Music cape',
			durationMultiplier: 0.95
		}
	],
	Hard: [
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Book of the dead'),
			boost: '5% for Book of the dead',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) =>
				user.hasEquippedOrInBank('Wilderness sword 3') && !user.hasEquippedOrInBank('Achievement diary cape'),
			boost: '5% for Wilderness sword 3',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Royal seed pod'),
			boost: '5% for Royal seed pod',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Eternal teleport crystal'),
			boost: '5% for Eternal teleport crystal',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank("Pharaoh's sceptre"),
			boost: "5% for Pharaoh's sceptre",
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Toxic blowpipe'),
			boost: '5% for Toxic blowpipe',
			durationMultiplier: 0.95
		}
	],
	Elite: [
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Book of the dead'),
			boost: '5% for Book of the dead',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank("Pharaoh's sceptre"),
			boost: "5% for Pharaoh's sceptre",
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) =>
				user.hasEquippedOrInBank('Kandarin headgear 4') && !user.hasEquippedOrInBank('Achievement diary cape'),
			boost: '5% for Kandarin headgear 4',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) =>
				user.hasEquippedOrInBank('Fremennik sea boots 4') &&
				!user.hasEquippedOrInBank('Achievement diary cape'),
			boost: '3% for Fremennik sea boots 4',
			durationMultiplier: 0.97
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Toxic blowpipe'),
			boost: '4% for Toxic blowpipe',
			durationMultiplier: 0.96
		}
	],
	Master: [
		{
			condition: (user: MUser) =>
				user.hasEquippedOrInBank('Kandarin headgear 4') && !user.hasEquippedOrInBank('Achievement diary cape'),
			boost: '6% for Kandarin headgear 4',
			durationMultiplier: 0.94
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Book of the dead'),
			boost: '5% for Book of the dead',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Music cape'),
			boost: '5% for Music cape',
			durationMultiplier: 0.95
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Eternal teleport crystal'),
			boost: '3% for Eternal teleport crystal',
			durationMultiplier: 0.97
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Toxic blowpipe'),
			boost: '2% for Toxic blowpipe',
			durationMultiplier: 0.98
		},
		{
			condition: (user: MUser) => user.hasEquippedOrInBank('Dragon claws'),
			boost: '1% for Dragon claws',
			durationMultiplier: 0.99
		}
	]
};

const globalBoosts: {
	condition: (user: MUser, poh: PlayerOwnedHouse) => boolean;
	boost: string;
	durationMultiplier: number;
}[] = [
	{
		condition: isWeekend,
		boost: '10% for Weekend',
		durationMultiplier: 0.9
	},
	{
		condition: (user: MUser) => user.hasEquippedOrInBank('Max cape'),
		boost: '10% for Max cape',
		durationMultiplier: 0.9
	},
	{
		condition: (user: MUser) =>
			!user.hasEquippedOrInBank('Max cape') && user.hasEquippedOrInBank('Construct. cape'),
		boost: '6% for Construction cape',
		durationMultiplier: 0.94
	},
	{
		condition: (_, poh) => poh.jewellery_box === getPOHObject('Ornate jewellery box').id,
		boost: '10% for Ornate jewellery box',
		durationMultiplier: 0.9
	},
	{
		condition: (_, poh) =>
			poh.jewellery_box !== getPOHObject('Ornate jewellery box').id && poh.jewellery_box !== null,
		boost: '5% for Basic/Fancy jewellery box',
		durationMultiplier: 0.95
	},
	{
		condition: (user: MUser) => user.hasEquippedOrInBank('Achievement diary cape'),
		boost: '10% for Achievement diary cape',
		durationMultiplier: 0.9
	}
];

async function getStashBoost(userID: string, tierName: string): Promise<number> {
	const parsedUnits = await getParsedStashUnits(userID);

	// Filter parsed units based on the found stash tier
	const tierSpecificUnits = parsedUnits.filter(unit => unit.tier.tier === tierName);
	const filledUnits = tierSpecificUnits.filter(
		unit => unit.builtUnit !== undefined && unit.builtUnit.items_contained.length > 0
	).length;
	const totalUnits = tierSpecificUnits.length;
	const percentageFilled = totalUnits > 0 ? (filledUnits / totalUnits) * 100 : 0;

	const boost = Math.min((percentageFilled / 100) * 15, 15);

	return boost;
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
			autocomplete: async (value, user) => {
				const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id, { bank: true }));
				return ClueTiers.map(i => ({
					name: `${i.name} (${bank.amount(i.scrollID)}x Owned)`,
					value: i.name
				})).filter(i => !value || i.value.toLowerCase().includes(value));
			}
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'implings',
			description: 'Implings to use for multiple clues per trip.',
			required: false,
			autocomplete: async (value, user) => {
				const allClueImps = ClueTiers.filter(t => t.name !== 'Beginner')
					.map(i => i.implings)
					.filter(notEmpty)
					.flat()
					.map(getItem)
					.filter(notEmpty);
				const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id, { bank: true }));
				const hasClueImps = allClueImps.filter(imp => bank.has(imp.id));
				return hasClueImps
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: `${i.name} (${bank.amount(i.id)}x Owned)`, value: i.name }));
			}
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ tier: string; implings?: string }>) => {
		const user = await mUserFetch(userID);

		const clueTier = ClueTiers.find(
			tier => stringMatches(tier.id.toString(), options.tier) || stringMatches(tier.name, options.tier)
		);
		if (!clueTier) return 'Invalid clue tier.';

		const clueImpling = options.implings
			? getItem(/^[0-9]+$/.test(options.implings) ? Number(options.implings) : options.implings)
			: null;

		if (options.implings) {
			if (!clueImpling) {
				return `Invalid impling. Please check your entry, **${options.implings}** doesn't match any impling jars. Make sure the quantity isn't included, etc.`;
			}
			if (!user.bank.has(clueImpling.id)) return `You don't have any ${clueImpling.name}s in your bank.`;
			if (!clueTier.implings?.includes(clueImpling.id)) return `These clues aren't found in ${clueImpling.name}s`;
		}

		const boosts = [];

		const stats = await user.fetchStats({ openable_scores: true });
		const currentClueScore = (stats.openable_scores as ItemBank)[clueTier.id] ?? 1;
		let timePerClue = clueTier.timeToFinish;
		const learningReductionPercent = Math.min(
			Math.floor(currentClueScore / ((Time.Hour * 2) / clueTier.timeToFinish)),
			25
		);

		if (learningReductionPercent >= 1) boosts.push(`${learningReductionPercent}% for Clue score`);

		const maxTripLength = calcMaxTripLength(user, 'ClueCompletion');

		const randomAddedDuration = randInt(1, 20);
		timePerClue += (randomAddedDuration * timePerClue) / 100;
		const poh = await getPOH(user.id);

		// Stash Unit boost
		const stashBoost = await getStashBoost(userID, clueTier.name);
		boosts.push(`${stashBoost.toFixed(2)}% for built STASH Units`);
		timePerClue *= 1 - stashBoost / 100;

		// Combat stats boost
		if (['Hard', 'Elite', 'Master'].includes(clueTier.name)) {
			const totalCombatStats =
				user.skillLevel(SkillsEnum.Attack) +
				user.skillLevel(SkillsEnum.Strength) +
				user.skillLevel(SkillsEnum.Ranged);
			let combatBoost = (totalCombatStats / (3 * 99)) * 100;

			if (combatBoost < 50) {
				combatBoost = combatBoost - 50;
			} else {
				combatBoost = Math.min(10, combatBoost / 6.5);
			}

			boosts.push(`${combatBoost.toFixed(2)}% for combat stats`);
			timePerClue *= 1 - combatBoost / 100;
		}

		for (const { condition, boost, durationMultiplier } of globalBoosts) {
			if (condition(user, poh)) {
				boosts.push(boost);
				timePerClue *= durationMultiplier;
			}
		}

		for (const tierBoost of clueTierBoosts[clueTier.name]) {
			const { condition, boost, durationMultiplier } = tierBoost;
			if (condition(user, poh)) {
				boosts.push(boost);
				timePerClue *= durationMultiplier;
			}
		}
		let quantity = clamp(user.bank.amount(clueTier.scrollID), 1, Math.floor(maxTripLength / timePerClue));

		const duration = timePerClue * quantity;
		const maxCanDo = Math.floor(maxTripLength / timePerClue);

		if (duration > maxTripLength || quantity > maxCanDo) {
			return `${user.minionName} can't go on Clue trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount you can do for ${clueTier.name} is ${maxCanDo}.`;
		}

		const response: Awaited<CommandResponse> = {};

		let implingLootString = '';
		let implingClues = 0;
		if (!clueImpling || quantity > 1) {
			const cost = new Bank().add(clueTier.scrollID, quantity);
			if (!user.owns(cost)) return `You don't own ${cost}.`;
			await user.removeItemsFromBank(new Bank().add(clueTier.scrollID, quantity));
		} else {
			const implingJarOpenable = allOpenables.find(o => o.aliases.some(a => stringMatches(a, clueImpling.name)));
			// If this triggers, it means OSJS probably broke / is missing an alias for an impling jar:
			if (!implingJarOpenable) return 'Invalid impling jar.';

			const bankedClues = user.bank.amount(clueTier.scrollID);
			const bankedImplings = user.bank.amount(clueImpling.id);
			let openedImplings = 0;
			const implingLoot = new Bank();
			while (implingClues + bankedClues < maxCanDo && openedImplings < bankedImplings) {
				const impLoot = await getOpenableLoot({ openable: implingJarOpenable, user, quantity: 1 });
				implingLoot.add(impLoot.bank);
				implingClues = implingLoot.amount(clueTier.scrollID);
				openedImplings++;
			}
			if (implingLoot.has(clueTier.scrollID)) {
				implingLoot.remove(clueTier.scrollID, implingLoot.amount(clueTier.scrollID));
			}

			await addToOpenablesScores(user, new Bank().add(implingJarOpenable.id, openedImplings));

			const { previousCL } = await user.transactItems({
				itemsToAdd: implingLoot,
				itemsToRemove: new Bank().add(clueImpling, openedImplings).add(clueTier.scrollID, bankedClues),
				collectionLog: true
			});

			const image = await makeBankImage({
				bank: implingLoot,
				title: `Loot from ${openedImplings}x ${implingJarOpenable.name}`,
				user,
				previousCL,
				mahojiFlags: user.bitfield.includes(BitField.DisableOpenableNames) ? undefined : ['show_names']
			});

			response.files = [image.file];

			if (bankedClues + implingClues === 0) {
				response.content = `You don't have any clues, and didn't find any in ${openedImplings}x ${clueImpling.name}s.`;
				return response;
			}
			quantity = bankedClues + implingClues;
			implingLootString = `\n\nYou will find ${implingClues} clue${
				implingClues === 0 || implingClues > 1 ? 's' : ''
			} from ${openedImplings}x ${clueImpling.name}s.`;
		}

		await addSubTaskToActivityTask<ClueActivityTaskOptions>({
			ci: clueTier.id,
			implingID: clueImpling ? clueImpling.id : undefined,
			implingClues: clueImpling ? implingClues : undefined,
			userID: user.id,
			channelID: channelID.toString(),
			q: quantity,
			duration,
			type: 'ClueCompletion'
		});

		response.content = `${user.minionName} is now completing ${quantity}x ${
			clueTier.name
		} clues, it'll take around ${formatDuration(duration)} to finish (${((quantity / duration) * 3600000).toFixed(1)}/hr).${
			boosts.length > 0 ? `\n\n**Boosts:** ${boosts.join(', ')}.` : ''
		}${implingLootString}`;
		return response;
	}
};
