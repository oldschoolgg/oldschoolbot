import { stringMatches } from '@oldschoolgg/toolkit';
import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { UserFullGearSetup } from '../../lib/gear';
import { determineMiningTime } from '../../lib/skilling/functions/determineMiningTime';
import { miningCapeOreEffect, miningGloves, pickaxes, varrockArmours } from '../../lib/skilling/functions/miningBoosts';
import { sinsOfTheFatherSkillRequirements } from '../../lib/skilling/functions/questRequirements';
import Mining from '../../lib/skilling/skills/mining';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemNameFromID, randomVariation } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { minionName } from '../../lib/util/minionUtils';
import { motherlodeMineCommand } from '../lib/abstracted_commands/motherlodeMineCommand';
import { OSBMahojiCommand } from '../lib/util';

export function calculateMiningInput({
	nameInput,
	quantityInput,
	isPowermining,
	gear,
	hasSOTFQuest,
	qp,
	miningLevel,
	craftingLevel,
	strengthLevel,
	maxTripLength
}: {
	nameInput: string;
	quantityInput: number | undefined;
	isPowermining: boolean;
	miningLevel: number;
	gear: UserFullGearSetup;
	hasSOTFQuest: boolean;
	qp: number;
	craftingLevel: number;
	strengthLevel: number;
	maxTripLength: number;
}) {
	const ore = Mining.Ores.find(
		ore =>
			stringMatches(ore.id, nameInput) ||
			stringMatches(ore.name, nameInput) ||
			stringMatches(ore.name.split(' ')[0], nameInput)
	);

	if (!ore) {
		return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}, or ${
			Mining.MotherlodeMine.name
		}.`;
	}

	if (miningLevel < ore.level) {
		return `You need ${ore.level} Mining to mine ${ore.name}.`;
	}

	const gearValues = Object.values(gear);

	if (ore.requiredPickaxes) {
		if (!ore.requiredPickaxes.some(pickaxe => gearValues.some(g => g.hasEquipped(pickaxe)))) {
			return `You need to be using one of these pickaxes to be able to mine ${ore.name}: ${ore.requiredPickaxes
				.map(itemNameFromID)
				.join(', ')}.`;
		}
	}

	// Check for daeyalt shard requirements.
	if (ore.name === 'Daeyalt essence rock') {
		if (!hasSOTFQuest) {
			return `To mine ${ore.name}, you need ${formatSkillRequirements(sinsOfTheFatherSkillRequirements)}.`;
		}
		if (qp < 125) {
			return `To mine ${ore.name}, you need atleast 125 Quest Points.`;
		}
	}

	const messages = [];
	// Invisible mining level, dosen't help equip pickaxe etc
	let effectiveMiningLevel = miningLevel;
	if (ore.minerals && effectiveMiningLevel >= 60) {
		messages.push('+7 invisible Mining lvls at the Mining guild');
		effectiveMiningLevel += 7;
	}
	// Checks if user own Celestial ring or Celestial signet
	if (gearValues.some(g => g.hasEquipped(['Celestial ring (uncharged)']))) {
		messages.push('+4 invisible Mining lvls for Celestial ring');
		effectiveMiningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	messages.push(
		`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(currentPickaxe.id)}`
	);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!gearValues.some(g => g.hasEquipped([pickaxe.id])) || effectiveMiningLevel < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		messages.pop();
		messages.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${itemNameFromID(pickaxe.id)}`);
		break;
	}

	let glovesRate = 0;
	if (miningLevel >= 60) {
		for (const glove of miningGloves) {
			if (!gearValues.some(g => g.hasEquipped(glove.id)) || !glove.Percentages.has(ore.id)) continue;
			glovesRate = glove.Percentages.amount(ore.id);
			if (glovesRate !== 0) {
				messages.push(`Lowered rock depletion rate by **${glovesRate}%** for ${itemNameFromID(glove.id)}`);
				break;
			}
		}
	}

	let armourEffect = 0;
	for (const armour of varrockArmours) {
		if (!gearValues.some(g => g.hasEquipped(armour.id)) || !armour.Percentages.has(ore.id)) continue;
		armourEffect = armour.Percentages.amount(ore.id);
		if (armourEffect !== 0) {
			messages.push(`**${armourEffect}%** chance to mine an extra ore using ${itemNameFromID(armour.id)}`);
			break;
		}
	}

	let goldSilverBoost = false;
	if (craftingLevel >= 99 && (ore.name === 'Gold ore' || ore.name === 'Silver ore')) {
		goldSilverBoost = true;
		messages.push(`**70%** faster ${ore.name} banking for 99 Crafting`);
	}

	let miningCapeEffect = 0;
	if (gearValues.some(g => g.hasEquipped('Mining cape')) && miningCapeOreEffect.has(ore.id)) {
		miningCapeEffect = miningCapeOreEffect.amount(ore.id);
		if (miningCapeEffect !== 0) {
			messages.push(`**${miningCapeEffect}%** chance to mine an extra ore using Mining cape`);
		}
	}

	if (ore.bankingTime === 0) {
		isPowermining = false;
	}

	if (isPowermining) {
		messages.push('**Powermining**');
	}

	// Calculate the time it takes to mine specific quantity or as many as possible
	let [timeToMine, newQuantity] = determineMiningTime({
		quantity: quantityInput,
		maxTripLength,
		hasGlory: gearValues.some(g => g.hasEquipped('Amulet of glory')),
		ore,
		ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
		glovesRate,
		armourEffect,
		miningCapeEffect,
		powermining: isPowermining,
		goldSilverBoost,
		miningLvl: effectiveMiningLevel
	});

	if (gearValues.some(g => g.hasEquipped('Offhand volcanic pickaxe')) && strengthLevel >= 100 && miningLevel >= 105) {
		newQuantity = Math.round(increaseNumByPercent(newQuantity, 150));
		// Same as 60% speed reduction, just keeps full trips
		messages.push('150% increased quantity for Offhand volcanic pickaxe');
	}

	const duration = timeToMine;

	const fakeDurationMin = quantityInput ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
	const fakeDurationMax = quantityInput ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

	if (ore.name === 'Gem rock' && gearValues.some(g => g.hasEquipped('Amulet of glory'))) {
		messages.push('3x success rate for having an Amulet of glory equipped');
	}

	return {
		fakeDurationMax,
		fakeDurationMin,
		messages,
		newQuantity,
		ore,
		duration,
		isPowermining
	};
}

