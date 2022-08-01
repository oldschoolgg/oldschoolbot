import { userMention } from '@discordjs/builders';
import { TextChannel } from 'discord.js';
import { KlasaUser } from 'klasa';
import { MessageFlags } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { setupParty } from '../../../extendables/Message/Party';
import { Emoji, NEX_ID } from '../../../lib/constants';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { calculateNexDetails, checkNexUser } from '../../../lib/simulation/nex';
import { NexTaskOptions } from '../../../lib/types/minions';
import { calcPerHour, formatDuration, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { mahojiUsersSettingsFetch } from '../../mahojiSettings';

export async function nexCommand(interaction: SlashCommandInteraction, user: KlasaUser, channelID: bigint) {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channel || channel.type !== 'text') return 'You need to run this in a text channel.';
	const mahojiUser = await mahojiUsersSettingsFetch(user.id);

	const ownerCheck = checkNexUser(mahojiUser);
	if (ownerCheck[1]) {
		return `You can't start a Nex mass: ${ownerCheck[1]}`;
	}

	await interaction.deferReply();

	let [usersWhoConfirmed, reactionAwaiter] = await setupParty(channel as TextChannel, user, {
		minSize: 2,
		maxSize: 10,
		leader: user,
		ironmanAllowed: true,
		message: `${user} is hosting a Nex mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
		customDenier: async user => checkNexUser(await mahojiUsersSettingsFetch(user.id))
	});
	try {
		await reactionAwaiter();
	} catch (err: any) {
		return {
			content: typeof err === 'string' ? err : 'Your mass failed to start.',
			flags: MessageFlags.Ephemeral
		};
	}
	usersWhoConfirmed = usersWhoConfirmed.filter(i => !i.minionIsBusy);

	if (usersWhoConfirmed.length < 2 || usersWhoConfirmed.length > 10) {
		return `${user}, your mass didn't start because it needs atleast 2 users.`;
	}

	const mahojiUsers = await Promise.all(usersWhoConfirmed.map(i => mahojiUsersSettingsFetch(i.id)));

	for (const user of mahojiUsers) {
		const result = checkNexUser(user);
		if (result[1]) {
			return result[1];
		}
	}

	const details = calculateNexDetails({
		team: mahojiUsers
	});

	const totalCost = new Bank();
	for (const user of details.team) {
		const klasaUser = await globalClient.fetchUser(user.id);
		if (!klasaUser.allItemsOwned().has(user.cost)) {
			return `${klasaUser} doesn't have the required items: ${user.cost}.`;
		}
		totalCost.add(user.cost);
	}

	await Promise.all([
		await updateBankSetting(globalClient, ClientSettings.EconomyStats.TOBCost, totalCost),
		await trackLoot({
			cost: totalCost,
			id: 'nex',
			type: 'Monster',
			changeType: 'cost'
		}),
		...details.team.map(async i => {
			const klasaUser = await globalClient.fetchUser(i.id);
			await klasaUser.specialRemoveItems(i.cost);
		})
	]);

	await addSubTaskToActivityTask<NexTaskOptions>({
		userID: user.id,
		channelID: channelID.toString(),
		duration: details.duration,
		type: 'Nex',
		leader: user.id,
		users: details.team.map(i => i.id),
		userDetails: details.team.map(i => [i.id, i.contribution, i.deaths]),
		fakeDuration: details.fakeDuration,
		quantity: details.quantity,
		wipedKill: details.wipedKill
	});

	let str = `${user.username}'s party (${usersWhoConfirmed.map(u => u.username).join(', ')}) is now off to kill ${
		details.quantity
	}x Nex! (${calcPerHour(details.quantity, details.fakeDuration).toFixed(
		1
	)}/hr) - the total trip will take ${formatDuration(details.fakeDuration)}.

${details.team
	.map(i => {
		const mUser = mahojiUsers.find(t => t.id === i.id)!;
		return `${userMention(i.id)}: Contrib[${i.contribution.toFixed(2)}%] Death[${i.deathChance.toFixed(2)}%] KC[${
			(mUser.monsterScores as any)[NEX_ID] ?? 0
		}] Offence[${Math.round(i.totalOffensivePecent)}%] Defence[${Math.round(
			i.totalDefensivePercent
		)}%] *${i.messages.join(', ')}*`;
	})
	.join('\n')}
`;

	return str;
}
