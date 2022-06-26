import { MessageAttachment } from 'discord.js';
import { randArrItem } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { COMMAND_BECAME_SLASH_COMMAND_MESSAGE, Emoji, lastTripCache, PerkTier } from '../../lib/constants';
import { DynamicButtons } from '../../lib/DynamicButtons';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingContract } from '../../lib/minions/farming/types';
import { blowpipeCommand } from '../../lib/minions/functions/blowpipeCommand';
import { dataCommand } from '../../lib/minions/functions/dataCommand';
import { degradeableItemsCommand } from '../../lib/minions/functions/degradeableItemsCommand';
import { tempCLCommand } from '../../lib/minions/functions/tempCLCommand';
import { trainCommand } from '../../lib/minions/functions/trainCommand';
import { runCommand } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getFarmingInfo } from '../../lib/skilling/functions/getFarmingInfo';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { convertMahojiResponseToDJSResponse } from '../../lib/util';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { minionBuyCommand } from '../../mahoji/lib/abstracted_commands/minionBuyCommand';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { isUsersDailyReady } from './daily';

const patMessages = [
	'You pat {name} on the head.',
	'You gently pat {name} on the head, they look back at you happily.',
	'You pat {name} softly on the head, and thank them for their hard work.',
	'You pat {name} on the head, they feel happier now.',
	'After you pat {name}, they feel more motivated now and in the mood for PVM.',
	'You give {name} head pats, they get comfortable and start falling asleep.'
];

const randomPatMessage = (minionName: string) => randArrItem(patMessages).replace('{name}', minionName);

const subCommands = [
	'lvl',
	'seticon',
	'clues',
	'k',
	'kill',
	'setname',
	'buy',
	'clue',
	'kc',
	'pat',
	'ironman',
	'stats',
	'opens',
	'info',
	'equippet',
	'unequippet',
	'activities',
	'ep',
	'uep',
	'lapcounts',
	'cancel',
	'train',
	'tempcl',
	'blowpipe',
	'bp',
	'charge',
	'data'
];

