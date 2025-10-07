import { giveBoxResetTime } from '@/lib/bso/bsoConstants.js';
import { buttonUserPicker } from '@/lib/bso/buttonUserPicker.js';
import { MysteryBoxes } from '@/lib/bso/openables/tables.js';
import { findGroupOfUser } from '@/lib/bso/util/findGroupOfUser.js';
import { LampTable } from '@/lib/bso/xpLamps.js';

import { randArrItem, randInt, roll, shuffleArr } from '@oldschoolgg/rng';
import { Emoji, formatDuration, PerkTier, Time } from '@oldschoolgg/toolkit';
import { userMention } from 'discord.js';
import { Bank, convertLVLtoXP, itemID } from 'oldschooljs';

import { BitField, Channel, globalConfig } from '@/lib/constants.js';
import { Cooldowns } from '@/mahoji/lib/Cooldowns.js';

export const spawnLampResetTime = (user: MUser) => {
	const bf = user.bitfield;
	const perkTier = user.perkTier();

	const hasPerm = bf.includes(BitField.HasPermanentSpawnLamp);
	const hasTier5 = perkTier >= PerkTier.Five;
	const hasTier4 = !hasTier5 && perkTier === PerkTier.Four;

	let cooldown = ([PerkTier.Six, PerkTier.Five] as number[]).includes(perkTier) ? Time.Hour * 12 : Time.Hour * 24;

	if (!hasTier5 && !hasTier4 && hasPerm) {
		cooldown = Time.Hour * 48;
	}

	return cooldown - Time.Minute * 15;
};

export function spawnLampIsReady(user: MUser, channelID: string): [true] | [false, string] {
	if (![Channel.GeneralChannel, Channel.ServerGeneral].includes(channelID)) {
		return [false, "You can't use spawnlamp in this channel."];
	}

	const perkTier = user.perkTier();
	const isPatron = perkTier >= PerkTier.Four || user.bitfield.includes(BitField.HasPermanentSpawnLamp);
	if (!isPatron) {
		return [false, 'You need to be a T3 patron or higher to use this command.'];
	}
	const currentDate = Date.now();
	const lastDate = Number(user.user.lastSpawnLamp);
	const difference = currentDate - lastDate;

	const cooldown = spawnLampResetTime(user);

	if (difference < cooldown) {
		const duration = formatDuration(Date.now() - (lastDate + cooldown));
		return [false, `You can spawn another lamp in ${duration}.`];
	}
	return [true];
}

function generateXPLevelQuestion() {
	const level = randInt(1, 120);
	const xp = randInt(convertLVLtoXP(level), convertLVLtoXP(level + 1) - 1);

	const chanceOfSwitching = randInt(1, 4);

	const answers: string[] = [level.toString()];
	const arr = shuffleArr(['plus', 'minus'] as const);

	while (answers.length < 4) {
		const modifier = randArrItem([1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10, 10]);
		const action = roll(chanceOfSwitching) ? arr[0] : arr[1];
		let potentialAnswer = action === 'plus' ? level + modifier : level - modifier;
		if (potentialAnswer < 1) potentialAnswer = level + modifier;
		else if (potentialAnswer > 120) potentialAnswer = level - modifier;

		if (answers.includes(potentialAnswer.toString())) continue;
		answers.push(potentialAnswer.toString());
	}

	return {
		question: `What level would you be at with **${xp.toLocaleString()}** XP?`,
		answers,
		explainAnswer: `${xp.toLocaleString()} is level ${level}!`
	};
}

export async function spawnLampCommand(user: MUser, channelID: string, guildId: string | null): CommandResponse {
	if (guildId !== globalConfig.supportServerID) {
		return 'You can only use this command in the support server.';
	}
	const isAdmin = globalConfig.adminUserIDs.includes(user.id);
	const [lampIsReady, reason] = isAdmin ? [true, ''] : spawnLampIsReady(user, channelID);
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

	const { answers, question, explainAnswer } = generateXPLevelQuestion();

	const winnerID = await buttonUserPicker({
		channelID,
		str: `<:Huge_lamp:988325171498721290> ${userMention(user.id)} spawned a Lamp: ${question}`,
		ironmenAllowed: false,
		answers,
		creator: user.id,
		creatorGetsTwoGuesses: true
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(winnerID);
	const loot = LampTable.roll();
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `${winner} got it, and won **${loot}**! ${explainAnswer}`;
}

export async function spawnBoxCommand(user: MUser, channelID: string): CommandResponse {
	const perkTier = user.perkTier();
	if (perkTier < PerkTier.Four && !user.bitfield.includes(BitField.HasPermanentEventBackgrounds)) {
		return 'You need to be a T3 patron or higher to use this command.';
	}
	if (![Channel.GeneralChannel, Channel.ServerGeneral].includes(channelID)) {
		return "You can't use spawnbox in this channel.";
	}
	const isOnCooldown = Cooldowns.get(user.id, 'SPAWN_BOX', Time.Minute * 45);
	if (isOnCooldown !== null) {
		return `This command is on cooldown for you for ${formatDuration(isOnCooldown)}.`;
	}
	const { answers, question, explainAnswer } = generateXPLevelQuestion();

	const winnerID = await buttonUserPicker({
		channelID,
		str: `${Emoji.MysteryBox} ${userMention(user.id)} spawned a Mystery Box: ${question}`,
		ironmenAllowed: false,
		answers,
		creator: user.id
	});
	if (!winnerID) return `Nobody got it. ${explainAnswer}`;
	const winner = await mUserFetch(winnerID);

	const loot = new Bank().add(MysteryBoxes.roll());
	await winner.addItemsToBank({ items: loot, collectionLog: false });
	return `Congratulations, ${winner}! You received: **${loot}**. ${explainAnswer}`;
}

export async function giveBox(mahojiUser: MUser, _recipient: MahojiUserOption) {
	if (!_recipient) return 'You need to specify a user to give a box to.';
	const recipient = await mUserFetch(_recipient.user.id);

	const currentDate = Date.now();
	const lastDate = Number(mahojiUser.user.lastGivenBoxx);
	const difference = currentDate - lastDate;
	const isOwner = globalConfig.adminUserIDs.includes(mahojiUser.id);

	// If no user or not an owner and can not send one yet, show time till next box.
	if (difference < giveBoxResetTime && !isOwner) {
		return `You can give another box in ${formatDuration(giveBoxResetTime - difference)}`;
	}

	if (recipient.id === mahojiUser.id) return "You can't give boxes to yourself!";
	if (recipient.isIronman) return "You can't give boxes to ironmen!";
	await mahojiUser.update({
		lastGivenBoxx: currentDate
	});

	const boxToReceive = new Bank().add(roll(10) ? MysteryBoxes.roll() : itemID('Mystery box'));

	await recipient.addItemsToBank({ items: boxToReceive, collectionLog: false });

	return `Gave **${boxToReceive}** to ${recipient}.`;
}
