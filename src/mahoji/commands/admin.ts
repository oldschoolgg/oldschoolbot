import { dateFm } from '@oldschoolgg/discord';
import { randArrItem } from '@oldschoolgg/rng';
import {
	calcPerHour,
	calcWhatPercent,
	cleanString,
	noOp,
	notEmpty,
	sleep,
	stringMatches,
	Time,
	uniqueArr
} from '@oldschoolgg/toolkit';
import { gracefulExit } from 'exit-hook';
import { Bank, type ItemBank, Items, toKMB } from 'oldschooljs';

import { economy_transaction_type } from '@/prisma/main/enums.js';
import type { ClientStorage } from '@/prisma/main.js';
import { bulkUpdateCommands, itemOption } from '@/discord/index.js';
import { BadgesEnum, BitField, BitFieldData, badges, Channel, globalConfig, META_CONSTANTS } from '@/lib/constants.js';
import type { GearSetup } from '@/lib/gear/types.js';
import { GrandExchange } from '@/lib/grandExchange.js';
import { syncCustomPrices } from '@/lib/preStartup.js';
import { countUsersWithItemInCl } from '@/lib/rawSql.js';
import { sorts } from '@/lib/sorts.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { isValidBitField } from '@/lib/util/smallUtils.js';

export const gifs = [
	'https://tenor.com/view/angry-stab-monkey-knife-roof-gif-13841993',
	'https://gfycat.com/serenegleamingfruitbat',
	'https://tenor.com/view/monkey-monito-mask-gif-23036908'
];

async function allEquippedPets() {
	const pets = await prisma.$queryRawUnsafe<
		{ pet: number; qty: number }[]
	>(`SELECT "minion.equippedPet" AS pet, COUNT("minion.equippedPet")::int AS qty
FROM users
WHERE "minion.equippedPet" IS NOT NULL
GROUP BY "minion.equippedPet"
ORDER BY qty DESC;`);
	const bank = new Bank();
	for (const { pet, qty } of pets) {
		bank.add(pet, qty);
	}
	return bank;
}

async function getAllTradedItems(giveUniques = false) {
	const economyTrans = await prisma.economyTransaction.findMany({
		where: {
			date: {
				gt: new Date(Date.now() - Time.Month)
			},
			type: economy_transaction_type.trade
		},
		select: {
			items_received: true,
			items_sent: true
		}
	});

	const total = new Bank();

	if (giveUniques) {
		for (const trans of economyTrans) {
			const bank = new Bank().add(trans.items_received as ItemBank).add(trans.items_sent as ItemBank);

			for (const item of bank.items()) {
				total.add(item[0].id);
			}
		}
	} else {
		for (const trans of economyTrans) {
			total.add(trans.items_received as ItemBank);
			total.add(trans.items_sent as ItemBank);
		}
	}

	return total;
}