export default class MinionCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			aliases: ['m'],
			usage: `[${subCommands.join('|')}] [quantity:int{1}|name:...string] [name:...string] [name:...string]`,
			usageDelim: ' ',
			subcommands: true,
			requiredPermissionsForBot: ['EMBED_LINKS']
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const [birdhouseDetails, mahojiUser, farmingDetails] = await Promise.all([
			calculateBirdhouseDetails(msg.author.id),
			mahojiUsersSettingsFetch(msg.author.id, { minion_farmingContract: true }),
			getFarmingInfo(msg.author.id)
		]);

		const dynamicButtons = new DynamicButtons({ channel: msg.channel, usersWhoCanInteract: [msg.author.id] });

		const cmdOptions = {
			msg,
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member
		};

		dynamicButtons.add({
			name: 'Auto Farm',
			emoji: Emoji.Farming,
			fn: () =>
				runCommand({
					commandName: 'farming',
					args: {
						auto_farm: {}
					},
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: true
		});

		const dailyIsReady = isUsersDailyReady(msg.author);
		if (dailyIsReady.isReady) {
			dynamicButtons.add({
				name: 'Claim Daily',
				emoji: Emoji.MoneyBag,
				fn: () =>
					runCommand({
						commandName: 'daily',
						args: [],
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: true
			});
		}

		if (msg.author.minionIsBusy) {
			dynamicButtons.add({
				name: 'Cancel Trip',
				emoji: Emoji.Minion,
				fn: () =>
					runCommand({
						commandName: 'minion',
						args: { cancel: {} },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: false
			});
		}

		dynamicButtons.add({
			name: 'Auto-Slay',
			emoji: Emoji.Slayer,
			fn: () =>
				runCommand({
					commandName: 'autoslay',
					args: [],
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: true
		});
		dynamicButtons.add({
			name: 'Check Patches',
			emoji: Emoji.Stopwatch,
			fn: () =>
				runCommand({
					commandName: 'farming',
					args: { check_patches: {} },
					bypassInhibitors: true,
					...cmdOptions
				}),
			cantBeBusy: false
		});
		if (birdhouseDetails.isReady) {
			dynamicButtons.add({
				name: 'Birdhouse Run',
				emoji: '692946556399124520',
				fn: () =>
					runCommand({
						commandName: 'activities',
						args: { birdhouses: { action: 'harvest' } },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: true
			});
		}
		const contract = mahojiUser.minion_farmingContract as FarmingContract | null;
		const contractedPlant = farmingDetails.patchesDetailed.find(p => p.plant?.name === contract?.plantToGrow);
		if (msg.author.skillLevel(SkillsEnum.Farming) > 45 && (!contractedPlant || contractedPlant.ready !== false)) {
			dynamicButtons.add({
				name: 'Auto Farming Contract',
				emoji: '977410792754413668',
				fn: async () => {
					const result = await autoContract(msg.author, BigInt(msg.channel.id), BigInt(msg.author.id));
					return msg.channel.send(convertMahojiResponseToDJSResponse(result));
				},
				cantBeBusy: true
			});
		}

		const lastTrip = lastTripCache.get(msg.author.id);
		if (lastTrip && !msg.author.minionIsBusy) {
			dynamicButtons.add({
				name: `Repeat ${lastTrip.data.type} Trip`,
				fn: () =>
					lastTrip.continue({
						user: msg.author,
						userID: msg.author.id,
						member: msg.member,
						guildID: msg.guild?.id,
						channelID: msg.channel.id
					})
			});
		}

		const bank = msg.author.bank();

		for (const tier of ClueTiers.filter(t => bank.has(t.scrollID))
			.reverse()
			.slice(0, 3)) {
			dynamicButtons.add({
				name: `Do ${tier.name} Clue`,
				fn: () => {
					return runCommand({
						commandName: 'clue',
						args: { tier: tier.name },
						bypassInhibitors: true,
						...cmdOptions
					});
				},
				emoji: '365003979840552960',
				cantBeBusy: true
			});
		}

		dynamicButtons.render({
			isBusy: msg.author.minionIsBusy,
			messageOptions: { content: msg.author.minionStatus }
		});
	}

	async train(msg: KlasaMessage, [input]: [string | undefined]) {
		return trainCommand(msg, input);
	}

	async data(msg: KlasaMessage, [input = '']: [string | undefined]) {
		if (msg.author.perkTier < PerkTier.Four) {
			return msg.channel.send('Sorry, you need to be a Tier 3 Patron to use this command.');
		}
		const result = await dataCommand(msg, input);
		if ('bank' in result) {
			return msg.channel.sendBankImage({
				title: result.title,
				bank: result.bank,
				content: result.content
			});
		}
		const output = Buffer.isBuffer(result) ? { files: [new MessageAttachment(result)] } : result;
		return msg.channel.send(output);
	}

	async lapcounts(msg: KlasaMessage) {
		const entries = Object.entries(msg.author.settings.get(UserSettings.LapsScores)).map(arr => [
			parseInt(arr[0]),
			arr[1]
		]);
		const sepulchreCount = await msg.author.getMinigameScore('sepulchre');
		if (sepulchreCount === 0 && entries.length === 0) {
			return msg.channel.send("You haven't done any laps yet! Sad.");
		}
		const data = `${entries
			.map(([id, qty]) => `**${Agility.Courses.find(c => c.id === id)!.name}:** ${qty}`)
			.join('\n')}\n**Hallowed Sepulchre:** ${await sepulchreCount}`;
		return msg.channel.send(data);
	}

	async charge(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return degradeableItemsCommand(msg, input);
	}

	async bp(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return this.blowpipe(msg, [input]);
	}

	async blowpipe(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return blowpipeCommand(msg, input);
	}

	async info(msg: KlasaMessage) {
		return runCommand({
			commandName: 'rp',
			args: ['c', msg.author],
			bypassInhibitors: true,
			channelID: msg.channel.id,
			userID: msg.author.id,
			guildID: msg.guild?.id,
			user: msg.author,
			member: msg.member
		});
	}

	async tempcl(msg: KlasaMessage, [input = '']: [string | undefined]) {
		return tempCLCommand(msg, input);
	}

	async unequippet(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'gear pet'));
	}

	async equippet(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'gear pet'));
	}

	async uep(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'gear pet'));
	}

	async ep(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'gear pet'));
	}

	async lvl(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion level'));
	}

	async seticon(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion set_icon'));
	}

	@requiresMinion
	async pat(msg: KlasaMessage) {
		return msg.channel.send(randomPatMessage(msg.author.minionName));
	}

	async stats(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion stats'));
	}

	async kc(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion kc'));
	}

	async ironman(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion ironman'));
	}

	async qp(msg: KlasaMessage) {
		return msg.channel.send('You can see your QP in `/minion stats`.');
	}

	@requiresMinion
	async clues(msg: KlasaMessage) {
		const clueScores = msg.author.settings.get(UserSettings.ClueScores);
		if (Object.keys(clueScores).length === 0) return msg.channel.send("You haven't done any clues yet.");

		let res = `${Emoji.Casket} **${msg.author.minionName}'s Clue Scores:**\n\n`;
		for (const [clueID, clueScore] of Object.entries(clueScores)) {
			const clue = ClueTiers.find(c => c.id === parseInt(clueID));
			res += `**${clue!.name}**: ${clueScore}\n`;
		}
		return msg.channel.send(res);
	}

	async buy(msg: KlasaMessage) {
		return minionBuyCommand(await mahojiUsersSettingsFetch(msg.author.id), false);
	}

	async setname(msg: KlasaMessage) {
		return msg.channel.send(COMMAND_BECAME_SLASH_COMMAND_MESSAGE(msg, 'minion set_name'));
	}

	async clue(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/clue`');
	}

	async k(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/k`');
	}

	async kill(msg: KlasaMessage) {
		return msg.channel.send('This command has been moved to `/k`');
	}

	async opens(msg: KlasaMessage) {
		const openableScores = new Bank(msg.author.settings.get(UserSettings.OpenableScores));
		return msg.channel.send(`You've opened... ${openableScores}`);
	}
}
