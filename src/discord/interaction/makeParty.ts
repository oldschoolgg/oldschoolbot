import { ButtonBuilder, type ButtonMInteraction, ButtonStyle, dateFm } from '@oldschoolgg/discord';
import { debounce, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';

import { partyLockCache } from '@/lib/cache.js';
import { SILENT_ERROR } from '@/lib/constants.js';
import { InteractionID } from '@/lib/InteractionID.js';
import type { MakePartyOptions } from '@/lib/types/index.js';

export async function makeParty(options: MakePartyOptions): Promise<MUser[]> {
	if (process.env.TEST) return [options.leader];
	const interaction = options.interaction;
	const timeout = Time.Minute * 5;
	const usersWhoConfirmed: string[] = [options.leader.id];
	let massStarted = false;
	let partyCancelled = false;

	const row: ButtonBuilder[] = [
		new ButtonBuilder().setCustomId(InteractionID.Party.Join).setLabel('Join').setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(InteractionID.Party.Leave).setLabel('Leave').setStyle(ButtonStyle.Secondary),
		new ButtonBuilder().setCustomId(InteractionID.Party.Cancel).setLabel('Cancel').setStyle(ButtonStyle.Danger),
		new ButtonBuilder().setCustomId(InteractionID.Party.Start).setLabel('Start').setStyle(ButtonStyle.Success)
	];
	const startTime = Date.now();

	const getMessageContent = async () => ({
		content: `${options.message}\n\n**Users Joined:** ${(
			await Promise.all(usersWhoConfirmed.map(u => Cache.getBadgedUsername(u)))
		).join(
			', '
		)}\n\nThis party will automatically depart in ${dateFm(startTime + timeout)}, or if the leader clicks the start (start early) or stop button.`,
		components: row,
		allowedMentions: { users: [] as string[] }
	});

	await interaction.defer({ ephemeral: false });
	await interaction.reply(await getMessageContent());

	const updateUsersIn = debounce(async () => {
		await interaction.reply(await getMessageContent());
	}, 500);

	const removeUser = (userID: string) => {
		if (userID === options.leader.id) return;
		const idx = usersWhoConfirmed.indexOf(userID);
		if (idx !== -1) {
			usersWhoConfirmed.splice(idx, 1);
			updateUsersIn();
		}
	};

	const startTrip = async (resolve: (v: MUser[]) => void, reject: (e: Error) => void) => {
		if (massStarted) return;
		massStarted = true;
		await interaction.reply({ content: (await getMessageContent()).content, components: [] });
		if (!partyCancelled && usersWhoConfirmed.length < options.minSize) {
			reject(new Error('SILENT_ERROR'));
			return;
		}
		const members: MUser[] = [];
		for (const id of usersWhoConfirmed) members.push(await mUserFetch(id));
		resolve(members);
	};

	function checkParty(): string | null {
		if (usersWhoConfirmed.length < options.minSize) return `You need atleast ${options.minSize} players.`;
		if (usersWhoConfirmed.length > options.maxSize) return `You cannot have more than ${options.maxSize} players.`;
		return null;
	}

	return new Promise<MUser[]>((resolve, reject) => {
		const collector = globalClient.createInteractionCollector({
			timeoutMs: timeout,
			interaction,
			maxCollected: Infinity
		});

		collector.on('collect', async (bi: ButtonMInteraction) => {
			if (options.usersAllowed && !options.usersAllowed.includes(bi.userId)) {
				await bi.reply({
					content: 'You are not allowed to join this mass.',
					ephemeral: true
				});
				return;
			}
			const user = await mUserFetch(bi.userId);
			if ((!options.ironmanAllowed && user.isIronman) || (await user.minionIsBusy()) || !user.hasMinion) {
				await bi.reply({
					content: `You cannot mass if you are busy${!options.ironmanAllowed ? ', an ironman' : ''}, or have no minion.`,
					ephemeral: true
				});
				return;
			}

			const id = bi.customId;

			if (
				![
					InteractionID.Party.Join,
					InteractionID.Party.Leave,
					InteractionID.Party.Cancel,
					InteractionID.Party.Start
				].includes(id as 'PARTY_START')
			) {
				throw new Error(
					`When making a party for ${JSON.stringify({ ...options, userId: interaction.userId })}, received invalid button ID: ${id}`
				);
			}

			if (id === InteractionID.Party.Join) {
				if (options.customDenier) {
					const [denied, reason] = await options.customDenier(user);
					if (denied) {
						await bi.reply({
							content: `You couldn't join this mass, for this reason: ${reason}`,
							ephemeral: true
						});
						return;
					}
				}
				if (usersWhoConfirmed.includes(bi.userId)) {
					await bi.reply({ content: 'You are already in this mass.', ephemeral: true });
					return;
				}
				if (partyLockCache.has(bi.userId)) {
					await bi.reply({ content: 'You cannot join this mass.', ephemeral: true });
					return;
				}
				usersWhoConfirmed.push(bi.userId);
				partyLockCache.add(bi.userId);
				await bi.silentButtonAck();
				updateUsersIn();
				if (usersWhoConfirmed.length >= options.maxSize) collector.stop('everyoneJoin');
				return;
			}

			if (id === InteractionID.Party.Leave) {
				if (!usersWhoConfirmed.includes(bi.userId) || bi.userId === options.leader.id) {
					await bi.reply({ content: 'You cannot leave this mass.', ephemeral: true });
					return;
				}
				partyLockCache.delete(bi.userId);
				removeUser(bi.userId);
				bi.silentButtonAck();
				return;
			}

			if (id === InteractionID.Party.Cancel) {
				if (bi.userId !== options.leader.id) {
					await bi.reply({ content: 'You cannot cancel this mass.', ephemeral: true });
					return;
				}
				partyCancelled = true;
				bi.silentButtonAck();
				collector.stop('partyCreatorEnd');
				interaction.reply({ content: 'The party was cancelled.', components: [] });
				reject(new Error(SILENT_ERROR));
				return;
			}

			if (id === InteractionID.Party.Start) {
				if (bi.userId !== options.leader.id) {
					await bi.reply({ content: 'You cannot start this party.', ephemeral: true });
					return;
				}
				const error = checkParty();
				if (error) {
					await bi.reply({ content: error, ephemeral: true });
					return;
				}
				bi.silentButtonAck();
				collector.stop('partyCreatorEnd');
				await startTrip(resolve, reject);
			}
		});

		collector.once('end', async () => {
			for (const uid of usersWhoConfirmed) partyLockCache.delete(uid);
			if (massStarted || partyCancelled) return;
			TimerManager.setTimeout(() => void startTrip(resolve, reject), 250);
		});
	});
}