const viewableThings: {
	name: string;
	run: (clientSettings: ClientStorage) => Promise<Bank | SendableMessage>;
}[] = [
	{
		name: 'ToB Cost',
		run: async clientSettings => {
			return new Bank(clientSettings.tob_cost as ItemBank);
		}
	},
	{
		name: 'All Equipped Items',
		run: async () => {
			const res = await prisma.$queryRaw<Record<string, GearSetup | null>[]>`SELECT "gear.melee",
"gear.mage",
"gear.range",
"gear.misc",
"gear.skilling",
"gear.wildy",
"gear.fashion",
"gear.other"
FROM users
WHERE last_command_date > now() - INTERVAL '1 weeks'
AND ("gear.melee" IS NOT NULL OR
"gear.mage" IS NOT NULL OR
"gear.range" IS NOT NULL OR
"gear.misc" IS NOT NULL OR
"gear.skilling" IS NOT NULL OR
"gear.wildy" IS NOT NULL OR
"gear.fashion" IS NOT NULL OR
"gear.other" IS NOT NULL);`;
			const bank = new Bank();
			for (const user of res) {
				for (const gear of Object.values(user)
					.flatMap(i => (i === null ? [] : Object.values(i)))
					.filter(notEmpty)) {
					const item = Items.getItem(gear.item);
					if (item) {
						bank.add(gear.item, gear.quantity);
					}
				}
			}
			return bank;
		}
	},
	{
		name: 'Most Traded Items (30d, Total Volume)',
		run: async () => {
			const items = await getAllTradedItems();
			return {
				content: items
					.items()
					.sort(sorts.quantity)
					.slice(0, 10)
					.map((i, index) => `${++index}. ${i[0].name} - ${i[1].toLocaleString()}x traded`)
					.join('\n')
			};
		}
	},
	{
		name: 'Most Traded Items (30d, Unique trades)',
		run: async () => {
			const items = await getAllTradedItems(true);
			return {
				content: items
					.items()
					.sort(sorts.quantity)
					.slice(0, 10)
					.map((i, index) => `${++index}. ${i[0].name} - Traded ${i[1].toLocaleString()}x times`)
					.join('\n')
			};
		}
	},
	{
		name: 'Economy Bank',
		run: async () => {
			const [blowpipeRes, totalGP, result] = await prisma.$transaction([
				prisma.$queryRawUnsafe<
					{ scales: number; dart: number; qty: number }[]
				>(`SELECT (blowpipe->>'scales')::int AS scales, (blowpipe->>'dartID')::int AS dart, (blowpipe->>'dartQuantity')::int AS qty
FROM users
WHERE blowpipe iS NOT NULL and (blowpipe->>'dartQuantity')::int != 0;`),
				prisma.$queryRawUnsafe<{ sum: number }[]>('SELECT SUM("GP") FROM users;'),
				prisma.$queryRawUnsafe<{ banks: ItemBank }[]>(`SELECT
				json_object_agg(itemID, itemQTY)::jsonb as banks
			 from (
				select key as itemID, sum(value::bigint) as itemQTY
				from users
				cross join json_each_text(bank)
				group by key
			 ) s;`)
			]);
			const totalBank: ItemBank = result[0].banks;
			const economyBank = new Bank(totalBank);
			economyBank.add('Coins', totalGP[0].sum);

			const allPets = await allEquippedPets();
			economyBank.add(allPets);

			for (const { dart, scales, qty } of blowpipeRes) {
				economyBank.add("Zulrah's scales", scales);
				economyBank.add(dart, qty);
			}
			return {
				files: [
					await makeBankImage({ bank: economyBank }),
					{
						name: 'bank.json',
						buffer: Buffer.from(JSON.stringify(economyBank.toJSON(), null, 4))
					}
				]
			};
		}
	},
	{
		name: 'Equipped Pets',
		run: async () => {
			return allEquippedPets();
		}
	},
	{
		name: 'Most Active',
		run: async () => {
			const res = await prisma.$queryRawUnsafe<{ num: number; username: string }[]>(`
SELECT sum(duration)::int as num, "new_user"."username", user_id
FROM activity
INNER JOIN "new_users" "new_user" on "new_user"."id" = "activity"."user_id"::text
WHERE start_date > now() - interval '2 days'
GROUP BY user_id, "new_user"."username"
ORDER BY num DESC
LIMIT 10;
`);
			return {
				content: `Most Active Users in past 48h\n${res
					.map((i, ind) => `${ind + 1} ${i.username}: ${formatDuration(i.num)}`)
					.join('\n')}`
			};
		}
	},
	{
		name: 'Grand Exchange',
		run: async () => {
			const settings = await GrandExchange.fetchData();

			const allTx: string[][] = [];
			const allTransactions = await prisma.gETransaction.findMany({
				orderBy: {
					created_at: 'desc'
				}
			});
			if (allTransactions.length > 0) {
				allTx.push(Object.keys(allTransactions[0]));
				for (const tx of allTransactions) {
					allTx.push(Object.values(tx).map(i => i.toString()));
				}
			}

			const allLi: string[][] = [];
			const allListings = await prisma.gEListing.findMany({
				orderBy: {
					created_at: 'desc'
				}
			});
			if (allListings.length > 0) {
				allLi.push(Object.keys(allListings[0]));
				for (const tx of allListings) {
					allLi.push(Object.values(tx).map(i => (i === null ? '' : i.toString())));
				}
			}

			const buyLimitInterval = GrandExchange.getInterval();
			return {
				content: `**Grand Exchange Data**

The next buy limit reset is at: ${dateFm(buyLimitInterval.end)}, it resets every ${formatDuration(
					GrandExchange.config.buyLimit.interval
				)}.
**Tax Rate:** ${GrandExchange.config.tax.rate()}%
**Tax Cap (per item):** ${toKMB(GrandExchange.config.tax.cap())}
**Total GP Removed From Taxation:** ${settings.totalTax.toLocaleString()} GP
**Total Tax GP G.E Has To Spend on Item Sinks:** ${settings.taxBank.toLocaleString()} GP
`,
				files: [
					await makeBankImage({
						bank: await GrandExchange.fetchOwnedBank(),
						title: 'Items in the G.E'
					}),
					{
						name: 'transactions.txt',
						buffer: Buffer.from(allTx.map(i => i.join('\t')).join('\n'))
					},
					{
						name: 'listings.txt',
						buffer: Buffer.from(allLi.map(i => i.join('\t')).join('\n'))
					}
				]
			};
		}
	},
	{
		name: 'Buy GP Sinks',
		run: async () => {
			const result = await prisma.$queryRawUnsafe<{ item_id: string; total_gp_spent: bigint }[]>(`SELECT
  key AS item_id,
  sum((cost_gp / total_items) * value::integer) AS total_gp_spent
FROM
  buy_command_transaction,
  json_each_text(loot_bank),
  (SELECT id, sum(value::integer) as total_items FROM buy_command_transaction, json_each_text(loot_bank) GROUP BY id) subquery
WHERE
  buy_command_transaction.id = subquery.id
GROUP BY
  key
ORDER BY
  total_gp_spent DESC
LIMIT
  20;
`);

			return {
				content: result
					.map(
						(row, index) =>
							`${index + 1}. ${
								Items.getOrThrow(Number(row.item_id)).name
							} - ${row.total_gp_spent.toLocaleString()} GP`
					)
					.join('\n')
			};
		}
	},
	{
		name: 'Sell GP Sources',
		run: async () => {
			const result = await prisma.$queryRawUnsafe<
				{ item_id: number; gp: number }[]
			>(`select item_id, sum(gp_received) as gp
from bot_item_sell
group by item_id
order by gp desc
limit 80;
`);

			const totalGPGivenOut = await prisma.$queryRawUnsafe<
				{ total_gp_given_out: number }[]
			>(`select sum(gp_received) as total_gp_given_out
from bot_item_sell;`);

			return {
				files: [
					{
						name: 'output.txt',
						buffer: Buffer.from(
							result
								.map(
									(row, index) =>
										`${index + 1}. ${
											Items.getOrThrow(Number(row.item_id)).name
										} - ${row.gp.toLocaleString()} GP (${calcWhatPercent(
											row.gp,
											totalGPGivenOut[0].total_gp_given_out
										).toFixed(1)}%)`
								)
								.join('\n')
						)
					}
				]
			};
		}
	},
	{
		name: 'Max G.E Slot users',
		run: async () => {
			const res = await prisma.$queryRawUnsafe<{ user_id: string; slots_used: number }[]>(`
SELECT user_id, COUNT(*)::int AS slots_used
FROM ge_listing
WHERE cancelled_at IS NULL AND fulfilled_at IS NULL
GROUP BY user_id
HAVING COUNT(*) >= 3
ORDER BY slots_used DESC;
`);
			let usersUsingAllSlots = 0;
			for (const row of res) {
				const user = await mUserFetch(row.user_id);
				const { slots } = await GrandExchange.calculateSlotsOfUser(user);
				if (row.slots_used >= slots) usersUsingAllSlots++;
			}
			return {
				content: `There are ${usersUsingAllSlots}x users using all their G.E slots.`
			};
		}
	}
];

