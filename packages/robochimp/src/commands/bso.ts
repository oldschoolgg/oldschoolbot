import { userMention } from '@oldschoolgg/discord';
import { SimpleTable, Time } from '@oldschoolgg/toolkit';
import { convertLVLtoXP, type ItemBank } from 'oldschooljs';

const LampTable = new SimpleTable<number>().add(6796, 40).add(21_642, 30).add(23_516, 20).add(22_320, 5).add(11_157, 1);

const lampMap: Record<number, string> = {
	6796: 'Tiny lamp',
	21642: 'Small lamp',
	23516: 'Medium lamp',
	22320: 'Large lamp',
	11157: 'Huge lamp'
};

function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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

export const bsoCommand = defineCommand({
	name: 'bso',
	description: 'BSO-specific Robochimp commands.',
	options: [
		{
			type: 'Subcommand',
			name: 'spawnlamp',
			description: 'Spawn a BSO lamp question.'
		}
	],
	run: async ({ options, user, interaction }) => {
		if (!options.spawnlamp) return 'Invalid command.';

		await interaction.defer();

		// if (globalConfig.isProduction && interaction.guildId !== globalConfig.supportServerID) {
		// 	return 'You can only use this command in the support server.';
		// }
		// const [lampIsReady, reason] = user.isAdmin() ? [true, ''] : await spawnLampIsReady(user, interaction.channelId);
		// if (!lampIsReady && reason) return reason;
		//
		// const group = await findGroupOfUser(user.id);
		// await prisma.user.updateMany({
		// 	where: {
		// 		id: {
		// 			in: group
		// 		}
		// 	},
		// 	data: {
		// 		lastSpawnLamp: Date.now()
		// 	}
		// });

		if (!user.isAdmin()) {
			return 'Only admins can use this command.';
		}

		const { answer, question, explainAnswer } = generateXPLevelQuestion();
		const createdMessage = await interaction.replyWithResponse({
			content: `${userMention(user.id.toString())} spawned a Lamp: ${question}`,
			withResponse: true
		});
		const messages = await globalClient.awaitMessages({
			channelId: interaction.channelId,
			time: Time.Minute,
			filter: m => m.content === answer
		});

		if (!messages[0]) {
			const content = `Nobody got it. ${explainAnswer}`;
			await globalClient.editMessage(interaction.channelId, createdMessage!.message_id, { content });
			return { content };
		}

		const winner = await globalClient.fetchRUser(messages[0].author.id);
		const winningItemId = LampTable.rollOrThrow();
		const lootName = lampMap[winningItemId] ?? `item ${winningItemId}`;
		const bsoPrizeBank: ItemBank = { ...winner.bsoPrizeBank };
		const itemKey = winningItemId.toString();
		bsoPrizeBank[itemKey] = bsoPrizeBank[itemKey] ? ++bsoPrizeBank[itemKey] : 1;
		await winner.update({
			bso_prize_bank: bsoPrizeBank
		});

		const content = `${winner.mention} got it, and won **1x ${lootName}**! ${explainAnswer}`;
		await globalClient.editMessage(interaction.channelId, createdMessage!.message_id, { content });

		if (lootName === 'Large lamp' || lootName === 'Huge lamp') {
			await globalClient.sendMessage(interaction.channelId, {
				content: `Wow! <@${winner.id.toString()}> just won a 1x ${lootName}!`
			});
		}

		return { content };
	}
});
