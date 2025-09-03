import type { Message } from 'discord.js';

import { globalConfig } from '../../constants.js';
import { fetchUser } from '../../util.js';

function generateRankMessage(rank: number) {
	if (rank === 1) return 'Rank 1 👑🥇';
	if (rank === 2) return 'Rank 2 🏆🥈';
	if (rank === 3) return 'Rank 3 🏅🥉';
	if (rank < 10) return `Rank ${rank} 🎖️`;
	if (rank <= 500) return `Rank ${rank}`;
	return 'Not in Top 500';
}

export async function botReactHandler(msg: Message) {
	if (msg.content === `<@${globalConfig.appID}>`) {
		const u = await fetchUser(msg.author.id);
		if (!u) return;
		const combinedCLPercent = ((u.osb_cl_percent ?? 0) + (u.bso_cl_percent ?? 0)) / 2;
		const clPercentRank = (
			await roboChimpClient.$queryRaw<{ count: number }[]>`SELECT COUNT(*)
FROM public.user
WHERE ((osb_cl_percent + bso_cl_percent) / 2) >= ${combinedCLPercent};`
		)[0].count;

		msg.reply(`${msg.author.username}
**OSB Total Level:** ${u.osb_total_level ?? 'Unknown'}
**BSO Total Level:** ${u.bso_total_level ?? 'Unknown'}

**OSB CL %:** ${u.osb_cl_percent ?? 'Unknown'}
**BSO CL %:** ${u.bso_cl_percent ?? 'Unknown'}

**Combined CL%:** ${combinedCLPercent.toFixed(2)} (${generateRankMessage(clPercentRank)})`);
		return;
	}
}