export const mineCommand: OSBMahojiCommand = {
	name: 'mine',
	description: 'Send your minion to mine things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mine name:Runite ore']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to mine.',
			required: true,
			autocomplete: async (value: string) => {
				return [...Mining.Ores.map(i => i.name), Mining.MotherlodeMine.name]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to mine (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'powermine',
			description: 'Set this to true to powermine. Higher xp/hour, No loot (default false, optional).',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; powermine?: boolean }>) => {
		const user = await mUserFetch(userID);
		let { quantity, powermine } = options;

		const motherlodeMine =
			stringMatches(Mining.MotherlodeMine.name, options.name) ||
			Mining.MotherlodeMine.aliases!.some(a => stringMatches(a, options.name));

		if (motherlodeMine) {
			return motherlodeMineCommand({ user, channelID, quantity });
		}

		const result = calculateMiningInput({
			nameInput: options.name,
			quantityInput: quantity,
			isPowermining: powermine ?? false,
			gear: user.gear,
			hasSOTFQuest: user.hasSkillReqs(sinsOfTheFatherSkillRequirements),
			qp: user.QP,
			miningLevel: user.skillLevel('mining'),
			craftingLevel: user.skillLevel('crafting'),
			strengthLevel: user.skillLevel('strength'),
			maxTripLength: calcMaxTripLength(user, 'Mining')
		});

		if (typeof result === 'string') {
			return result;
		}

		const { isPowermining, fakeDurationMax, fakeDurationMin, messages, newQuantity, ore, duration } = result;

		await addSubTaskToActivityTask<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: userID.toString(),
			channelID: channelID.toString(),
			quantity: newQuantity,
			powermine: isPowermining,
			duration,
			fakeDurationMax,
			fakeDurationMin,
			type: 'Mining'
		});

		let response = `${minionName(user)} is now mining ${ore.name} until your minion ${
			quantity ? `mined ${newQuantity}x or gets tired` : 'is satisfied'
		}, it'll take ${
			quantity
				? `between ${formatDuration(fakeDurationMin)} **and** ${formatDuration(fakeDurationMax)}`
				: formatDuration(duration)
		} to finish.`;

		if (user.usingPet('Doug')) {
			response += '\n<:doug:748892864813203591> Doug joins you on your mining trip!';
		}

		if (messages.length > 0) {
			response += `\n\n**Messages:** ${messages.join(', ')}.`;
		}

		return response;
	}
};
