import type { ClientStorage, Guild, Prisma, User, UserStats } from '@prisma/client';
import { Guild as DJSGuild, MessageButton } from 'discord.js';
import { Time } from 'e';
import { InteractionResponseType, InteractionType, MessageFlags } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import PromiseQueue from 'p-queue';

import { CLIENT_ID } from '../config';
import { deduplicateClueScrolls } from '../lib/clues/clueUtils';
import { SILENT_ERROR } from '../lib/constants';
import { evalMathExpression } from '../lib/expressionParser';
import { defaultGear, hasGracefulEquipped } from '../lib/gear';
import { MUser } from '../lib/MUser';
import { prisma } from '../lib/settings/prisma';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { filterLootReplace } from '../lib/slayer/slayerUtil';
import { Gear } from '../lib/structures/Gear';
import type { ItemBank, Skills } from '../lib/types';
import { assert, channelIsSendable, formatSkillRequirements, sanitizeBank, skillsMeetRequirements } from '../lib/util';
import { logError } from '../lib/util/logError';
import { respondToButton } from '../lib/util/respondToButton';

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

export async function handleMahojiConfirmation(interaction: SlashCommandInteraction, str: string, _users?: string[]) {
	const channel = globalClient.channels.cache.get(interaction.channelID.toString());
	if (!channelIsSendable(channel)) throw new Error('Channel for confirmation not found.');
	if (!interaction.deferred) {
		await interaction.deferReply();
	}

	const users = _users ?? [interaction.userID.toString()];
	let confirmed: string[] = [];
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
			time: Time.Second * 15
		});

		async function confirm(id: string) {
			if (confirmed.includes(id)) return;
			confirmed.push(id);
			if (!isConfirmed()) return;
			collector.stop();
			if (!confirmMessage.deleted) await confirmMessage.delete();
			resolve();
		}

		const cancel = async (reason: 'time' | 'cancel') => {
			if (!confirmMessage.deleted) await confirmMessage.delete();
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
			const { id } = i.user;
			if (!users.includes(id)) {
				i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
				return false;
			}
			if (i.customID === 'CANCEL') {
				return cancel('cancel');
			}
			if (i.customID === 'CONFIRM') {
				respondToButton(i.id, i.token);
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

export async function mUserFetch(userID: bigint | string) {
	const user = await mahojiUsersSettingsFetch(userID);
	return new MUser(user);
}

export async function mahojiUserSettingsUpdate(user: string | bigint, data: Prisma.UserUpdateArgs['data']) {
	try {
		const klasaUser =
			typeof user === 'string' || typeof user === 'bigint' ? await globalClient.fetchUser(user) : user;

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

		assert(
			BigInt(klasaUser.settings.get(UserSettings.GP)) === newUser.GP,
			'Patched user should match',
			errorContext
		);
		assert(
			klasaUser.settings.get(UserSettings.LMSPoints) === newUser.lms_points,
			'Patched user should match',
			errorContext
		);
		const klasaBank: Readonly<ItemBank> = klasaUser.settings.get('bank') as any;
		const newBank = newUser.bank;
		for (const [key, value] of Object.entries(klasaBank)) {
			assert((newBank as any)[key] === value, `Item[${key}] in patched user should match`, errorContext);
		}
		assert(
			klasaUser.settings.get(UserSettings.HonourLevel) === newUser.honour_level,
			'Patched user should match',
			errorContext
		);
		assert(
			JSON.stringify(klasaUser.settings.get('gear.melee')) === JSON.stringify(newUser.gear_melee),
			'Melee gear should match'
		);

		return { newUser };
	} catch (err) {
		logError(err, {
			user_id: user.toString(),
			updated_data: JSON.stringify(data)
		});
		throw err;
	}
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

export async function mahojiGuildSettingsUpdate(guild: string | DJSGuild, data: Prisma.GuildUpdateArgs['data']) {
	const guildID = typeof guild === 'string' ? guild : guild.id;

	const newGuild = await prisma.guild.update({
		data,
		where: {
			id: guildID
		}
	});
	untrustedGuildSettingsCache.set(newGuild.id, newGuild);
	await (globalClient.gateways.get('guilds') as any)?.get(guildID)?.sync(true);
	return { newGuild };
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
export async function mahojiClientSettingsFetch(select?: Prisma.ClientStorageSelect) {
	const clientSettings = await prisma.clientStorage.findFirst({
		where: {
			id: CLIENT_ID
		},
		select
	});
	return clientSettings as ClientStorage;
}

export async function mahojiClientSettingsUpdate(data: Prisma.ClientStorageUpdateInput) {
	await prisma.clientStorage.update({
		where: {
			id: CLIENT_ID
		},
		data
	});
	await globalClient.settings.sync(true);
}

export function getMahojiBank(user: User) {
	return new Bank(user.bank as ItemBank);
}

export async function userStatsUpdate(userID: string, data: (u: UserStats) => Prisma.UserStatsUpdateInput) {
	const id = BigInt(userID);
	const userStats = await prisma.userStats.upsert({
		create: {
			user_id: id
		},
		update: {},
		where: {
			user_id: id
		}
	});
	await prisma.userStats.update({
		data: data(userStats),
		where: {
			user_id: id
		}
	});
}

type UserStatsBankKey = 'puropuro_implings_bank' | 'passive_implings_bank' | 'create_cost_bank' | 'create_loot_bank';
export async function userStatsBankUpdate(userID: string, key: UserStatsBankKey, bank: Bank) {
	await userStatsUpdate(userID, u => ({
		[key]: bank.clone().add(u[key] as ItemBank).bank
	}));
}

export const userQueues: Map<string, PromiseQueue> = new Map();
export function getUserUpdateQueue(userID: string) {
	let currentQueue = userQueues.get(userID);
	if (!currentQueue) {
		let queue = new PromiseQueue({ concurrency: 1 });
		userQueues.set(userID, queue);
		return queue;
	}
	return currentQueue;
}

async function userQueueFn<T>(userID: string, fn: () => Promise<T>) {
	const queue = getUserUpdateQueue(userID);
	return queue.add(() => fn());
}

export async function calculateAddItemsToCLUpdates({
	userID,
	items,
	dontAddToTempCL = false,
	user
}: {
	user?: User;
	items: Bank;
	dontAddToTempCL?: boolean;
	userID: string;
}): Promise<Prisma.UserUpdateArgs['data']> {
	const settings: User = user ?? (await mahojiUsersSettingsFetch(userID));
	const updates: Prisma.UserUpdateArgs['data'] = {
		collectionLogBank: new Bank(settings.collectionLogBank as ItemBank).add(items).bank
	};

	if (!dontAddToTempCL) {
		updates.temp_cl = new Bank(settings.temp_cl as ItemBank).add(items).bank;
	}
	return updates;
}

interface TransactItemsArgs {
	userID: string;
	itemsToAdd?: Bank;
	itemsToRemove?: Bank;
	collectionLog?: boolean;
	filterLoot?: boolean;
	dontAddToTempCL?: boolean;
}

declare global {
	const transactItems: typeof transactItemsFromBank;
}
declare global {
	namespace NodeJS {
		interface Global {
			transactItems: typeof transactItemsFromBank;
		}
	}
}
global.transactItems = transactItemsFromBank;
export async function transactItemsFromBank({
	userID,
	collectionLog = false,
	filterLoot = true,
	dontAddToTempCL = false,
	...options
}: TransactItemsArgs) {
	let itemsToAdd = options.itemsToAdd ? options.itemsToAdd.clone() : undefined;
	let itemsToRemove = options.itemsToRemove ? options.itemsToRemove.clone() : undefined;
	return userQueueFn(userID, async () => {
		const settings = await mUserFetch(userID);
		const currentBank = new Bank().add(settings.user.bank as ItemBank);
		const previousCL = new Bank().add(settings.user.collectionLogBank as ItemBank);
		let clUpdates: Prisma.UserUpdateArgs['data'] = {};
		if (itemsToAdd) {
			itemsToAdd = deduplicateClueScrolls({
				loot: itemsToAdd.clone(),
				currentBank: currentBank.clone().remove(itemsToRemove ?? {})
			});
			const { bankLoot, clLoot } = filterLoot
				? filterLootReplace(settings.allItemsOwned(), itemsToAdd)
				: { bankLoot: itemsToAdd, clLoot: itemsToAdd };
			itemsToAdd = bankLoot;

			clUpdates = collectionLog
				? await calculateAddItemsToCLUpdates({ items: clLoot, dontAddToTempCL, userID })
				: {};
		}

		let gpUpdate: { increment: number } | undefined = undefined;
		if (itemsToAdd) {
			const coinsInLoot = itemsToAdd.amount('Coins');
			if (coinsInLoot > 0) {
				gpUpdate = {
					increment: coinsInLoot
				};
				itemsToAdd.remove('Coins', itemsToAdd.amount('Coins'));
			}
		}

		const newBank = new Bank().add(currentBank);
		if (itemsToAdd) newBank.add(itemsToAdd);

		sanitizeBank(newBank);

		if (itemsToRemove) {
			if (itemsToRemove.has('Coins')) {
				if (!gpUpdate) {
					gpUpdate = {
						increment: 0 - itemsToRemove.amount('Coins')
					};
				} else {
					gpUpdate.increment -= itemsToRemove.amount('Coins');
				}
				itemsToRemove.remove('Coins', itemsToRemove.amount('Coins'));
			}
			if (!newBank.has(itemsToRemove)) {
				throw new Error(
					`Tried to remove ${itemsToRemove} from ${userID}. but they don't own them. Missing: ${itemsToRemove
						.clone()
						.remove(currentBank)}`
				);
			}
			newBank.remove(itemsToRemove);
		}

		const { newUser } = await mahojiUserSettingsUpdate(userID, {
			bank: newBank.bank,
			GP: gpUpdate,
			...clUpdates
		});

		const itemsAdded = new Bank().add(itemsToAdd);
		if (itemsAdded && gpUpdate && gpUpdate.increment > 0) {
			itemsAdded.add('Coins', gpUpdate.increment);
		}

		const itemsRemoved = new Bank().add(itemsToRemove);
		if (itemsRemoved && gpUpdate && gpUpdate.increment < 0) {
			itemsRemoved.add('Coins', gpUpdate.increment);
		}

		return {
			previousCL,
			itemsAdded,
			itemsRemoved: itemsToRemove,
			newBank: new Bank(newUser.bank as ItemBank),
			newCL: new Bank(newUser.collectionLogBank as ItemBank),
			newUser
		};
	});
}

export async function updateGPTrackSetting(
	setting:
		| 'gp_luckypick'
		| 'gp_daily'
		| 'gp_open'
		| 'gp_dice'
		| 'gp_slots'
		| 'gp_sell'
		| 'gp_pvm'
		| 'gp_alch'
		| 'gp_pickpocket'
		| 'duelTaxBank',
	amount: number,
	user?: MUser | User
) {
	if (!user) {
		await prisma.clientStorage.update({
			where: {
				id: CLIENT_ID
			},
			data: {
				[setting]: {
					increment: amount
				}
			}
		});
		return;
	}
	await mahojiUserSettingsUpdate(user.id, {
		[setting]: {
			increment: amount
		}
	});
}

export function hasSkillReqs(user: MUser, reqs: Skills): [boolean, string | null] {
	const hasReqs = skillsMeetRequirements(user.skillsAsLevels, reqs);
	if (!hasReqs) {
		return [false, formatSkillRequirements(reqs)];
	}
	return [true, null];
}

export function userHasGracefulEquipped(user: User | MUser) {
	const rawGear = user instanceof MUser ? user.gear : getUserGear(user);
	for (const i of Object.values(rawGear)) {
		if (hasGracefulEquipped(i)) return true;
	}
	return false;
}
