import { giveBoxResetTime, SPAWN_BOX_COOLDOWN, spawnLampResetTime } from '@/lib/bso/bsoConstants.js';
import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';
import { findGroupOfUser } from '@/lib/bso/util/findGroupOfUser.js';
import { LampTable } from '@/lib/bso/xpLamps.js';

import { bold, time, userMention } from '@oldschoolgg/discord';
import { randInt, roll } from '@oldschoolgg/rng';
import { Emoji, formatDuration, PerkTier, Time } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, itemID } from 'oldschooljs';

import { BitField, Channel, globalConfig } from '@/lib/constants.js';

export async function spawnLampIsReady(user: MUser, channelId: string): Promise<[true] | [false, string]> {
	if (globalConfig.isProduction && ![Channel.GeneralChannel, Channel.ServerGeneral].includes(channelId)) {
		return [false, "You can't use spawnlamp in this channel."];
	}

	const perkTier = await user.fetchPerkTier();
	const isPatron = perkTier >= PerkTier.Four || user.bitfield.includes(BitField.HasPermanentSpawnLamp);
	if (!isPatron) {
		return [false, 'You need to be a T3 patron or higher to use this command.'];
	}
	const currentDate = Date.now();
	const lastDate = Number(user.user.lastSpawnLamp);
	const difference = currentDate - lastDate;

	const cooldown = spawnLampResetTime(user, perkTier);

	if (difference < cooldown) {
		const duration = formatDuration(Date.now() - (lastDate + cooldown));
		return [false, `You can spawn another lamp in ${duration}.`];
	}
	return [true];
}

function generateXPLevelQuestion() {
	const level = randInt(1, 120);
	const xp = randInt(convertLVLtoXP(level), convertLVLtoXP(level + 1) - 1);

	return {
		question: `What level would you be at with ${xp.toLocaleString()} XP?`,
		answer: level.toString(),
		explainAnswer: `${xp.toLocaleString()} is level ${level}!`
	};
}

export async function spawnLampCommand(user: MUser, interaction: MInteraction): CommandResponse {
	if (globalConfig.isProduction && interaction.guildId !== globalConfig.supportServerID) {
		return 'You can only use this command in the support server.';
	}
	const [lampIsReady, reason] = user.isAdmin() ? [true, ''] : await spawnLampIsReady(user, interaction.channelId);
	if (!lampIsReady && reason) return reason;

	const group = await findGroupOfUser(user.id);
	await prisma.user.updateMany({
		where: {
			id: {
				in: group
			}
		},
		data: {
			lastSpawnLamp: Date.now()
		}
	});

	const { answer, question, explainAnswer } = generateXPLevelQuestion();

	await interaction.replyWithResponse({
		content: `${BSOEmoji.HugeLamp} ${userMention(user.id)} spawned a Lamp: ${question}`,
		withResponse: true
	});
	const messages = await globalClient.awaitMessages({
		channelId: interaction.channelId,
		time: Time.Minute,
		filter: m => m.content === answer
	});

	if (!messages[0]) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(messages[0].author.id);
	const loot = LampTable.roll();
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `${winner} got it, and won **${loot}**! ${explainAnswer}`;
}

export async function spawnBoxCommand(user: MUser, interaction: MInteraction): CommandResponse {
	const perkTier = await user.fetchPerkTier();
	if (perkTier < PerkTier.Four && !user.bitfield.includes(BitField.HasPermanentEventBackgrounds)) {
		return 'You need to be a T3 patron or higher to use this command.';
	}
	if (globalConfig.isProduction && ![Channel.GeneralChannel, Channel.ServerGeneral].includes(interaction.channelId)) {
		return "You can't use spawnbox in this channel.";
	}
	const lastUse = Number(user.user.last_spawn_box_date ?? 0);
	const difference = Date.now() - lastUse;
	const isOnCooldown = difference < SPAWN_BOX_COOLDOWN ? SPAWN_BOX_COOLDOWN - difference : null;
	if (isOnCooldown !== null) {
		return `This command is on cooldown for you for ${formatDuration(isOnCooldown)}.`;
	}
	await user.update({
		last_spawn_box_date: Date.now()
	});
	const { answer, question, explainAnswer } = generateXPLevelQuestion();
	const timeToAnswer = Time.Minute;

	await interaction.replyWithResponse({
		content: `${Emoji.MysteryBox} ${userMention(user.id)} spawned a Mystery Box, answer within ${time(Math.floor((Date.now() + timeToAnswer) / 1000), 'R')} by replying to this message.

${bold(question)}`,
		withResponse: true
	});
	const messages = await globalClient.awaitMessages({
		channelId: interaction.channelId,
		time: timeToAnswer,
		filter: m => m.content === answer
	});
	if (!messages[0]) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(messages[0].author.id);

	const loot = new Bank().add(MysteryBoxes.roll());
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `Congratulations, ${winner}! You received: **${loot}**. ${explainAnswer}`;
}

export async function giveBox(user: MUser, _recipient: MahojiUserOption) {
	if (!_recipient) return 'You need to specify a user to give a box to.';
	const recipient = await mUserFetch(_recipient.user.id);

	const currentDate = Date.now();
	const lastDate = Number(user.user.lastGivenBoxx);
	const difference = currentDate - lastDate;

	// If no user or not an owner and can not send one yet, show time till next box.
	if (difference < giveBoxResetTime && !user.isAdmin()) {
		return `You can give another box in ${formatDuration(giveBoxResetTime - difference)}`;
	}

	if (recipient.id === user.id) return "You can't give boxes to yourself!";
	if (recipient.isIronman) return "You can't give boxes to ironmen!";
	await user.update({
		lastGivenBoxx: currentDate
	});

	const boxToReceive = new Bank().add(roll(10) ? MysteryBoxes.roll() : itemID('Mystery box'));

	await recipient.addItemsToBank({ items: boxToReceive, collectionLog: false });

	return `Gave **${boxToReceive}** to ${recipient}.`;
}
