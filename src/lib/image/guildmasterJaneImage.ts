import { MessageAttachment } from 'discord.js';

import chatHeadImage from './chatHeadImage';

export default async function guildmasterJaneImage(str: string) {
	const image = await chatHeadImage({
		id: 2,
		content: str,
		name: 'Guildmaster Jane'
	});
	return new MessageAttachment(image);
}
