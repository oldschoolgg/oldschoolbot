import { User } from '@prisma/client';
import { combats_enum } from '@prisma/client';
import { FormattedCustomEmoji } from '@sapphire/discord.js-utilities';
import { notEmpty, randArrItem } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';

import { BLACKLISTED_USERS } from '../../lib/blacklists';
import { badges, BitField, BitFieldData, MAX_LEVEL, PerkTier } from '../../lib/constants';
import { degradeableItems } from '../../lib/degradeableItems';
import { diaries } from '../../lib/diaries';
import { effectiveMonsters } from '../../lib/minions/data/killableMonsters';
import { blowpipeCommand, blowpipeDarts } from '../../lib/minions/functions/blowpipeCommand';
import { degradeableItemsCommand } from '../../lib/minions/functions/degradeableItemsCommand';
import { trainCommand } from '../../lib/minions/functions/trainCommand';
import { roboChimpUserFetch } from '../../lib/roboChimp';
import { Minigames } from '../../lib/settings/minigames';
import { minionActivityCache } from '../../lib/settings/settings';
import Skills from '../../lib/skilling/skills';
import creatures from '../../lib/skilling/skills/hunter/creatures';
import { convertLVLtoXP, getUsername, isValidNickname } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import BankImageTask from '../../tasks/bankImage';
import {
	achievementDiaryCommand,
	claimAchievementDiaryCommand
} from '../lib/abstracted_commands/achievementDiaryCommand';
import { bankBgCommand } from '../lib/abstracted_commands/bankBgCommand';
import { cancelTaskCommand } from '../lib/abstracted_commands/cancelTaskCommand';
import { crackerCommand } from '../lib/abstracted_commands/crackerCommand';
import { dailyCommand } from '../lib/abstracted_commands/dailyCommand';
import { ironmanCommand } from '../lib/abstracted_commands/ironmanCommand';
import { Lampables, lampCommand } from '../lib/abstracted_commands/lampCommand';
import { minionBuyCommand } from '../lib/abstracted_commands/minionBuyCommand';
import { minionStatusCommand } from '../lib/abstracted_commands/minionStatusCommand';
import { dataPoints, statsCommand } from '../lib/abstracted_commands/statCommand';
import { allUsableItems, useCommand } from '../lib/abstracted_commands/useCommand';
import { ownedItemOption, skillOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import {
	handleMahojiConfirmation,
	mahojiUserSettingsUpdate,
	mahojiUsersSettingsFetch,
	patronMsg
} from '../mahojiSettings';
import { combatSpellOption, equippedWeaponCombatStyleOption } from './../lib/mahojiCommandOptions';

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) => randArrItem(patMessages).replace('{name}', minionName);

export async function getUserInfo(user: User) {
	const klasaUser = await globalClient.fetchUser(user.id);
	const roboChimpUser = await roboChimpUserFetch(BigInt(user.id));

	const bitfields = `${(user.bitfield as BitField[])
		.map(i => BitFieldData[i])
		.filter(notEmpty)
		.map(i => i.name)
		.join(', ')}`;

	const task = minionActivityCache.get(user.id);
	const taskText = task ? `${task.type}` : 'None';

	const userBadges = user.badges.map(i => badges[i]);

	const premiumDate = Number(user.premium_balance_expiry_date);
	const premiumTier = user.premium_balance_tier;

	const result = {
		perkTier: getUsersPerkTier(user),
		isBlacklisted: BLACKLISTED_USERS.has(user.id),
		badges: userBadges,
		mainAccount: user.main_account !== null ? `${getUsername(user.main_account)}[${user.main_account}]` : 'None',
		ironmanAlts: user.ironman_alts.map(id => `${getUsername(id)}[${id}]`),
		premiumBalance: `${premiumDate ? new Date(premiumDate).toLocaleString() : ''} ${
			premiumTier ? `Tier ${premiumTier}` : ''
		}`,
		isIronman: user.minion_ironman,
		bitfields,
		currentTask: taskText,
		patreon: roboChimpUser.patreon_id ? 'Yes' : 'None',
		github: roboChimpUser.github_id ? 'Yes' : 'None'
	};
	return {
		...result,
		everythingString: `${klasaUser.username}[${klasaUser.id}]
**Perk Tier:** ${result.perkTier}
**Blacklisted:** ${result.isBlacklisted}
**Badges:** ${result.badges.join(' ')}
**Main Account:** ${result.mainAccount}
**Ironman Alts:** ${result.ironmanAlts}
**Patron Balance:** ${result.premiumBalance}
**Ironman:** ${result.isIronman}
**Bitfields:** ${result.bitfields}
**Patreon Connected:** ${result.patreon}
**Github Connected:** ${result.github}`
	};
}

