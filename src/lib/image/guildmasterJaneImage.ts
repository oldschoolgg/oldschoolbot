import { MessageAttachment } from 'discord.js';

import chatHeadImage from './chatHeadImage';

export default async function guildmasterJaneImage(str: string) {
	const image = await chatHeadImage({
		content: str,
		name: 'Guildmaster Jane',
		head: 'jane'
	});
	return new MessageAttachment(image);
}
