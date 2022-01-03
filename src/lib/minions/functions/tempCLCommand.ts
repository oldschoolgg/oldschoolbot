import { KlasaMessage } from 'klasa';

import { prisma } from '../../settings/prisma';
import { UserSettings } from '../../settings/types/UserSettings';

export async function tempCLCommand(msg: KlasaMessage, input: string) {
	input = input.toLowerCase();

	if (input === 'reset') {
		await msg.confirm('Are you sure you want to reset your Temporary Collection Log? You cannot undo this.');
		await msg.author.settings.update(UserSettings.TempCL, {});
		await prisma.user.update({
			where: {
				id: msg.author.id
			},
			data: {
				last_temp_cl_reset: new Date()
			}
		});
		return msg.channel.send('Reset your temporary CL.');
	}

	const lastReset = await prisma.user.findUnique({
		where: {
			id: msg.author.id
		},
		select: {
			last_temp_cl_reset: true
		}
	});
	return msg.channel.send(`You can view your temporary CL using, for example, \`${msg.cmdPrefix}cl boss --temp\`.
You last reset your temporary CL: ${
		Boolean(lastReset?.last_temp_cl_reset)
			? `<t:${Math.floor((lastReset?.last_temp_cl_reset?.getTime() ?? 1) / 1000)}>`
			: 'Never'
	}`);
}
