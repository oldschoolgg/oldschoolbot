import type { ClientStorage, Guild, Prisma, User } from '@prisma/client';
import { Guild as DJSGuild, MessageButton } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import {
	APIInteractionDataResolvedGuildMember,
	APIUser,
	InteractionResponseType,
	InteractionType,
	MessageFlags
} from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { CLIENT_ID } from '../config';
import { SILENT_ERROR } from '../lib/constants';
import { evalMathExpression } from '../lib/expressionParser';
import { defaultGear } from '../lib/gear';
import { prisma } from '../lib/settings/prisma';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { Gear } from '../lib/structures/Gear';
import type { ItemBank, Skills as TSkills } from '../lib/types';
import { assert, channelIsSendable, convertXPtoLVL } from '../lib/util';

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

export async function handleMahojiConfirmation(interaction: SlashCommandInteraction, str: string, _users?: bigint[]) {
	const channel = interaction.client._djsClient.channels.cache.get(interaction.channelID.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	const users: BigInt[] = _users ?? [interaction.userID];
	let confirmed: BigInt[] = [];
	const isConfirmed = () => confirmed.length === users.length;
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

	return new Promise<void>(async (resolve, reject) => {
		const collector = confirmMessage.createMessageComponentInteractionCollector({
			time: Time.Second * 10
		});

		async function confirm(id: bigint) {
			if (confirmed.includes(id)) return;
			confirmed.push(id);
			if (!isConfirmed()) return;
			collector.stop();
			await confirmMessage.delete();
			resolve();
		}

		const cancel = async (reason: 'time' | 'cancel') => {
			await confirmMessage.delete();
			await interaction.respond({
				type: InteractionType.ApplicationCommand,
				response: {
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content:
							reason === 'cancel' ? 'The confirmation was cancelled.' : 'You did not confirm in time.',
						flags: MessageFlags.Ephemeral
					}
				},
				interaction
			});
			collector.stop();
			reject(new Error(SILENT_ERROR));
		};

		collector.on('collect', async i => {
			const id = BigInt(i.user.id);
			if (!users.includes(id)) {
				i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
				return false;
			}
			if (i.customID === 'CANCEL') {
				return cancel('cancel');
			}
			if (i.customID === 'CONFIRM') {
				i.reply({ ephemeral: true, content: 'You confirmed the trade.' });
				return confirm(id);
			}
		});

		collector.on('end', () => !isConfirmed() && cancel('time'));
	});
}

/**
 *
 * User
 *
 */

// Is not typesafe, returns only what is selected, but will say it contains everything.
export async function mahojiUsersSettingsFetch(user: bigint | string, select?: Prisma.UserSelect) {
	const result = await prisma.user.upsert({
		where: {
			id: user.toString()
		},
		select,
		create: {
			id: user.toString()
		},
		update: {}
	});
	if (!result) throw new Error(`mahojiUsersSettingsFetch returned no result for ${user}`);
	return result as User;
}

export async function mahojiUserSettingsUpdate(
	client: KlasaClient,
	user: string | bigint | KlasaUser,
	data: Prisma.UserUpdateArgs['data']
) {
	const klasaUser = typeof user === 'string' || typeof user === 'bigint' ? await client.fetchUser(user) : user;

	const newUser = await prisma.user.update({
		data,
		where: {
			id: klasaUser.id
		}
	});

	await klasaUser.settings.sync(true);

	const errorContext = {
		user_id: klasaUser.id
	};

	assert(BigInt(klasaUser.settings.get(UserSettings.GP)) === newUser.GP, 'Patched user should match', errorContext);
	assert(
		klasaUser.settings.get(UserSettings.LMSPoints) === newUser.lms_points,
		'Patched user should match',
		errorContext
	);
	const klasaBank = klasaUser.settings.get(UserSettings.Bank);
	const newBank = newUser.bank;
	for (const [key, value] of Object.entries(klasaBank)) {
		assert((newBank as any)[key] === value, `Item[${key}] in patched user should match`, errorContext);
	}
	assert(
		klasaUser.settings.get(UserSettings.HonourLevel) === newUser.honour_level,
		'Patched user should match',
		errorContext
	);

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

export function getSkillsOfMahojiUser(user: User, levels = false): Required<TSkills> {
	const skills: Required<TSkills> = {
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
	if (levels) {
		for (const [key, val] of Object.entries(skills) as [keyof TSkills, number][]) {
			skills[key] = convertXPtoLVL(val);
		}
	}
	return skills;
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

// Is not typesafe, returns only what is selected, but will say it contains everything.
export async function mahojiClientSettingsFetch(select: Prisma.ClientStorageSelect) {
	const clientSettings = await prisma.clientStorage.findFirst({
		where: {
			id: CLIENT_ID
		},
		select
	});
	return clientSettings as ClientStorage;
}

export function getMahojiBank(user: User) {
	return new Bank(user.bank as ItemBank);
}
