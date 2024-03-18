/* eslint-disable prefer-destructuring */
import { Canvas } from '@napi-rs/canvas';
import { Time } from 'e';
import { readFileSync } from 'fs';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { defaultMegaDuckLocation, MegaDuckLocation } from '../../lib/minions/types';
import { prisma } from '../../lib/settings/prisma';
import { getUsername, resetCooldown } from '../../lib/util';
import { canvasImageFromBuffer } from '../../lib/util/canvasUtil';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { mahojiGuildSettingsUpdate } from '../guildSettings';
import { OSBMahojiCommand } from '../lib/util';

const _mapImage = readFileSync('./src/lib/resources/images/megaduckmap.png');
const noMoveImageBuf = readFileSync('./src/lib/resources/images/megaducknomovemap.png');

let apeAtoll = [1059, 1226];
let portSarim = [1418, 422];
let karamja = [1293, 554];
let flyer = [1358, 728];
const teleportationLocations = [
	[
		{ name: 'Port Sarim', coords: portSarim },
		{ name: 'Karamja', coords: karamja }
	],
	[
		{ name: 'Gnome Flyer', coords: flyer },
		{ name: 'Ape Atoll', coords: apeAtoll }
	]
];

function locationIsFinished(location: MegaDuckLocation) {
	return location.x < 770 && location.y > 1011;
}

function topFeeders(entries: any[]) {
	return `Top 10 Feeders: ${[...entries]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(ent => `${getUsername(ent[0])}. ${ent[1]}`)
		.join(', ')}`;
}

const directions = ['up', 'down', 'left', 'right'] as const;
type MegaduckDirection = (typeof directions)[number];

