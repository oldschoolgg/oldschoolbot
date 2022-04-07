import type { Guild, Prisma, User } from '@prisma/client';
import { Guild as DJSGuild, MessageButton, TextChannel } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import {
	APIInteractionDataResolvedGuildMember,
	APIUser,
	ApplicationCommandOptionType,
	InteractionResponseType,
	InteractionType,
	MessageFlags
} from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Items } from 'oldschooljs';

import { SILENT_ERROR } from '../lib/constants';
import { baseFilters, filterableTypes } from '../lib/data/filterables';
import { evalMathExpression } from '../lib/expressionParser';
import { defaultGear } from '../lib/gear';
import killableMonsters from '../lib/minions/data/killableMonsters';
import { prisma } from '../lib/settings/prisma';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { Gear } from '../lib/structures/Gear';
import { Skills } from '../lib/types';
import { assert } from '../lib/util';

export function mahojiParseNumber({
	input,
	min,
	max
}: {
	input: number | string | undefined | null;
	min?: number;
	max?: number;
}): number | null {
	if (input === undefined || input === null) return null;
	const parsed = typeof input === 'number' ? input : evalMathExpression(input);
	if (parsed === null) return null;
	if (min && parsed < min) return null;
	if (max && parsed > max) return null;
	if (Number.isNaN(parsed)) return null;
	return parsed;
}

export const filterOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'filter',
	description: 'The filter you want to use.',
	required: false,
	autocomplete: async (value: string) => {
		let res = !value
			? filterableTypes
			: filterableTypes.filter(filter => filter.name.toLowerCase().includes(value.toLowerCase()));

		return [...res]
			.sort((a, b) => baseFilters.indexOf(b) - baseFilters.indexOf(a))
			.map(val => ({ name: val.name, value: val.aliases[0] ?? val.name }));
	}
};

const itemArr = Items.array().map(i => ({ name: i.name, id: i.id, key: `${i.name}${i.id}` }));

export const itemOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'item',
	description: 'The item you want to pick.',
	required: false,
	autocomplete: async value => {
		return itemArr
			.filter(i => i.key.includes(value.toLowerCase()))
			.map(i => ({ name: `${i.name}`, value: i.id.toString() }));
	}
};

export const monsterOption: CommandOption = {
	type: ApplicationCommandOptionType.String,
	name: 'monster',
	description: 'The monster you want to pick.',
	required: true,
	autocomplete: async value => {
		return killableMonsters
			.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
			.map(i => ({ name: i.name, value: i.name }));
	}
};

export async function handleMahojiConfirmation(interaction: SlashCommandInteraction, str: string, userID?: bigint) {
	const channel = interaction.client._djsClient.channels.cache.get(interaction.channelID.toString());
	if (!channel || !(channel instanceof TextChannel)) throw new Error('Channel for confirmation not found.');
	await interaction.deferReply();

	const confirmMessage = await channel.send({
		content: str,
		components: [
			[
				new MessageButton({
					label: 'Confirm',
					style: 'PRIMARY',
					customID: 'CONFIRM'
				}),
				new MessageButton({
					label: 'Cancel',
					style: 'SECONDARY',
					customID: 'CANCEL'
				})
			]
		]
	});

	const cancel = async () => {
		await confirmMessage.delete();
		await interaction.respond({
			type: InteractionType.ApplicationCommand,
			response: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: 'You did not confirm in time.',
					flags: MessageFlags.Ephemeral
				}
			},
			interaction
		});
		throw new Error(SILENT_ERROR);
	};

	async function confirm() {
		await confirmMessage.delete();
	}

	try {
		const selection = await confirmMessage.awaitMessageComponentInteraction({
			filter: i => {
				if (i.user.id !== (userID ?? interaction.userID).toString()) {
					i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
					return false;
				}
				return true;
			},
			time: Time.Second * 10
		});
		if (selection.customID === 'CANCEL') {
			return cancel();
		}
		if (selection.customID === 'CONFIRM') {
			return confirm();
		}
	} catch {
		return cancel();
	}
}

/**
 *
 * User
 *
 */

export async function mahojiUsersSettingsFetch(user: bigint | string) {
	const result = await prisma.user.findFirst({
		where: {
			id: user.toString()
		}
	});
	if (!result) throw new Error(`mahojiUsersSettingsFetch returned no result for ${user}`);
	return result;
}