export const adminCommand = defineCommand({
	name: 'admin',
	description: 'Allows you to trade items with other players.',
	guildId: globalConfig.supportServerID,
	options: [
		{
			type: 'Subcommand',
			name: 'shut_down',
			description: 'Shut down the bot without rebooting.'
		},
		{
			type: 'Subcommand',
			name: 'sync_commands',
			description: 'Sync commands',
			options: []
		},
		{
			type: 'Subcommand',
			name: 'item_stats',
			description: 'item stats',
			options: [{ ...itemOption(), required: true }]
		},
		//
		{
			type: 'Subcommand',
			name: 'cancel_task',
			description: 'Cancel a users task',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'clear_busy',
			description: 'Make a user not busy',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'bypass_age',
			description: 'Bypass age for a user',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'badges',
			description: 'Manage badges of a user',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: 'String',
					name: 'add',
					description: 'The badge to add',
					required: false,
					autocomplete: async () => {
						return Object.keys(BadgesEnum).map(i => ({ name: i, value: i }));
					}
				},
				{
					type: 'String',
					name: 'remove',
					description: 'The badge to remove',
					required: false,
					autocomplete: async () => {
						return Object.keys(BadgesEnum).map(i => ({ name: i, value: i }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'command',
			description: 'Enable/disable commands',
			options: [
				{
					type: 'String',
					name: 'disable',
					description: 'The command to disable',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => {
						const disabledCommands = await Cache.getDisabledCommands();
						return globalClient.allCommands
							.filter(i => !disabledCommands.includes(i.name))
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: 'String',
					name: 'enable',
					description: 'The command to enable',
					required: false,
					autocomplete: async () => {
						const disabledCommands = await Cache.getDisabledCommands();
						return globalClient.allCommands
							.filter(i => disabledCommands.includes(i.name))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'set_price',
			description: 'item stats',
			options: [
				{ ...itemOption(), required: true },
				{
					type: 'Integer',
					name: 'price',
					description: 'The price to set',
					required: true,
					min_value: 1
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'bitfield',
			description: 'Manage bitfield of a user',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: 'String',
					name: 'add',
					description: 'The bitfield to add',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Object.entries(BitFieldData)
							.filter(bf => (!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i[1].name, value: i[0] }));
					}
				},
				{
					type: 'String',
					name: 'remove',
					description: 'The bitfield to remove',
					required: false,
					autocomplete: async ({ value }: StringAutoComplete) => {
						return Object.entries(BitFieldData)
							.filter(bf => (!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i[1].name, value: i[0] }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'ltc',
			description: 'Ltc?',
			options: [
				{
					...itemOption(),
					name: 'item',
					description: 'The item.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View something',
			options: [
				{
					type: 'String',
					name: 'thing',
					description: 'The thing',
					required: true,
					choices: viewableThings.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'give_items',
			description: 'Spawn items for a user',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: 'String',
					name: 'items',
					description: 'The items to give',
					required: true
				},
				{
					type: 'String',
					name: 'reason',
					description: 'The reason'
				}
			]
		}
	],
	run: async ({ options, userId, interaction, guildId }) => {
		await interaction.defer();

		const adminUser = await mUserFetch(userId);
		const isAdmin = adminUser.isAdmin();
		const isMod = isAdmin || adminUser.isMod();
		if (!guildId || !isMod || (globalConfig.isProduction && guildId.toString() !== globalConfig.supportServerID)) {
			return randArrItem(gifs);
		}

		/**
		 *
		 * Mod Only Commands
		 *
		 */
		if (options.cancel_task) {
			const { user } = options.cancel_task.user;
			await ActivityManager.cancelActivity(user.id);
			return 'Done.';
		}
		if (options.clear_busy) {
			const { user } = options.clear_busy.user;
			const isBusy = await Cache.getUserLockStatus(user.id);
			if (!isBusy) return `${user.username} isn't busy.`;
			await Cache.setUserLockStatus(user.id, 'unlocked');
			return `Cleared busy for ${user.username}.`;
		}

		if (options.badges) {
			if ((!options.badges.remove && !options.badges.add) || (options.badges.add && options.badges.remove)) {
				return Object.entries(badges)
					.map(entry => `**${entry[1]}:** ${entry[0]}`)
					.join('\n');
			}
			const badgeInput = options.badges.remove ?? options.badges.add;
			const action: 'add' | 'remove' = !options.badges.remove ? 'add' : 'remove';
			const badge: [string, number] | undefined = Object.entries(BadgesEnum).find(i => i[0] === badgeInput);
			if (!badge) return 'Invalid badge.';
			const [badgeName, badgeID] = badge;

			const userToUpdateBadges = await mUserFetch(options.badges.user.user.id);
			let newBadges = [...userToUpdateBadges.user.badges];

			if (action === 'add') {
				if (newBadges.includes(badgeID)) return "Already has this badge, so can't add.";
				newBadges.push(badgeID);
			} else {
				if (!newBadges.includes(badgeID)) return "Doesn't have this badge, so can't remove.";
				newBadges = newBadges.filter(i => i !== badgeID);
			}

			await userToUpdateBadges.update({
				badges: uniqueArr(newBadges)
			});

			return `${action === 'add' ? 'Added' : 'Removed'} ${badgeName} ${badges[badgeID]} badge to ${
				options.badges.user.user.username
			}.`;
		}

		if (options.bypass_age) {
			const userToBypassAge = await mUserFetch(options.bypass_age.user.user.id);
			if (userToBypassAge.bitfield.includes(BitField.BypassAgeRestriction)) {
				return 'This user is already bypassed.';
			}
			await userToBypassAge.update({
				bitfield: {
					push: BitField.BypassAgeRestriction
				}
			});
			return `Bypassed age restriction for ${options.bypass_age.user.user.username}.`;
		}

		if (options.command) {
			const { disable } = options.command;
			const { enable } = options.command;

			const currentDisabledCommands = await Cache.getDisabledCommands();

			const command = globalClient.allCommands.find(c => stringMatches(c.name, disable ?? enable ?? '-'));
			if (!command) return "That's not a valid command.";

			if (disable) {
				if (currentDisabledCommands.includes(command.name)) {
					return 'That command is already disabled.';
				}
				const newDisabled = uniqueArr([...currentDisabledCommands, command.name.toLowerCase()]);
				await Cache.setDisabledCommands(newDisabled);
				return `Disabled \`${command.name}\`.`;
			}
			if (enable) {
				if (!currentDisabledCommands.includes(command.name)) {
					return 'That command is not disabled.';
				}
				await Cache.setDisabledCommands(currentDisabledCommands.filter(i => i !== command.name.toLowerCase()));
				return `Enabled \`${command.name}\`.`;
			}
			return 'Invalid.';
		}
		if (options.set_price) {
			const item = Items.getItem(options.set_price.item);
			if (!item) return 'Invalid item.';
			const { price } = options.set_price;
			if (!price || price < 1 || price > 1_000_000_000) return 'Invalid price.';
			await interaction.confirmation(
				`Are you sure you want to set the price of \`${item.name}\`(ID: ${item.id}) to \`${price.toLocaleString()}\`?`
			);
			const settings = await ClientSettings.fetch({ custom_prices: true });
			const current = settings.custom_prices as ItemBank;
			const newPrices = { ...current, [item.id]: price };
			await ClientSettings.update({
				custom_prices: newPrices
			});
			await syncCustomPrices();
			return `Set the price of \`${item.name}\` to \`${price.toLocaleString()}\`.`;
		}

		if (options.bitfield) {
			const bitInput = options.bitfield.add ?? options.bitfield.remove;
			const user = await mUserFetch(options.bitfield.user.user.id);
			const bitEntry = Object.entries(BitFieldData).find(i => i[0] === bitInput);
			const action: 'add' | 'remove' = options.bitfield.add ? 'add' : 'remove';
			if (!bitEntry) {
				return Object.entries(BitFieldData)
					.map(entry => `**${entry[0]}:** ${entry[1]?.name}`)
					.join('\n');
			}
			const bit = Number.parseInt(bitEntry[0]);

			if (!bit || !isValidBitField(bit) || [7, 8].includes(bit) || (action !== 'add' && action !== 'remove')) {
				return 'Invalid bitfield.';
			}

			let newBits = [...user.bitfield];

			if (action === 'add') {
				if (newBits.includes(bit)) {
					return "Already has this bit, so can't add.";
				}
				newBits.push(bit);
			} else {
				if (!newBits.includes(bit)) {
					return "Doesn't have this bit, so can't remove.";
				}
				newBits = newBits.filter(i => i !== bit);
			}

			await user.update({
				bitfield: uniqueArr(newBits)
			});

			return `${action === 'add' ? 'Added' : 'Removed'} '${(BitFieldData)[bit].name}' bit to ${
				options.bitfield.user.user.username
			}.`;
		}

		if (options.shut_down) {
			globalClient.isShuttingDown = true;
			const timer = Time.Second * 30;
			await interaction.reply({
				content: `Shutting down in ${dateFm(new Date(Date.now() + timer))}.`
			});
			await Promise.all([sleep(timer), GrandExchange.queue.onIdle()]);
			await globalClient
				.sendMessage(Channel.GeneralChannel, {
					content: `I am shutting down! Goodbye :(

${META_CONSTANTS.RENDERED_STR}`
				})
				.catch(noOp);
			await gracefulExit(0);
			return 'Turning off...';
		}

		/**
		 *
		 * Admin Only Commands
		 *
		 */
		if (!isAdmin) {
			return randArrItem(gifs);
		}

		if (options.sync_commands) {
			await bulkUpdateCommands();
			return 'Done.';
		}

		if (options.view) {
			const thing = viewableThings.find(i => i.name === options.view?.thing);
			if (!thing) return 'Invalid';
			const clientSettings = await ClientSettings.fetch();
			const res = await thing.run(clientSettings);
			if (!(res instanceof Bank)) return res;
			return new MessageBuilder().addBankImage({
				bank: res,
				title: thing.name,
				flags: thing.name === 'All Equipped Items' ? { sort: 'name' } : undefined
			});
		}

		if (options.give_items) {
			const items = parseBank({ inputStr: options.give_items.items, noDuplicateItems: true });
			const user = await mUserFetch(options.give_items.user.user.id);
			await interaction.confirmation(`Are you sure you want to give ${items} to ${user.usernameOrMention}?`);
			await globalClient.sendMessage(Channel.BotLogs, {
				content: `${adminUser.logName} sent \`${items}\` to ${user.logName} for ${
					options.give_items.reason ?? 'No reason'
				}`
			});

			await user.addItemsToBank({ items, collectionLog: false });
			return `Gave ${items} to ${user.mention}`;
		}

		if (options.item_stats) {
			const item = Items.getItem(options.item_stats.item);
			if (!item) return 'Invalid item.';
			const isIron = false;
			const ownedResult = await prisma.$queryRawUnsafe<
				{ qty: bigint }[]
			>(`SELECT SUM((bank->>'${item.id}')::int) as qty
FROM users
WHERE bank->>'${item.id}' IS NOT NULL;`);
			return `There are ${ownedResult[0].qty.toLocaleString()} ${item.name} owned by everyone.
There are ${await countUsersWithItemInCl(item.id, isIron)} ${isIron ? 'ironmen' : 'people'} with at least 1 ${
				item.name
			} in their collection log.`;
		}

		if (options.ltc) {
			let str = '';
			const results = await prisma.lootTrack.findMany();

			if (options.ltc.item) {
				str += `${['id', 'total_of_item', 'item_per_kc', 'per_hour'].join('\t')}\n`;
				const item = Items.getOrThrow(options.ltc.item);

				for (const res of results) {
					const loot = new Bank(res.loot as ItemBank);
					if (!loot.has(item.id)) continue;
					const qty = loot.amount(item.id);
					str += `${[
						res.id,
						qty,
						qty / res.total_kc,
						calcPerHour(qty, res.total_duration * Time.Minute)
					].join('\t')}\n`;
				}

				return {
					files: [{ buffer: Buffer.from(str), name: `${cleanString(item.name)}.txt` }]
				};
			}

			str += `${['id', 'cost_h', 'cost', 'loot_h', 'loot', 'per_hour_h', 'per_hour', 'ratio'].join('\t')}\n`;
			for (const res of results) {
				if (!res.total_duration || !res.total_kc) continue;
				if (Object.keys({ ...(res.cost as ItemBank), ...(res.loot as ItemBank) }).length === 0) continue;
				const cost = Bank.withSanitizedValues(res.cost as ItemBank);
				const loot = Bank.withSanitizedValues(res.loot as ItemBank);
				const marketValueCost = Math.round(cost.value());
				const marketValueLoot = Math.round(loot.value());
				const ratio = marketValueLoot / marketValueCost;

				if (!marketValueCost || !marketValueLoot || ratio === Number.POSITIVE_INFINITY) continue;

				str += `${[
					res.id,
					toKMB(marketValueCost),
					marketValueCost,
					toKMB(marketValueLoot),
					marketValueLoot,
					toKMB(calcPerHour(marketValueLoot, res.total_duration * Time.Minute)),
					calcPerHour(marketValueLoot, res.total_duration * Time.Minute),
					ratio
				].join('\t')}\n`;
			}

			return {
				files: [{ buffer: Buffer.from(str), name: 'output.txt' }]
			};
		}

		return 'Invalid command.';
	}
});
