import type { Message } from 'discord.js';


function generateRankMessage(rank: number) {
	if (rank === 1) return 'Rank 1 👑🥇';
	if (rank === 2) return 'Rank 2 🏆🥈';
	if (rank === 3) return 'Rank 3 🏅🥉';
	if (rank < 10) return `Rank ${rank} 🎖️`;
	if (rank <= 500) return `Rank ${rank}`;
	return 'Not in Top 500';
}

export async function botReactHandler(msg: Message) {
	if (msg.content === `<@${globalClient.applicationId}>`) {
		const u = await globalClient.fetchUser(msg.author.id);
		if (!u) return;
		const combinedCLPercent = ((u.osbClPercent ?? 0) + (u.bsoClPercent ?? 0)) / 2;
		const clPercentRank = (
			await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)
FROM public.user
WHERE ((osb_cl_percent + bso_cl_percent) / 2) >= ${combinedCLPercent};`
		)[0].count;

		msg.reply(`${msg.author.username}
**OSB Total Level:** ${u.osbTotalLevel ?? 'Unknown'}
**BSO Total Level:** ${u.bsoTotalLevel ?? 'Unknown'}

**OSB CL %:** ${u.osbClPercent ?? 'Unknown'}
**BSO CL %:** ${u.bsoClPercent ?? 'Unknown'}

**Combined CL%:** ${combinedCLPercent.toFixed(2)} (${generateRankMessage(clPercentRank)})`);
		return;
	}
}