export async function mahojiUserSettingsUpdate(
	client: KlasaClient,
	user: string | KlasaUser,
	data: Prisma.UserUpdateArgs['data']
) {
	const klasaUser = typeof user === 'string' ? await client.fetchUser(user) : user;

	const newUser = await prisma.user.update({
		data,
		where: {
			id: klasaUser.id
		}
	});

	await klasaUser.settings.sync(true);
	assert(BigInt(klasaUser.settings.get(UserSettings.GP)) === newUser.GP, 'Patched user should match');
	assert(klasaUser.settings.get(UserSettings.LMSPoints) === newUser.lms_points, 'Patched user should match');
	const klasaBank = klasaUser.settings.get(UserSettings.Bank);
	const newBank = newUser.bank;
	for (const [key, value] of Object.entries(klasaBank)) {
		assert((newBank as any)[key] === value, `Item[${key}] in patched user should match`);
	}
	assert(klasaUser.settings.get(UserSettings.HonourLevel) === newUser.honour_level);
	assert(klasaUser.settings.get(UserSettings.HonourPoints) === newUser.honour_points);

	return { newUser };
}

/**
 *
 * Guild
 *
 */

export const untrustedGuildSettingsCache = new Map<string, Guild>();

export async function mahojiGuildSettingsFetch(guild: string | DJSGuild) {
	const id = typeof guild === 'string' ? guild : guild.id;
	const result = await prisma.guild.upsert({
		where: {
			id
		},
		update: {},
		create: {
			id
		}
	});
	untrustedGuildSettingsCache.set(id, result);
	return result;
}

export async function mahojiGuildSettingsUpdate(
	client: KlasaClient,
	guild: string | DJSGuild,
	data: Prisma.GuildUpdateArgs['data']
) {
	const guildID = typeof guild === 'string' ? guild : guild.id;

	const newGuild = await prisma.guild.update({
		data,
		where: {
			id: guildID
		}
	});
	untrustedGuildSettingsCache.set(newGuild.id, newGuild);
	await (client.gateways.get('guilds') as any)?.get(guildID)?.sync(true);
	return { newGuild };
}

export interface MahojiUserOption {
	user: APIUser;
	member: APIInteractionDataResolvedGuildMember;
}

export function getSkillsOfMahojiUser(user: User): Skills {
	return {
		agility: Number(user.skills_agility),
		cooking: Number(user.skills_cooking),
		fishing: Number(user.skills_fishing),
		mining: Number(user.skills_mining),
		smithing: Number(user.skills_smithing),
		woodcutting: Number(user.skills_woodcutting),
		firemaking: Number(user.skills_firemaking),
		runecraft: Number(user.skills_runecraft),
		crafting: Number(user.skills_crafting),
		prayer: Number(user.skills_prayer),
		fletching: Number(user.skills_fletching),
		farming: Number(user.skills_farming),
		herblore: Number(user.skills_herblore),
		thieving: Number(user.skills_thieving),
		hunter: Number(user.skills_hunter),
		construction: Number(user.skills_construction),
		magic: Number(user.skills_magic),
		attack: Number(user.skills_attack),
		strength: Number(user.skills_strength),
		defence: Number(user.skills_defence),
		ranged: Number(user.skills_ranged),
		hitpoints: Number(user.skills_hitpoints),
		slayer: Number(user.skills_slayer)
	};
}

export function getUserGear(user: User) {
	return {
		melee: new Gear((user.gear_melee as any) ?? { ...defaultGear }),
		mage: new Gear((user.gear_mage as any) ?? { ...defaultGear }),
		range: new Gear((user.gear_range as any) ?? { ...defaultGear }),
		misc: new Gear((user.gear_misc as any) ?? { ...defaultGear }),
		skilling: new Gear((user.gear_skilling as any) ?? { ...defaultGear }),
		wildy: new Gear((user.gear_wildy as any) ?? { ...defaultGear }),
		fashion: new Gear((user.gear_fashion as any) ?? { ...defaultGear }),
		other: new Gear((user.gear_other as any) ?? { ...defaultGear })
	};
}

export function patronMsg(tierNeeded: number) {
	return `You need to be a Tier ${
		tierNeeded - 1
	} Patron to use this command. You can become a patron to support the bot here: <https://www.patreon.com/oldschoolbot>`;
}
