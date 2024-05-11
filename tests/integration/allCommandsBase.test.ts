import { join } from 'node:path';

import { ApplicationCommandOptionType } from 'discord.js';
import { randArrItem, randInt, shuffleArr, Time } from 'e';
import { Store } from 'mahoji/dist/lib/structures/Store';
import { CommandOption } from 'mahoji/dist/lib/types';
import { isValidCommand } from 'mahoji/dist/lib/util';
import { Bank, Items } from 'oldschooljs';
import { expect, test, vi } from 'vitest';

import { BitField, minionActivityCache } from '../../src/lib/constants';
import { prisma } from '../../src/lib/settings/prisma';
import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../src/lib/util/handleMahojiConfirmation';
import { activitiesCommand } from '../../src/mahoji/commands/activities';
import { adminCommand } from '../../src/mahoji/commands/admin';
import { askCommand } from '../../src/mahoji/commands/ask';
import { botLeaguesCommand } from '../../src/mahoji/commands/botleagues';
import { bsCommand } from '../../src/mahoji/commands/bs';
import { buildCommand } from '../../src/mahoji/commands/build';
import { buyCommand } from '../../src/mahoji/commands/buy';
import { caCommand } from '../../src/mahoji/commands/ca';
import { chooseCommand } from '../../src/mahoji/commands/choose';
import { chopCommand } from '../../src/mahoji/commands/chop';
import { claimCommand } from '../../src/mahoji/commands/claim';
import { clueCommand } from '../../src/mahoji/commands/clue';
import { cluesCommand } from '../../src/mahoji/commands/clues';
import { configCommand } from '../../src/mahoji/commands/config';
import { cookCommand } from '../../src/mahoji/commands/cook';
import { craftCommand } from '../../src/mahoji/commands/craft';
import { createCommand } from '../../src/mahoji/commands/create';
import { dataCommand } from '../../src/mahoji/commands/data';
import { dropCommand } from '../../src/mahoji/commands/drop';
import { dryCalcCommand } from '../../src/mahoji/commands/drycalc';
import { fakeCommand } from '../../src/mahoji/commands/fake';
import { fakepmCommand } from '../../src/mahoji/commands/fakepm';
import { farmingCommand } from '../../src/mahoji/commands/farming';
import { fishCommand } from '../../src/mahoji/commands/fish';
import { fletchCommand } from '../../src/mahoji/commands/fletch';
import { gambleCommand } from '../../src/mahoji/commands/gamble';
import { gearCommand } from '../../src/mahoji/commands/gear';
import { gearPresetsCommand } from '../../src/mahoji/commands/gearpresets';
import { giftCommand } from '../../src/mahoji/commands/gift';
import { giveawayCommand } from '../../src/mahoji/commands/giveaway';
import { gpCommand } from '../../src/mahoji/commands/gp';
import { helpCommand } from '../../src/mahoji/commands/help';
import { huntCommand } from '../../src/mahoji/commands/hunt';
import { inviteCommand } from '../../src/mahoji/commands/invite';
import { minionKCommand } from '../../src/mahoji/commands/k';
import { kcCommand } from '../../src/mahoji/commands/kc';
import { lapsCommand } from '../../src/mahoji/commands/laps';
import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard';
import { lightCommand } from '../../src/mahoji/commands/light';
import { lootCommand } from '../../src/mahoji/commands/loot';
import { mCommand } from '../../src/mahoji/commands/m';
import { massCommand } from '../../src/mahoji/commands/mass';
import { mineCommand } from '../../src/mahoji/commands/mine';
import { minigamesCommand } from '../../src/mahoji/commands/minigames';
import { minionCommand } from '../../src/mahoji/commands/minion';
import { mixCommand } from '../../src/mahoji/commands/mix';
import { offerCommand } from '../../src/mahoji/commands/offer';
import { openCommand } from '../../src/mahoji/commands/open';
import { patreonCommand } from '../../src/mahoji/commands/patreon';
import { payCommand } from '../../src/mahoji/commands/pay';
import { pohCommand } from '../../src/mahoji/commands/poh';
import { pollCommand } from '../../src/mahoji/commands/poll';
import { priceCommand } from '../../src/mahoji/commands/price';
import { raidCommand } from '../../src/mahoji/commands/raid';
import { redeemCommand } from '../../src/mahoji/commands/redeem';
import { rollCommand } from '../../src/mahoji/commands/roll';
import { runecraftCommand } from '../../src/mahoji/commands/runecraft';
import { sacrificeCommand } from '../../src/mahoji/commands/sacrifice';
import { sellCommand } from '../../src/mahoji/commands/sell';
import { simulateCommand } from '../../src/mahoji/commands/simulate';
import { slayerCommand } from '../../src/mahoji/commands/slayer';
import { smeltingCommand } from '../../src/mahoji/commands/smelt';
import { smithCommand } from '../../src/mahoji/commands/smith';
import { stealCommand } from '../../src/mahoji/commands/steal';
import { tksCommand } from '../../src/mahoji/commands/tokkulshop';
import { toolsCommand } from '../../src/mahoji/commands/tools';
import { tradeCommand } from '../../src/mahoji/commands/trade';
import { triviaCommand } from '../../src/mahoji/commands/trivia';
import { mahojiUseCommand } from '../../src/mahoji/commands/use';
import { randomMock } from './setup';
import { createTestUser, mockClient, TestUser } from './util';