function applyDirection(location: MegaDuckLocation, direction: MegaduckDirection): MegaDuckLocation {
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

function getPixel(x: number, y: number, data: any, width: number) {
	let i = (width * Math.round(y) + Math.round(x)) * 4;
	return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

const _noMoveImage = canvasImageFromBuffer(noMoveImageBuf);

async function makeImage(location: MegaDuckLocation) {
	const { x, y, steps = [] } = location;
	const mapImage = await canvasImageFromBuffer(_mapImage);
	const noMoveImage = await _noMoveImage;

	const scale = 3;
	const canvasSize = 250;

	const centerPosition = Math.floor(canvasSize / 2 / scale);

	const canvas = new Canvas(canvasSize, canvasSize);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	ctx.scale(scale, scale);
	ctx.drawImage(mapImage, 0 - x + centerPosition, 0 - y + centerPosition);

	// image.addImage(noMoveImage as any, 0 - x + centerPosition, 0 - y + centerPosition);

	ctx.font = '14px Arial';
	ctx.fillStyle = '#ffff00';
	ctx.fillRect(centerPosition, centerPosition, 1, 1);

	const noMoveCanvas = new Canvas(noMoveImage.width, noMoveImage.height);
	const noMoveCanvasCtx = noMoveCanvas.getContext('2d');
	noMoveCanvasCtx.drawImage(noMoveImage, 0, 0);

	const currentColor = getPixel(
		x,
		y,
		noMoveCanvasCtx.getImageData(0, 0, noMoveCanvasCtx.canvas.width, noMoveCanvasCtx.canvas.height).data,
		noMoveCanvas.width
	);

	ctx.fillStyle = 'rgba(0,0,255,0.05)';
	for (const [_xS, _yS] of steps) {
		let xS = _xS - x + centerPosition;
		let yS = _yS - y + centerPosition;
		ctx.fillRect(xS, yS, 1, 1);
	}

	const buffer = await canvas.encode('png');

	return {
		image: buffer,
		currentColor
	};
}

export const megaDuckCommand: OSBMahojiCommand = {
	name: 'megaduck',
	description: 'Mega duck!.',
	attributes: {
		requiresMinion: true,
		cooldown: 30 * Time.Second
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'move',
			description: 'Move megaduck in a direction.',
			required: false,
			choices: directions.map(i => ({ name: i, value: i }))
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'reset',
			description: 'Reset megaduck back to falador? (admin only)',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		guildID,
		interaction
	}: CommandRunOptions<{ move?: MegaduckDirection; reset?: boolean }>) => {
		const user = await mUserFetch(userID);
		const withoutCooldown = (message: string) => {
			resetCooldown(user, 'megaduck');
			return message;
		};

		const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : null;
		if (!guild) return withoutCooldown('You can only run this in a guild.');

		const settings = await prisma.guild.upsert({
			where: {
				id: guild.id
			},
			update: {},
			create: {
				id: guild.id
			},
			select: {
				mega_duck_location: true,
				id: true
			}
		});
		const location: Readonly<MegaDuckLocation> = {
			...((settings.mega_duck_location as any) || defaultMegaDuckLocation)
		};

		const direction = options.move;

		const member = guild.members.cache.get(userID.toString());
		if (options.reset && member && member.permissions.has('Administrator')) {
			await handleMahojiConfirmation(
				interaction,
				'Are you sure you want to reset your megaduck back to Falador Park? This will reset all data, and where its been, and who has contributed steps.'
			);
			await mahojiGuildSettingsUpdate(guild, {
				mega_duck_location: {
					...defaultMegaDuckLocation,
					steps: location.steps
				}
			});
		}

		const { image } = await makeImage(location);
		if (!direction) {
			return {
				content: `${user} Mega duck is at ${location.x}x ${location.y}y. You've moved it ${
					location.usersParticipated[user.id] ?? 0
				} times. ${topFeeders(Object.entries(location.usersParticipated))}`,
				files: [{ attachment: image, name: 'megaduck.png' }]
			};
		}

		const cost = new Bank().add('Breadcrumbs');
		if (!user.owns(cost)) {
			return withoutCooldown(`${user} The Mega Duck won't move for you, it wants some food.`);
		}

		let newLocation = applyDirection(location, direction);
		const newLocationResult = await makeImage(newLocation);
		if (newLocationResult.currentColor[3] !== 0) {
			return "You can't move here.";
		}

		if (newLocation.usersParticipated[user.id]) {
			newLocation.usersParticipated[user.id]++;
		} else {
			newLocation.usersParticipated[user.id] = 1;
		}

		await user.removeItemsFromBank(cost);
		newLocation = { ...defaultMegaDuckLocation, ...newLocation };
		let str = '';
		for (const link of teleportationLocations) {
			const [first, second] = link;
			if (newLocation.x === first.coords[0] && newLocation.y === first.coords[1]) {
				newLocation.x = second.coords[0];
				newLocation.y = second.coords[1];
				str += `\n\nYou teleported from ${first.name} to ${second.name}.`;
			} else if (newLocation.x === second.coords[0] && newLocation.y === second.coords[1]) {
				newLocation.x = first.coords[0];
				newLocation.y = first.coords[1];
				str += `\n\nYou teleported from ${second.name} to ${first.name}.`;
			}
		}
		newLocation.steps.push([newLocation.x, newLocation.y]);
		await mahojiGuildSettingsUpdate(guild, {
			mega_duck_location: newLocation as any
		});
		if (
			!locationIsFinished(location) &&
			locationIsFinished(newLocation) &&
			!newLocation.placesVisited.includes('ocean')
		) {
			const loot = new Bank().add('Baby duckling');
			const entries = Object.entries(newLocation.usersParticipated).sort((a, b) => b[1] - a[1]);
			for (const [id] of entries) {
				try {
					const user = await mUserFetch(id);
					await user.addItemsToBank({ items: loot, collectionLog: true });
				} catch {}
			}
			const newT: MegaDuckLocation = {
				...newLocation,
				usersParticipated: {},
				placesVisited: [...newLocation.placesVisited, 'ocean']
			};
			await mahojiGuildSettingsUpdate(guild, {
				mega_duck_location: newT as any
			});
			globalClient.emit(
				Events.ServerNotification,
				`The ${guild.name} server just returned Mega Duck into the ocean with Mrs Duck, ${
					Object.keys(newLocation.usersParticipated).length
				} users received a Baby duckling pet. ${topFeeders(entries)}`
			);
			return `Mega duck has arrived at his destination! ${
				Object.keys(newLocation.usersParticipated).length
			} users received a Baby duckling pet. ${topFeeders(entries)}`;
		}
		return {
			content: `${user} You moved Mega Duck ${direction}! You've moved him ${
				newLocation.usersParticipated[user.id]
			} times. Removed ${cost} from your bank.${str}`,
			files: location.steps?.length % 2 === 0 ? [{ attachment: image, name: 'megaduck.png' }] : []
		};
	}
};
