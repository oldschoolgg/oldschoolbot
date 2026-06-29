import { ButtonBuilder, type ButtonMInteraction, ButtonStyle, dateFm } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import { MathRNG } from 'node-rng';

import { globalConfig } from '@/lib/constants.js';
import { TOB_FAKE_MASS_PURPLE_KC_CUTOFF } from '@/lib/data/tob.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { checkTOBUser, startTheatreOfBloodTrip } from '@/mahoji/lib/abstracted_commands/tobCommand.js';

const AUTO_TOB_MASS_TIMEOUT = Time.Minute * 1;
const AUTO_TOB_MASS_MAX_REAL_USERS = 4;
const AUTO_TOB_MASS_TARGET = globalConfig.isProduction
	? {
		guildId: '342983479501389826',
		channelId: '926750772081872956',
		interval: Time.Hour
	}
	: {
		guildId: '940758552425955348',
		channelId: '1521092178955337871',
		interval: Time.Minute * 5
	};
let lastAutoTobMassPeriod: number | null = null;

function getRows() {
	return [
		new ButtonBuilder().setCustomId(InteractionID.Party.Join).setLabel('Join').setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(InteractionID.Party.Leave).setLabel('Leave').setStyle(ButtonStyle.Secondary)
	];
}

async function getMessageContent(usersWhoJoined: string[], startedAt: number) {
	const joined =
		usersWhoJoined.length === 0
			? 'None yet'
			: (await Promise.all(usersWhoJoined.map(u => Cache.getBadgedUsername(u)))).join(', ');

	return `A maxed fake ToB host is running a learner Theatre of Blood mass. Use the buttons below to join or leave.

**Users Joined:** ${joined}

This party will automatically depart in ${dateFm(startedAt + AUTO_TOB_MASS_TIMEOUT)}. Real users below ${TOB_FAKE_MASS_PURPLE_KC_CUTOFF} ToB KC and the fake host are eligible for purples; higher KC users still receive regular loot.`;
}

export async function maybeStartScheduledTobMass() {
	const now = new Date();
	const periodKey = Math.floor(now.getTime() / AUTO_TOB_MASS_TARGET.interval);
	if (lastAutoTobMassPeriod === periodKey) return;
	if (now.getTime() % AUTO_TOB_MASS_TARGET.interval >= Time.Minute) return;
	lastAutoTobMassPeriod = periodKey;

	const channelId = AUTO_TOB_MASS_TARGET.channelId;
	const startedAt = Date.now();
	const usersWhoJoined: string[] = [];
	let hasDeparted = false;

	const message = await globalClient.sendMessage(channelId, {
		content: await getMessageContent(usersWhoJoined, startedAt),
		components: getRows(),
		allowedMentions: { users: [] }
	});

	const updateMessage = async (components = getRows()) => {
		await globalClient.editMessage(channelId, message.id, {
			content: await getMessageContent(usersWhoJoined, startedAt),
			components,
			allowedMentions: { users: [] }
		});
	};

	const depart = async () => {
		if (hasDeparted) return;
		hasDeparted = true;
		globalClient.removeListener('interactionCreate', listener);
		await updateMessage([]);
		if (usersWhoJoined.length === 0) {
			await globalClient.sendMessage(channelId, {
				content: 'The learner Theatre of Blood mass did not start because nobody joined.'
			});
			return;
		}

		const users = await Promise.all(usersWhoJoined.map(userID => mUserFetch(userID)));
		const validUsers: MUser[] = [];
		const removedUsers: string[] = [];
		for (const user of users) {
			const checkResult = await checkTOBUser(user, false, users.length + 1, 1, true);
			if (checkResult[0]) {
				removedUsers.push(`${user.usernameOrMention}: ${checkResult[1]}`);
			} else {
				validUsers.push(user);
			}
		}
		if (removedUsers.length > 0) {
			await globalClient.sendMessage(channelId, {
				content: `The following users were removed from the learner Theatre of Blood mass:\n${removedUsers.join('\n')}`
			});
		}
		if (validUsers.length === 0) {
			await globalClient.sendMessage(channelId, {
				content: 'The learner Theatre of Blood mass did not start because no valid users were left.'
			});
			return;
		}
		const result = await startTheatreOfBloodTrip(
			MathRNG,
			channelId,
			validUsers[0],
			validUsers,
			false,
			1,
			false,
			true
		);
		await globalClient.sendMessage(channelId, { content: result });
	};

	const listener = async (rawInteraction: Parameters<(typeof globalClient)['apiInteractionParse']>[0]) => {
		try {
			const interaction = await globalClient.apiInteractionParse(rawInteraction);
			if (!interaction?.isButton() || interaction.message?.id !== message.id) return;
			await handleButton(interaction, usersWhoJoined, updateMessage);
		} catch (err) {
			Logging.logError(err as Error);
		}
	};

	globalClient.on('interactionCreate', listener);
	TimerManager.setTimeout(() => void depart().catch(err => Logging.logError(err)), AUTO_TOB_MASS_TIMEOUT);
}

async function handleButton(
	interaction: ButtonMInteraction,
	usersWhoJoined: string[],
	updateMessage: () => Promise<void>
) {
	const user = await mUserFetch(interaction.userId);
	if (!user.hasMinion || (await user.minionIsBusy())) {
		await interaction.reply({
			content: 'You cannot join this mass because your minion is busy or you do not have a minion.',
			ephemeral: true
		});
		return;
	}

	if (interaction.customId === InteractionID.Party.Join) {
		if (usersWhoJoined.includes(interaction.userId)) {
			await interaction.reply({ content: 'You are already in this mass.', ephemeral: true });
			return;
		}
		if (usersWhoJoined.length >= AUTO_TOB_MASS_MAX_REAL_USERS) {
			await interaction.reply({ content: 'This mass is full.', ephemeral: true });
			return;
		}
		const checkResult = await checkTOBUser(user, false, usersWhoJoined.length + 2, 1, true);
		if (checkResult[0]) {
			await interaction.reply({
				content: `You couldn't join this mass, for this reason: ${checkResult[1]}`,
				ephemeral: true
			});
			return;
		}
		usersWhoJoined.push(interaction.userId);
		await interaction.silentButtonAck();
		await updateMessage();
		return;
	}

	if (interaction.customId === InteractionID.Party.Leave) {
		const index = usersWhoJoined.indexOf(interaction.userId);
		if (index === -1) {
			await interaction.reply({ content: 'You are not in this mass.', ephemeral: true });
			return;
		}
		usersWhoJoined.splice(index, 1);
		await interaction.silentButtonAck();
		await updateMessage();
	}
}
