/* eslint-disable prefer-destructuring */
import { Image } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { readFileSync } from 'fs';
import jimp from 'jimp';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { MegaDuckLocation } from '../../lib/minions/types';
import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { getUsername } from '../../lib/util';
import { canvasImageFromBuffer } from '../../lib/util/canvasUtil';

const _mapImage = readFileSync('./src/lib/resources/images/megaduckmap.png');
const _noMoveImage = readFileSync('./src/lib/resources/images/megaducknomovemap.png');

function locationIsFinished(location: MegaDuckLocation) {
	return location.x < 770 && location.y > 1011;
}

function topFeeders(client: KlasaClient, entries: any[]) {
	return `Top 10 Feeders: ${entries
		.slice(0, 10)
		.map(ent => `${getUsername(client, ent[0])}. ${ent[1]}`)
		.join(', ')}`;
}

function applyDirection(location: MegaDuckLocation, direction: 'up' | 'down' | 'left' | 'right') {
	let newLocation = { ...location };
	switch (direction) {
		case 'up':
			newLocation.y--;
			break;
		case 'down':
			newLocation.y++;
			break;
		case 'left':
			newLocation.x--;
			break;
		case 'right':
			newLocation.x++;
			break;
	}
	return newLocation;
}

export default class extends BotCommand {
	noMoveImage: Promise<Image>;
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 120,
			oneAtTime: true,
			description: 'Looks up the price of an item using the OSBuddy API.',
			usage: '[up|down|left|right]',
			runIn: ['text']
		});
		this.noMoveImage = canvasImageFromBuffer(_noMoveImage);
	}

	getPixel(x: number, y: number, data: any, width: number) {
		let i = (width * Math.round(y) + Math.round(x)) * 4;
		return [data[i], data[i + 1], data[i + 2], data[i + 3]];
	}

	async makeImage(location: MegaDuckLocation) {
		const { x, y } = location;
		const mapImage = await canvasImageFromBuffer(_mapImage);
		const noMoveImage = await this.noMoveImage;

		const scale = 3;
		const canvasSize = 250;

		const centerPosition = Math.floor(canvasSize / 2 / scale);

		const canvas = new Canvas(canvasSize, canvasSize);
		canvas.context.imageSmoothingEnabled = false;

		const image = await canvas
			.scale(scale, scale)
			.addImage(mapImage as any, 0 - x + centerPosition, 0 - y + centerPosition);

		// image.addImage(noMoveImage as any, 0 - x + centerPosition, 0 - y + centerPosition);

		image.setTextFont('14px Arial').setColor('#ffff00').addRect(centerPosition, centerPosition, 1, 1);

		const noMoveCanvas = new Canvas(noMoveImage.width, noMoveImage.height).addImage(noMoveImage as any, 0, 0);

		const currentColor = this.getPixel(
			x,
			y,
			noMoveCanvas.context.getImageData(0, 0, noMoveCanvas.canvas.width, noMoveCanvas.canvas.height).data,
			noMoveCanvas.canvas.width
		);

		const buffer = await image.toBufferAsync();

		return {
			image: await (await jimp.read(buffer)).quality(65).getBufferAsync(jimp.MIME_JPEG),
			currentColor
		};
	}

	async run(msg: KlasaMessage, [direction]: ['up' | 'down' | 'left' | 'right' | undefined]) {
		const settings = await getGuildSettings(msg.guild!);
		const location = settings.get(GuildSettings.MegaDuckLocation);
		const { image } = await this.makeImage(location);
		if (!direction) {
			return msg.channel.send({
				content: `Mega duck is at ${location.x}x ${location.y}y. You've moved it ${
					location.usersParticipated[msg.author.id] ?? 0
				} times. ${topFeeders(this.client, Object.entries(location.usersParticipated))}`,
				files: [image]
			});
		}

		const cost = new Bank().add('Breadcrumbs');
		if (!msg.author.owns(cost)) {
			return msg.channel.send("The Mega Duck won't move for you, it wants some food.");
		}

		const newLocation = applyDirection(location, direction);
		const newLocationResult = await this.makeImage(newLocation);
		if (newLocationResult.currentColor[3] !== 0) {
			return msg.channel.send("You can't move here.");
		}

		if (newLocation.usersParticipated[msg.author.id]) {
			newLocation.usersParticipated[msg.author.id]++;
		} else {
			newLocation.usersParticipated[msg.author.id] = 1;
		}

		await msg.author.removeItemsFromBank(cost);
		await settings.update(GuildSettings.MegaDuckLocation, newLocation);
		if (!locationIsFinished(location) && locationIsFinished(newLocation)) {
			const loot = new Bank().add('Baby duckling');
			const entries = Object.entries(newLocation.usersParticipated).sort((a, b) => b[1] - a[1]);
			for (const [id] of entries) {
				try {
					const user = await this.client.fetchUser(id);
					await user.addItemsToBank(loot, true);
				} catch {}
			}
			return msg.channel.send(
				`Mega duck has arrived at his destination! ${
					Object.keys(newLocation.usersParticipated).length
				} users received a Baby duckling pet. ${topFeeders(this.client, entries)}`
			);
		}
		return msg.channel.send({
			content: `You moved Mega Duck ${direction}! You've moved him ${
				newLocation.usersParticipated[msg.author.id]
			} times. Removed ${cost} from your bank.`,
			files: [newLocationResult.image]
		});
	}
}
