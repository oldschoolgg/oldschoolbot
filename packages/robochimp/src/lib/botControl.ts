export const botServiceChoices = [
	{ name: 'OSB', value: 'osb' },
	{ name: 'BSO', value: 'bso' }
] as const;

export type BotService = (typeof botServiceChoices)[number]['value'];

export function isBotService(input: string): input is BotService {
	return botServiceChoices.some(choice => choice.value === input);
}

export async function setBotShutdown(bot: BotService, shutdown: boolean) {
	if (bot === 'osb') {
		await osbClient.clientStorage.updateMany({ data: { shutdown } });
		return;
	}
	await bsoClient.clientStorage.updateMany({ data: { shutdown } });
}

export async function getBotShutdown(bot: BotService) {
	if (bot === 'osb') {
		const settings = await osbClient.clientStorage.findFirst({ select: { shutdown: true } });
		return settings?.shutdown ?? false;
	}
	const settings = await bsoClient.clientStorage.findFirst({ select: { shutdown: true } });
	return settings?.shutdown ?? false;
}
