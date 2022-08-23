import { MessageActionRow, MessageButton } from 'discord.js';
import { Time } from 'e';
import { Task, TaskStore } from 'klasa';

import { production } from '../config';
import { BitField } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { runCommand } from '../lib/settings/settings';
import { getFarmingInfo } from '../lib/skilling/functions/getFarmingInfo';
import Farming from '../lib/skilling/skills/farming';
import { stringMatches } from '../lib/util';
import { farmingPatchNames, getFarmingKeyFromName } from '../lib/util/farmingHelpers';
import { logError } from '../lib/util/logError';
import { minionIsBusy } from '../lib/util/minionIsBusy';
import { mahojiUserSettingsUpdate, mUserFetch } from '../mahoji/mahojiSettings';

declare module 'klasa' {
	interface KlasaClient {
		__farmingPatchReminders: NodeJS.Timeout;
	}
}

let basePlantTime = 1_626_556_507_451;

export default class extends Task {
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	async init() {
		if (this.client.__farmingPatchReminders) {
			clearTimeout(this.client.__farmingPatchReminders);
		}
		const ticker = async () => {
			if (!production) return;
			try {
				const now = Date.now();
				const users = await prisma.user.findMany({
					where: {
						bitfield: {
							hasSome: [
								BitField.IsPatronTier3,
								BitField.IsPatronTier4,
								BitField.IsPatronTier5,
								BitField.isContributor,
								BitField.isModerator
							]
						},
						farming_patch_reminders: true
					},
					select: {
						id: true
					}
				});
				for (const { id } of users) {
					const { patches } = await getFarmingInfo(id);
					for (const patchType of farmingPatchNames) {
						const patch = patches[patchType];
						if (!patch) continue;
						if (patch.plantTime < basePlantTime) continue;

						const storeHarvestablePlant = patch.lastPlanted;
						const planted = storeHarvestablePlant
							? Farming.Plants.find(plants => stringMatches(plants.name, storeHarvestablePlant)) ??
							  Farming.Plants.find(
									plants =>
										stringMatches(plants.name, storeHarvestablePlant) ||
										stringMatches(plants.name.split(' ')[0], storeHarvestablePlant)
							  )
							: null;
						const difference = now - patch.plantTime;
						if (!planted) continue;
						if (difference < planted.growthTime * Time.Minute) continue;
						if (patch.wasReminded) continue;
						await mahojiUserSettingsUpdate(id, {
							[getFarmingKeyFromName(patchType)]: { ...patch, wasReminded: true }
						});

						// Build buttons (only show Harvest/replant if not busy):
						const farmingReminderButtons: MessageActionRow = new MessageActionRow();
						if (!minionIsBusy(id)) {
							farmingReminderButtons.addComponents(
								new MessageButton()
									.setLabel('Harvest & Replant')
									.setStyle('PRIMARY')
									.setCustomID('HARVEST')
							);
						}
						// Always show disable reminders:
						farmingReminderButtons.addComponents(
							new MessageButton()
								.setLabel('Disable Reminders')
								.setStyle('SECONDARY')
								.setCustomID('DISABLE')
						);
						const user = await globalClient.users.cache.get(id);
						if (!user) continue;
						const message = await user?.send({
							content: `The ${planted.name} planted in your ${patchType} patches is ready to be harvested!`,
							components: [farmingReminderButtons]
						});
						try {
							const selection = await message.awaitMessageComponentInteraction({
								time: Time.Minute * 5
							});
							message.edit({ components: [] });

							// Check disable first so minion doesn't have to be free to disable reminders.
							if (selection.customID === 'DISABLE') {
								await mahojiUserSettingsUpdate(user.id, {
									farming_patch_reminders: false
								});
								await user.send('Farming patch reminders have been disabled..');
								return;
							}
							if (minionIsBusy(user.id)) {
								selection.reply({ content: 'Your minion is busy.' });
								return;
							}
							if (selection.customID === 'HARVEST') {
								message.author = user;
								runCommand({
									commandName: 'farm',
									args: [planted.name],
									bypassInhibitors: true,
									channelID: message.channel.id,
									userID: message.author.id,
									guildID: message.guild?.id,
									user: await mUserFetch(user.id),
									member: message.member
								});
							}
						} catch {
							message.edit({ components: [] });
						}
					}
				}
			} catch (err) {
				logError(err);
			} finally {
				this.client.__farmingPatchReminders = setTimeout(ticker, Number(Time.Minute));
			}
		};
		ticker();
	}

	async run() {}
}
