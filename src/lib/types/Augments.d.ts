import { Image } from 'skia-canvas/lib';

declare module 'klasa' {
	interface Task {
		getItemImage(itemID: number, quantity: number): Promise<Image>;
	}
}

declare module 'discord.js/node_modules/discord-api-types/v8' {
	type Snowflake = string;
}