export const minionCommand: OSBMahojiCommand = {
	name: 'minion',
	description: 'Manage and control your minion.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy',
			description: 'Buy a minion so you can start playing the bot!',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'ironman',
					description: 'Do you want to be an ironman?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'status',
			description: 'View the status of your minion.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cracker',
			description: 'Use a Christmas Cracker on someone.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user you want to use the cracker on.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'Check the stats of your minion.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'stat',
					description: 'The stat you want to see.',
					autocomplete: async (value: string) => {
						return dataPoints
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({
								name: `${i.name} ${
									i.perkTierNeeded === null ? '' : `(Tier ${i.perkTierNeeded - 1} Patrons)`
								}`,
								value: i.name
							}));
					},
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'achievementdiary',
			description: 'Manage your achievement diary.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'diary',
					description: 'The achievement diary name.',
					required: false,
					choices: diaries.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'claim',
					description: 'Claim your rewards?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bankbg',
			description: 'Change your bank background.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the bank background you want.',
					autocomplete: async (value, user) => {
						const mahojiUser = await mahojiUsersSettingsFetch(user.id, { bitfield: true });
						const isMod = mahojiUser.bitfield.includes(BitField.isModerator);
						const bankImages = (globalClient.tasks.get('bankImage') as BankImageTask).backgroundImages;
						return bankImages
							.filter(bg => isMod || bg.available)
							.filter(bg => (!value ? true : bg.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => {
								const name = i.perkTierNeeded
									? `${i.name} (Tier ${i.perkTierNeeded - 1} patrons)`
									: i.name;
								return { name, value: i.name };
							});
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'lamp',
			description: 'Use lamps to claim XP.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to use.',
					autocomplete: async (value: string) => {
						return Lampables.map(i => i.items)
							.flat(2)
							.map(getOSItem)
							.filter(p => (!value ? true : p.name.toLowerCase().includes(value.toLowerCase())))
							.map(p => ({ name: p.name, value: p.name }));
					},
					required: true
				},
				{
					...skillOption,
					required: true,
					name: 'skill',
					description: 'The skill you want to use the item on.'
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'quantity',
					description: 'You quantity you want to use.',
					required: false,
					min_value: 1,
					max_value: 100_000
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel',
			description: 'Cancel your current trip.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'use',
			description: 'Allows you to use items.',
			options: [
				{
					...ownedItemOption(i => allUsableItems.has(i.id)),
					required: true,
					name: 'item'
				},
				{
					...ownedItemOption(i => allUsableItems.has(i.id)),
					required: false,
					name: 'secondary_item',
					description: 'Optional second item to use the first one on.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_icon',
			description: 'Set the icon for your minion.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'icon',
					description: 'The icon you want to pick.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_name',
			description: 'Set the name of your minion.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name you want to pick.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'level',
			description: 'Check your level/XP in a skill.',
			options: [
				{
					...skillOption,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'kc',
			description: 'Check your KC.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The monster/thing you want to check your KC of.',
					required: true,
					autocomplete: async (value: string) => {
						return [...effectiveMonsters, ...Minigames, ...creatures]
							.filter(i => (!value ? true : i.aliases.some(alias => alias.includes(value.toLowerCase()))))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'ironman',
			description: 'Become an ironman, or de-iron.',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'permanent',
					description: 'Do you want to become a permanent ironman?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'charge',
			description: 'Charge an item.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to charge',
					required: false,
					choices: degradeableItems.map(i => ({ name: i.item.name, value: i.item.name }))
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'amount',
					description: 'The amount you want to charge',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'daily',
			description: 'Claim some daily free GP.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'train',
			description: 'Select what combat style you want to train.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'combat_skill',
					description: 'The primary combat skill you want to train with',
					required: false,
					choices: Object.keys(combats_enum).map(key => ({ name: key, value: key }))
				},
				{
					...equippedWeaponCombatStyleOption(),
					name: 'attack_style_type',
					description: 'The attack style and attack type you want to use for specified combat skill'
				},
				{
					...combatSpellOption(),
					name: 'combat_spell',
					description: 'The combat spell you want to cast while training magic.'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'pat',
			description: 'Pat your minion on the head!'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'blowpipe',
			description: 'Charge and uncharge your blowpipe.',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'remove_darts',
					description: 'Remove all darts from your blowpipe',
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'uncharge',
					description: 'Remove all darts and scales from your blowpipe',
					required: false
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'add',
					description: 'Add darts or scales to your blowpipe',
					required: false,
					choices: [...blowpipeDarts, getOSItem("Zulrah's scales")].map(i => ({
						name: i.name,
						value: i.name
					}))
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity of darts/scales to add',
					required: false,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'View general information about your account and minion.'
		}
	],
	run: async ({
		userID,
		options,
		interaction,
		channelID
	}: CommandRunOptions<{
		stats?: { stat?: string };
		achievementdiary?: { diary?: string; claim?: boolean };
		bankbg?: { name?: string };
		cracker?: { user: MahojiUserOption };
		lamp?: { item: string; quantity?: number; skill: string };
		cancel?: {};
		use?: { item: string; secondary_item?: string };
		set_icon?: { icon: string };
		set_name?: { name: string };
		level?: { skill: string };
		kc?: { name: string };
		buy?: { ironman?: boolean };
		ironman?: { permanent?: boolean };
		charge?: { item?: string; amount?: number };
		daily?: {};
		train?: { combat_skill?: string; attack_style_type?: string; combat_spell?: string };
		pat?: {};
		blowpipe?: { remove_darts?: boolean; uncharge?: boolean; add?: string; quantity?: number };
		status?: {};
		info?: {};
	}>) => {
		const user = await globalClient.fetchUser(userID.toString());
		const mahojiUser = await mahojiUsersSettingsFetch(user.id);
		const perkTier = getUsersPerkTier(user);

		if (options.info) return (await getUserInfo(mahojiUser)).everythingString;
		if (options.status) return minionStatusCommand(user.id);

		if (options.stats) {
			if (options.stats.stat) {
				await interaction.deferReply();
				return statsCommand(mahojiUser, options.stats.stat);
			}
			return { embeds: [await minionStatsEmbed(user)] };
		}

		if (options.achievementdiary) {
			if (options.achievementdiary.claim) {
				return claimAchievementDiaryCommand(user, options.achievementdiary.diary ?? '');
			}
			return achievementDiaryCommand(user, options.achievementdiary.diary ?? '');
		}

		if (options.bankbg) {
			return bankBgCommand(interaction, user, options.bankbg.name ?? '');
		}
		if (options.cracker) {
			const otherUser = await globalClient.fetchUser(options.cracker.user.user.id);
			return crackerCommand({ owner: user, otherPerson: otherUser, interaction });
		}

		if (options.lamp) {
			return lampCommand(user, options.lamp.item, options.lamp.skill, options.lamp.quantity);
		}

		if (options.cancel) return cancelTaskCommand(mahojiUser, interaction);

		if (options.use) return useCommand(mahojiUser, user, options.use.item, options.use.secondary_item);
		if (options.set_icon) {
			if (perkTier < PerkTier.Four) return patronMsg(PerkTier.Four);

			const res = FormattedCustomEmoji.exec(options.set_icon.icon);
			if (!res || !res[0]) return "That's not a valid emoji.";

			await handleMahojiConfirmation(interaction, 'Icons cannot be inappropriate or NSFW. Do you understand?');
			await mahojiUserSettingsUpdate(user.id, {
				minion_icon: res[0]
			});

			return `Changed your minion icon to ${res}.`;
		}
		if (options.set_name) {
			if (!isValidNickname(options.set_name.name)) return "That's not a valid name for your minion.";
			await mahojiUserSettingsUpdate(user.id, {
				minion_name: options.set_name.name
			});
			return `Renamed your minion to ${user.minionName}.`;
		}

		if (options.level) {
			const skill = Object.values(Skills).find(i => i.id === options.level?.skill);
			if (!skill) return 'Invalid skill.';
			const level = user.skillLevel(skill.id);
			const xp = user.settings.get(`skills.${skill.id}`) as number;

			let str = `${skill.emoji} Your ${skill.name} level is **${level}** (${xp.toLocaleString()} XP).`;
			if (level < MAX_LEVEL) {
				const xpToLevel = convertLVLtoXP(level + 1) - xp;
				str += ` ${xpToLevel.toLocaleString()} XP away from level ${level + 1}`;
			}
			return str;
		}

		if (options.kc) {
			const [kcName, kcAmount] = await user.getKCByName(options.kc.name);
			if (!kcName) {
				return "That's not a valid monster, minigame or hunting creature.";
			}
			return `Your ${kcName} KC is: ${kcAmount}.`;
		}

		if (options.buy) return minionBuyCommand(mahojiUser, Boolean(options.buy.ironman));
		if (options.ironman) return ironmanCommand(user, interaction, Boolean(options.ironman.permanent));
		if (options.charge) {
			return degradeableItemsCommand(interaction, user, options.charge.item, options.charge.amount);
		}
		if (options.daily) {
			return dailyCommand(interaction, channelID, user);
		}
		if (options.train)
			return trainCommand(
				user,
				options.train.combat_skill,
				options.train.attack_style_type,
				options.train.combat_spell
			);
		if (options.pat) return randomPatMessage(user.minionName);
		if (options.blowpipe) {
			return blowpipeCommand(
				user,
				options.blowpipe.remove_darts,
				options.blowpipe.uncharge,
				options.blowpipe.add,
				options.blowpipe.quantity
			);
		}

		return 'Unknown command';
	}
};
