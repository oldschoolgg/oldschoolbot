import { MessageButton } from 'discord.js';
import { Time } from 'e';
import { KlasaMessage, Task, TaskStore } from 'klasa';
import { LessThan } from 'typeorm';

import { PerkTier } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { FarmingPatchesTable, FarmingPatchStatus } from '../lib/typeorm/FarmingPatchesTable.entity';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';

declare module 'klasa' {
	interface KlasaClient {
		__farmingPatchReminders: NodeJS.Timeout;
	}
}

export default class extends Task {
	public constructor(store: TaskStore, file: string[], directory: string) {
		super(store, file, directory);
	}

	async init() {
		if (this.client.__farmingPatchReminders) {
			clearTimeout(this.client.__farmingPatchReminders);
		}
		const ticker = async () => {
			try {
				for (const user of this.client.users.cache.values()) {
					if (getUsersPerkTier(user) < PerkTier.Four) continue;
					if (!user.settings.get(UserSettings.FarmingPatchReminders)) continue;
					const messageArray = [];
					const userPlants = await FarmingPatchesTable.find({
						where: {
							userID: user.id,
							status: FarmingPatchStatus.Planted,
							finishDate: LessThan(new Date())
						}
					});
					for (const patch of userPlants) {
						messageArray.push(`${patch.plant}`);
						patch.status = FarmingPatchStatus.Finished;
						await patch.save();
					}
					if (messageArray.length > 0) {
						const message = await user.send({
							content: `${
								user.username
							}, your following plants are ready to be harvested: ${messageArray.join(', ')}`,
							components: user.minionIsBusy
								? undefined
								: [
										[
											new MessageButton()
												.setLabel('Harvest & Replant')
												.setStyle('PRIMARY')
												.setCustomID('HARVEST'),
											new MessageButton()
												.setLabel('Disable Reminders')
												.setStyle('SECONDARY')
												.setCustomID('DISABLE')
										]
								  ]
						});
						try {
							const selection = await message.awaitMessageComponentInteraction({
								time: Time.Minute * 5
							});
							message.edit({ components: [] });
							if (user.minionIsBusy) {
								selection.reply({ content: 'Your minion is busy.' });
								return;
							}
							if (selection.customID === 'HARVEST') {
								message.author = user;
								this.client.commands
									.get('farm')
									?.run(message as KlasaMessage, [messageArray.join(',')]);
							}
							if (selection.customID === 'DISABLE') {
								await user.settings.update(UserSettings.FarmingPatchReminders, false);
								await user.send(
									'Farming patch reminders have been disabled. You can enable them again using `+farm --togglereminders`.'
								);
							}
						} catch {
							message.edit({ components: [] });
						}
					}
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.client.__farmingPatchReminders = setTimeout(ticker, Number(Time.Second * 10));
			}
		};
		ticker();
	}

	async run() {}
}
