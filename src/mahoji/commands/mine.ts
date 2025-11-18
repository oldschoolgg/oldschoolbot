import { randomVariation } from '@oldschoolgg/rng';
import { formatDuration, increaseNumByPercent, reduceNumByPercent, stringMatches } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import { QuestID } from '@/lib/minions/data/quests.js';
import { determineMiningTime } from '@/lib/skilling/functions/determineMiningTime.js';
import { miningCapeOreEffect, miningGloves, pickaxes, varrockArmours } from '@/lib/skilling/functions/miningBoosts.js';
import { sinsOfTheFatherSkillRequirements } from '@/lib/skilling/functions/questRequirements.js';
import Mining from '@/lib/skilling/skills/mining.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import type { MiningActivityTaskOptions } from '@/lib/types/minions.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { motherlodeMineCommand } from '@/mahoji/lib/abstracted_commands/motherlodeMineCommand.js';

export function calculateMiningInput({
	nameInput,
	quantityInput,
	isPowermining,
	gearBank,
	hasSOTFQuest,
	qp,
	miningLevel,
	craftingLevel,
	strengthLevel,
	maxTripLength,
	hasKaramjaMedium,
	randomVariationEnabled = true,
	hasDT2Quest
}: {
	nameInput: string;
	quantityInput: number | undefined;
	isPowermining: boolean;
	miningLevel: number;
	gearBank: GearBank;
	hasSOTFQuest: boolean;
	hasDT2Quest: boolean;
	qp: number;
	craftingLevel: number;
	strengthLevel: number;
	maxTripLength: number;
	hasKaramjaMedium: boolean;
	randomVariationEnabled?: boolean;
}) {
	const ore = Mining.Ores.find(
		ore =>
			stringMatches(ore.id, nameInput) ||
			stringMatches(ore.name, nameInput) ||
			stringMatches(ore.name.split(' ')[0], nameInput)
	);

	if (!ore) {
		return `Thats not a valid ore to mine. Valid ores are ${Mining.Ores.map(ore => ore.name).join(', ')}, or ${Mining.MotherlodeMine.name
			}.`;
	}

	if (miningLevel < ore.level) {
		return `You need ${ore.level} Mining to mine ${ore.name}.`;
	}

	// Check for daeyalt shard requirements.
	if (ore.name === 'Daeyalt essence rock') {
		if (!hasSOTFQuest) {
			return `To mine ${ore.name}, you need ${formatSkillRequirements(sinsOfTheFatherSkillRequirements)}.`;
		}
		if (qp < 125) {
			return `To mine ${ore.name}, you need at least 125 Quest Points.`;
		}
	}

	if (ore.name === 'Tainted essence chunk' && !hasDT2Quest) {
		return 'You need to have completed the Desert Treasure II quest to access the scar essence mine.';
	}

	if (miningLevel < ore.level) {
		return `You need ${ore.level} Mining to mine ${ore.name}.`;
	}
	if (ore.requiredPickaxes) {
		if (!ore.requiredPickaxes.some(pickaxe => gearBank.hasEquipped(pickaxe))) {
			return `You need to be using one of these pickaxes to be able to mine ${ore.name}: ${ore.requiredPickaxes
				.map(i => Items.itemNameFromId(i))
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
	if (gearBank.hasEquipped(['Celestial ring (uncharged)'])) {
		messages.push('+4 invisible Mining lvls for Celestial ring');
		effectiveMiningLevel += 4;
	}
	// Default bronze pickaxe, last in the array
	let currentPickaxe = pickaxes[pickaxes.length - 1];
	messages.push(
		`**${currentPickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(currentPickaxe.id)}`
	);

	// For each pickaxe, if they have it, give them its' bonus and break.
	for (const pickaxe of pickaxes) {
		if (!gearBank.hasEquipped([pickaxe.id]) || effectiveMiningLevel < pickaxe.miningLvl) continue;
		currentPickaxe = pickaxe;
		messages.pop();
		messages.push(`**${pickaxe.ticksBetweenRolls}** ticks between rolls for ${Items.itemNameFromId(pickaxe.id)}`);
		break;
	}

	let glovesRate = 0;
	if (miningLevel >= 60) {
		for (const glove of miningGloves) {
			if (!gearBank.hasEquipped(glove.id) || !glove.Percentages[ore.name]) continue;
			glovesRate = glove.Percentages[ore.name];
			if (glovesRate) {
				messages.push(
					`Lowered rock depletion rate by **${glovesRate}%** for ${Items.itemNameFromId(glove.id)}`
				);
				break;
			}
		}
	}

	let armourEffect = 0;
	for (const armour of varrockArmours) {
		if (!gearBank.hasEquippedOrInBank(armour.id) || !armour.Percentages[ore.name]) continue;
		armourEffect = armour.Percentages[ore.name];
		if (armourEffect) {
			messages.push(`**${armourEffect}%** chance to mine an extra ore using ${Items.itemNameFromId(armour.id)}`);
			break;
		}
	}

	let goldSilverBoost = false;
	if (craftingLevel >= 99 && (ore.name === 'Gold ore' || ore.name === 'Silver ore')) {
		goldSilverBoost = true;
		messages.push(`**70%** faster ${ore.name} banking for 99 Crafting`);
	}

	let miningCapeEffect = 0;
	if (gearBank.hasEquippedOrInBank('Mining cape') && miningCapeOreEffect[ore.name]) {
		miningCapeEffect = miningCapeOreEffect[ore.name];
		if (miningCapeEffect) {
			messages.push(`**${miningCapeEffect}%** chance to mine an extra ore using Mining cape`);
		}
	}

	if (ore.bankingTime === 0 && ore.name !== 'Daeyalt essence rock') {
		isPowermining = false;
	}

	if (isPowermining) {
		messages.push('**Powermining**');
	}

	// Calculate the time it takes to mine specific quantity or as many as possible
	let [timeToMine, newQuantity] = determineMiningTime({
		quantity: quantityInput,
		maxTripLength,
		hasGlory: gearBank.hasEquipped('Amulet of glory'),
		ore,
		ticksBetweenRolls: currentPickaxe.ticksBetweenRolls,
		glovesRate,
		armourEffect,
		miningCapeEffect,
		powermining: isPowermining,
		goldSilverBoost,
		miningLvl: effectiveMiningLevel,
		hasKaramjaMedium
	});

	if (gearBank.hasEquipped('Offhand volcanic pickaxe') && strengthLevel >= 100 && miningLevel >= 105) {
		newQuantity = Math.round(increaseNumByPercent(newQuantity, 150));
		// Same as 60% speed reduction, just keeps full trips
		messages.push('150% increased quantity for Offhand volcanic pickaxe');
	}

	const duration = timeToMine;

	const fakeDurationMin =
		quantityInput && randomVariationEnabled ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
	const fakeDurationMax =
		quantityInput && randomVariationEnabled ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

	if (ore.name === 'Gem rock' && gearBank.hasEquipped('Amulet of glory')) {
		messages.push('3x success rate for having an Amulet of glory equipped');
	}

	return {
		fakeDurationMin: Math.floor(fakeDurationMin),
		fakeDurationMax: Math.floor(fakeDurationMax),
		messages,
		newQuantity,
		ore,
		duration,
		isPowermining
	};
}

export const mineCommand = defineCommand({
	name: 'mine',
	description: 'Send your minion to mine things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mine name:Runite ore']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to mine.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return [...Mining.Ores.map(i => i.name), Mining.MotherlodeMine.name]
					.filter(name => (!value ? true : name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i,
						value: i
					}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to mine (optional).',
			required: false,
			min_value: 1,
			max_value: 100_000
		},
		{
			type: 'Boolean',
			name: 'powermine',
			description: 'Set this to true to powermine. Higher xp/hour, No loot (default false, optional).',
			required: false
		}
	],
	run: async ({ options, user, channelId }) => {
		const { quantity, powermine } = options;

		const motherlodeMine =
			stringMatches(Mining.MotherlodeMine.name, options.name) ||
			Mining.MotherlodeMine.aliases?.some(a => stringMatches(a, options.name));

		if (motherlodeMine) {
			return motherlodeMineCommand({ user, channelId, quantity });
		}

		const result = calculateMiningInput({
			nameInput: options.name,
			quantityInput: quantity,
			isPowermining: powermine ?? false,
			gearBank: user.gearBank,
			hasSOTFQuest: user.hasSkillReqs(sinsOfTheFatherSkillRequirements),
			qp: user.QP,
			miningLevel: user.skillLevel('mining'),
			craftingLevel: user.skillLevel('crafting'),
			strengthLevel: user.skillLevel('strength'),
			maxTripLength: await user.calcMaxTripLength('Mining'),
			hasKaramjaMedium: user.hasDiary('karamja.medium'),
			hasDT2Quest: user.user.finished_quest_ids.includes(QuestID.DesertTreasureII)
		});

		if (typeof result === 'string') {
			return result;
		}

		const { isPowermining, fakeDurationMax, fakeDurationMin, messages, newQuantity, ore, duration } = result;

		await ActivityManager.startTrip<MiningActivityTaskOptions>({
			oreID: ore.id,
			userID: user.id,
			channelId,
			quantity: newQuantity,
			powermine: isPowermining,
			duration,
			fakeDurationMax,
			fakeDurationMin,
			type: 'Mining'
		});

		let response = `${user.minionName} is now mining ${ore.name} until your minion ${quantity ? `mined ${newQuantity}x or gets tired` : 'is satisfied'
			}, it'll take ${quantity
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
});
