import { CommandStore, KlasaMessage } from 'klasa';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { Emoji, lastTripCache, PerkTier } from '../../lib/constants';
import { DynamicButtons } from '../../lib/DynamicButtons';
import { requiresMinion } from '../../lib/minions/decorators';
import { FarmingContract } from '../../lib/minions/farming/types';
import { blowpipeCommand } from '../../lib/minions/functions/blowpipeCommand';
import { runCommand } from '../../lib/settings/settings';
import { getFarmingInfo } from '../../lib/skilling/functions/getFarmingInfo';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { getUsersTame, repeatTameTrip, shortTameTripDesc, tameLastFinishedActivity } from '../../lib/tames';
import { convertMahojiResponseToDJSResponse } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { getItemContractDetails } from '../../mahoji/commands/ic';
import { spawnLampIsReady } from '../../mahoji/commands/tools';
import { calculateBirdhouseDetails } from '../../mahoji/lib/abstracted_commands/birdhousesCommand';
import { isUsersDailyReady } from '../../mahoji/lib/abstracted_commands/dailyCommand';
import { autoContract } from '../../mahoji/lib/abstracted_commands/farmingContractCommand';
import { minionBuyCommand } from '../../mahoji/lib/abstracted_commands/minionBuyCommand';
import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';

const subCommands = ['buy', 'pat', 'info', 'blowpipe', 'bp'];

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
			mahojiUsersSettingsFetch(msg.author.id),
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
						commandName: 'minion',
						args: { daily: {} },
						bypassInhibitors: true,
						...cmdOptions
					}),
				cantBeBusy: false
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

		const [spawnLampReady] = spawnLampIsReady(mahojiUser, msg.channel.id);
		if (spawnLampReady) {
			dynamicButtons.add({
				name: 'Spawn Lamp',
				emoji: '988325171498721290',
				fn: () =>
					runCommand({
						commandName: 'tools',
						args: { patron: { spawnlamp: {} } },
						bypassInhibitors: true,
						channelID: msg.channel.id,
						user: msg.author,
						guildID: msg.guild?.id,
						member: msg.member,
						userID: msg.author.id
					})
			});
		}

		const icDetails = getItemContractDetails(mahojiUser);
		if (msg.author.perkTier >= PerkTier.Two && icDetails.currentItem && icDetails.owns) {
			dynamicButtons.add({
				name: `IC: ${icDetails.currentItem.name.slice(0, 20)}`,
				emoji: '988422348434718812',
				fn: () =>
					runCommand({
						commandName: 'ic',
						args: { send: {} },
						bypassInhibitors: true,
						channelID: msg.channel.id,
						user: msg.author,
						guildID: msg.guild?.id,
						member: msg.member,
						userID: msg.author.id
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

		if (getUsersPerkTier(msg.author) >= PerkTier.Two) {
			const { tame, species, activity } = await getUsersTame(msg.author);
			if (tame && !activity) {
				const lastTameAct = await tameLastFinishedActivity(mahojiUser);
				if (lastTameAct) {
					dynamicButtons.add({
						name: `Repeat ${shortTameTripDesc(lastTameAct)}`,
						emoji: species!.emojiID,
						fn: () => repeatTameTrip(msg, lastTameAct)
					});
				}
			}
		}

		dynamicButtons.render({
			isBusy: msg.author.minionIsBusy,
			messageOptions: { content: msg.author.minionStatus }
		});
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

	async pat(msg: KlasaMessage) {
		return msg.channel.send('This command was moved to `/minion pat`');
	}

	async buy(msg: KlasaMessage) {
		return msg.channel.send(
			convertMahojiResponseToDJSResponse(
				await minionBuyCommand(msg.author, await mahojiUsersSettingsFetch(msg.author.id), false)
			)
		);
	}
}