type CommandInput = Record<string, any>;
async function generateCommandInputs(user: TestUser, options: readonly CommandOption[]): Promise<CommandInput[]> {
	let results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(user, option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', { id: user.id } as any, {} as any);
					allPossibleOptions[option.name] = shuffleArr(autoCompleteResults.map(c => c.value)).slice(0, 3);
				} else if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value).slice(0, 3);
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value);
				} else {
					let value = randInt(1, 10);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [option.min_value, value];
				}
				break;
			case ApplicationCommandOptionType.Boolean: {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case ApplicationCommandOptionType.User: {
				allPossibleOptions[option.name] = [
					{
						user: {
							id: '425134194436341760',
							username: 'username',
							bot: false
						},
						member: undefined
					}
				];
				break;
			}
			case ApplicationCommandOptionType.Channel:
			case ApplicationCommandOptionType.Role:
			case ApplicationCommandOptionType.Mentionable:
				// results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
	for (let i = 0; i < longestOptions; i++) {
		let obj: Record<string, any> = {};
		for (const [key, val] of Object.entries(allPossibleOptions)) {
			obj[key] = val[i] ?? randArrItem(val);
		}
		results.push(obj);
	}
	return results;
}

const bank = new Bank();
for (const item of Items.array()) {
	bank.add(item.id, 100_000_000);
}

test(
	'All Commands Base Test',
	async () => {
		expect(vi.isMockFunction(handleMahojiConfirmation)).toBe(true);
		const client = await mockClient();
		process.env.CLIENT_ID = client.data.id;
		randomMock();
		const maxUser = await createTestUser(bank, { GP: 100_000_000_000 });
		await maxUser.max();
		await maxUser.update({ bitfield: [BitField.isModerator] });
		const store = new Store({ name: 'commands', dirs: [join('dist', 'mahoji')], checker: isValidCommand });
		await store.load();
		const currentClientSettings = await mahojiClientSettingsFetch({ construction_cost_bank: true });
		await prisma.activity.deleteMany({
			where: {
				user_id: BigInt(maxUser.id)
			}
		});

		const ignoredCommands = [
			'leagues',
			'bank',
			'bingo',
			'bossrecords',
			'stats',
			'clues',
			'kc',
			'simulate',
			'lvl',
			'testpotato',
			'xp',
			'wiki',
			'casket',
			'finish',
			'kill',
			'trivia',
			'ge',
			'rp',
			'cl'
		];
		const cmds = [
			adminCommand,
			askCommand,
			botLeaguesCommand,
			bsCommand,
			buildCommand,
			buyCommand,
			caCommand,
			chooseCommand,
			chopCommand,
			cookCommand,
			clueCommand,
			configCommand,
			claimCommand,
			cluesCommand,
			mCommand,
			gpCommand,
			payCommand,
			craftCommand,
			fishCommand,
			farmingCommand,
			dropCommand,
			dryCalcCommand,
			createCommand,
			activitiesCommand,
			dataCommand,
			fakeCommand,
			fakepmCommand,
			fletchCommand,
			gambleCommand,
			gearCommand,
			gearPresetsCommand,
			giveawayCommand,
			helpCommand,
			huntCommand,
			giftCommand,
			inviteCommand,
			kcCommand,
			minionKCommand,
			lapsCommand,
			leaderboardCommand,
			lightCommand,
			mineCommand,
			massCommand,
			minigamesCommand,
			minionCommand,
			simulateCommand,
			sellCommand,
			sacrificeCommand,
			rollCommand,
			runecraftCommand,
			raidCommand,
			pollCommand,
			pohCommand,
			priceCommand,
			openCommand,
			offerCommand,
			mixCommand,
			lootCommand,
			smeltingCommand,
			slayerCommand,
			redeemCommand,
			patreonCommand,
			smithCommand,
			stealCommand,
			tradeCommand,
			triviaCommand,
			toolsCommand,
			tksCommand,
			mahojiUseCommand
		];
		for (const command of store.values) {
			if (ignoredCommands.includes(command.name)) continue;
			if (cmds.some(c => c.name === command.name)) continue;
			throw new Error(`Command ${command.name} is not in the test`);
		}

		const ignoredSubCommands = [
			['tools', 'patron', 'cl_bank'],
			['loot', 'view'],
			['minion', 'bankbg']
		];

		for (const command of cmds) {
			if (ignoredCommands.includes(command.name)) continue;
			const options = await generateCommandInputs(maxUser, command.options!);
			outer: for (const option of options) {
				for (const [parent, sub, subCommand] of ignoredSubCommands) {
					if (command.name === parent && option[sub] && (subCommand ? option[sub][subCommand] : true)) {
						continue outer;
					}
				}
				try {
					const res = await maxUser.runCommand(command, option);
					minionActivityCache.clear();
					// console.log(`Running command ${command.name}
					// Options: ${JSON.stringify(option)}
					// Result: ${JSON.stringify(res).slice(0, 100)}`);
				} catch (err) {
					console.error(
						`Failed to run command ${command.name} with options ${JSON.stringify(option)}: ${err}`
					);
					throw err;
				}
			}
		}

		await client.processActivities();
	},
	{
		timeout: Time.Minute * 10
	}
);
