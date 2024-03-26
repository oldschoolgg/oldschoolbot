import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { IVY_MAX_TRIP_LENGTH_BOOST, TwitcherGloves, TWITCHERS_GLOVES } from '../../lib/constants';
import { InventionID, inventionItemBoost } from '../../lib/invention/inventions';
import { determineWoodcuttingTime } from '../../lib/skilling/functions/determineWoodcuttingTime';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { WoodcuttingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, randomVariation, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { minionName } from '../../lib/util/minionUtils';
import resolveItems from '../../lib/util/resolveItems';
import { OSBMahojiCommand } from '../lib/util';

export const axes = [
	{
		id: itemID('Dwarven greataxe'),
		multiplier: 8,
		wcLvl: 99
	},
	{
		id: itemID('Crystal axe'),
		multiplier: 4,
		wcLvl: 71
	},
	{
		id: itemID('Infernal axe'),
		multiplier: 3.75,
		wcLvl: 61
	},
	{
		id: itemID('Dragon axe'),
		multiplier: 3.75,
		wcLvl: 61
	},
	{
		id: itemID('Rune axe'),
		multiplier: 3.5,
		wcLvl: 41
	},
	{
		id: itemID('Adamant axe'),
		multiplier: 3,
		wcLvl: 31
	},
	{
		id: itemID('Mithril axe'),
		multiplier: 2.5,
		wcLvl: 21
	},
	{
		id: itemID('Black axe'),
		multiplier: 2.25,
		wcLvl: 11
	},
	{
		id: itemID('Steel axe'),
		multiplier: 2,
		wcLvl: 6
	},
	{
		id: itemID('Iron axe'),
		multiplier: 1.5,
		wcLvl: 1
	},
	{
		id: itemID('Bronze axe'),
		multiplier: 1,
		wcLvl: 1
	}
];

export interface ForestryEvent {
	id: number;
	name: string;
	uniqueXP: SkillsEnum;
}

export const ForestryEvents: ForestryEvent[] = [
	{
		id: 1,
		name: 'Rising Roots',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 2,
		name: 'Struggling Sapling',
		uniqueXP: SkillsEnum.Farming
	},
	{
		id: 3,
		name: 'Flowering Bush',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 4,
		name: 'Woodcutting Leprechaun',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 5,
		name: 'Beehive',
		uniqueXP: SkillsEnum.Construction
	},
	{
		id: 6,
		name: 'Friendly Ent',
		uniqueXP: SkillsEnum.Fletching
	},
	{
		id: 7,
		name: 'Poachers',
		uniqueXP: SkillsEnum.Hunter
	},
	{
		id: 8,
		name: 'Enchantment Ritual',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 9,
		name: 'Pheasant Control',
		uniqueXP: SkillsEnum.Thieving
	}
];

export const chopCommand: OSBMahojiCommand = {
	name: 'chop',
	description: 'Chop logs using the Woodcutting skill.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/chop name:Logs']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The tree you want to chop.',
			required: true,
			autocomplete: async (value: string) => {
				return Woodcutting.Logs.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity of logs you want to chop (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'powerchop',
			description: 'Set this to true to powerchop. Higher xp/hour, No loot (default false, optional).',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'forestry_events',
			description: 'Set this to true to participate in forestry events. (default false, optional).',
			required: false
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'twitchers_gloves',
			description: "Change the settings of your Twitcher's gloves. (default egg, optional)",
			required: false,
			choices: TWITCHERS_GLOVES.map(i => ({ name: `${i} nest`, value: i }))
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
		powerchop?: boolean;
		forestry_events?: boolean;
		twitchers_gloves?: TwitcherGloves;
	}>) => {
		const user = await mUserFetch(userID);
		const log = Woodcutting.Logs.find(
			log =>
				stringMatches(log.name, options.name) ||
				stringMatches(log.name.split(' ')[0], options.name) ||
				log.aliases?.some(a => stringMatches(a, options.name))
		);

		if (!log) return "That's not a valid log to chop.";

		let { quantity, powerchop, forestry_events, twitchers_gloves } = options;

		const skills = user.skillsAsLevels;

		if (skills.woodcutting < log.level) {
			return `${minionName(user)} needs ${log.level} Woodcutting to chop ${log.name}.`;
		}

		const { QP } = user;
		if (QP < log.qpRequired) {
			return `${user.minionName} needs ${log.qpRequired} QP to cut ${log.name}.`;
		}

		if (log.customReq) {
			const res = await log.customReq(user);
			if (typeof res === 'string') return res;
		}

		const boosts = [];

		let wcLvl = skills.woodcutting;

		// Invisible wc boost for woodcutting guild, forestry events don't happen in woodcutting guild
		if (
			!forestry_events ||
			resolveItems(['Redwood logs', 'Logs']).includes(log.id) ||
			log.lootTable ||
			log.name === 'Ivy'
		) {
			forestry_events = false;
			if (skills.woodcutting >= 60 && log.wcGuild) {
				boosts.push('+7 invisible WC lvls at the Woodcutting guild');
				wcLvl += 7;
			}
		} else {
			boosts.push('Participating in Forestry events');
		}

		// Enable 1.5 tick teaks half way to 99
		if (skills.woodcutting >= 92 && (log.name === 'Teak Logs' || log.name === 'Mahogany Logs')) {
			boosts.push('1.5t teak/mahogany chopping with 92+ wc');
		}

		// Default bronze axe, last in the array
		let axeMultiplier = 1;
		boosts.push(`**${axeMultiplier}x** success multiplier for Bronze axe`);

		if (user.hasEquippedOrInBank(['Drygore axe'])) {
			let [predeterminedTotalTime] = determineWoodcuttingTime({
				quantity,
				user,
				log,
				axeMultiplier: 10,
				powerchopping: Boolean(powerchop),
				woodcuttingLvl: wcLvl
			});
			const boostRes = await inventionItemBoost({
				user,
				inventionID: InventionID.DrygoreAxe,
				duration: predeterminedTotalTime
			});
			if (boostRes.success) {
				axeMultiplier = 10;
				boosts.pop();
				boosts.push(`**10x** success multiplier for Drygore axe (${boostRes.messages})`);
			} else {
				axeMultiplier = 8;
				boosts.pop();
				boosts.push('**8x** success multiplier for Dwarven greataxe');
			}
		} else {
			for (const axe of axes) {
				if (!user.hasEquippedOrInBank([axe.id]) || skills.woodcutting < axe.wcLvl) continue;
				axeMultiplier = axe.multiplier;
				boosts.pop();
				boosts.push(`**${axeMultiplier}x** success multiplier for ${itemNameFromID(axe.id)}`);
				break;
			}
		}

		// Ivy choping
		if (!forestry_events && log.name === 'Ivy') {
			boosts.push(`+${formatDuration(IVY_MAX_TRIP_LENGTH_BOOST, true)} max trip length for Ivy`);
			powerchop = false;
		}

		if (!powerchop) {
			powerchop = false;
			if (user.hasEquippedOrInBank('Forestry basket') || user.hasEquippedOrInBank('Log basket')) {
				if (log.name === 'Redwood Logs') {
					boosts.push(
						`+10 trip minutes for having a ${
							user.hasEquippedOrInBank('Forestry basket') ? 'Forestry basket' : 'Log basket'
						}`
					);
				} else {
					boosts.push(
						`+5 trip minutes for having a ${
							user.hasEquippedOrInBank('Forestry basket') ? 'Forestry basket' : 'Log basket'
						}`
					);
				}
			}
		} else {
			boosts.push('**Powerchopping**');
		}

		// Calculate the time it takes to chop specific quantity or as many as possible
		let [timeToChop, newQuantity] = determineWoodcuttingTime({
			quantity,
			user,
			log,
			axeMultiplier,
			powerchopping: powerchop,
			woodcuttingLvl: wcLvl
		});

		const duration = timeToChop;

		const fakeDurationMin = quantity ? randomVariation(reduceNumByPercent(duration, 25), 20) : duration;
		const fakeDurationMax = quantity ? randomVariation(increaseNumByPercent(duration, 25), 20) : duration;

		await addSubTaskToActivityTask<WoodcuttingActivityTaskOptions>({
			logID: log.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity: newQuantity,
			iQty: options.quantity ? options.quantity : undefined,
			powerchopping: powerchop,
			forestry: forestry_events,
			twitchers: twitchers_gloves,
			duration,
			fakeDurationMin,
			fakeDurationMax,
			type: 'Woodcutting'
		});

		let response = `${minionName(user)} is now chopping ${log.name} until your minion ${
			quantity ? `chopped ${quantity}x or gets tired` : 'is satisfied'
		}, it'll take ${
			quantity
				? `between ${formatDuration(fakeDurationMin)} **and** ${formatDuration(fakeDurationMax)}`
				: formatDuration(duration)
		} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
