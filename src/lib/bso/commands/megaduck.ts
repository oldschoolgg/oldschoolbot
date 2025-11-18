import { defaultMegaDuckLocation, type MegaDuckLocation } from '@/lib/bso/megaDuck.js';

import { Events, } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { canvasToBuffer, createCanvas, loadAndCacheLocalImage } from '@/lib/canvas/canvasUtil.js';
import { globalConfig } from '@/lib/constants.js';

const apeAtoll = [1059, 1226];
const portSarim = [1418, 422];
const karamja = [1293, 554];
const flyer = [1358, 728];
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

async function topFeeders(entries: any[]) {
	const users = await Promise.all([...entries]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10).map(async u => {
			const username = await Cache.getBadgedUsername(u[0]);
			return { username, count: u[1] };
		}));
	return `Top 10 Feeders: ${users.map(ent => `${ent.username}. ${ent.count}`)
			.join(', ')}`;
}

const directions = ['up', 'down', 'left', 'right'] as const;
type MegaduckDirection = (typeof directions)[number];

function applyDirection(location: MegaDuckLocation, direction: MegaduckDirection): MegaDuckLocation {
	const newLocation = { ...location };
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
	const i = (width * Math.round(y) + Math.round(x)) * 4;
	return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

async function makeImage(location: MegaDuckLocation) {
	const { x, y, steps = [] } = location;
	const mapImage = await loadAndCacheLocalImage('./src/lib/resources/images/megaduckmap.png');
	const noMoveImage = await loadAndCacheLocalImage('./src/lib/resources/images/megaducknomovemap.png');

	const scale = 3;
	const canvasSize = 250;

	const centerPosition = Math.floor(canvasSize / 2 / scale);

	const canvas = createCanvas(canvasSize, canvasSize);
	const ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	ctx.scale(scale, scale);
	ctx.drawImage(mapImage, 0 - x + centerPosition, 0 - y + centerPosition);

	// image.addImage(noMoveImage as any, 0 - x + centerPosition, 0 - y + centerPosition);

	ctx.font = '14px Arial';
	ctx.fillStyle = '#ffff00';
	ctx.fillRect(centerPosition, centerPosition, 1, 1);

	const noMoveCanvas = createCanvas(noMoveImage.width, noMoveImage.height);
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
		const xS = _xS - x + centerPosition;
		const yS = _yS - y + centerPosition;
		ctx.fillRect(xS, yS, 1, 1);
	}

	const buffer = await canvasToBuffer(canvas);

	return {
		image: buffer,
		currentColor
	};
}

export const megaDuckCommand = defineCommand({
	name: 'megaduck',
	description: 'Mega duck!.',
	attributes: {
		requiresMinion: true,
	},
	options: [
		{
			type: 'String',
			name: 'move',
			description: 'Move megaduck in a direction.',
			required: false,
			choices: directions.map(i => ({ name: i, value: i }))
		},
		{
			type: 'Boolean',
			name: 'reset',
			description: 'Reset megaduck back to falador? (admin only)',
			required: false
		}
	],
	run: async ({ options, user, guildId, interaction, userId }) => {
		if (!guildId) return ('You can only run this in a guild.');

		const settings = await prisma.guild.upsert({
			where: {
				id: guildId
			},
			update: {},
			create: {
				id: guildId
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

		const member = await globalClient.fetchMember({ guildId, userId });
		if (
			(globalConfig.adminUserIDs.includes(userId) && guildId === '342983479501389826') ||
			(options.reset && member && member.permissions.includes('ADMINISTRATOR'))
		) {
			await interaction.confirmation(
				'Are you sure you want to reset your megaduck back to Falador Park? This will reset all data, and where its been, and who has contributed steps.'
			);
			await Cache.updateGuild(guildId, {
				mega_duck_location: {
					...defaultMegaDuckLocation,
					steps: location.steps
				}
			});
		}

		const { image } = await makeImage(location);
		if (!direction) {
			return {
				content: `${user} Mega duck is at ${location.x}x ${location.y}y. You've moved it ${location.usersParticipated[user.id] ?? 0
					} times. ${await topFeeders(Object.entries(location.usersParticipated))}`,
				files: [{ buffer: image, name: 'megaduck.png' }]
			};
		}

		const cost = new Bank().add('Breadcrumbs');
		if (!user.owns(cost)) {
			return (`${user} The Mega Duck won't move for you, it wants some food.`);
		}

		let newLocation = applyDirection(location, direction);
		const newLocationResult = await makeImage(newLocation);
		if (newLocationResult.currentColor[3] !== 0) {
			return ("You can't move here.");
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
		await Cache.updateGuild(guildId, {
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
				} catch { }
			}
			const newT: MegaDuckLocation = {
				...newLocation,
				usersParticipated: {},
				placesVisited: [...newLocation.placesVisited, 'ocean']
			};
			await Cache.updateGuild(guildId, {
				mega_duck_location: newT as any
			});

			const guild = await globalClient.fetchGuild(guildId).catch(() => null);
			globalClient.emit(
				Events.ServerNotification,
				`The ${guild?.name ?? 'Unknown'} server just returned Mega Duck into the ocean with Mrs Duck, ${Object.keys(newLocation.usersParticipated).length
				} users received a Baby duckling pet. ${topFeeders(entries)}`
			);
			return `Mega duck has arrived at his destination! ${Object.keys(newLocation.usersParticipated).length
				} users received a Baby duckling pet. ${topFeeders(entries)}`;
		}
		return {
			content: `${user} You moved Mega Duck ${direction}! You've moved him ${newLocation.usersParticipated[user.id]
				} times. Removed ${cost} from your bank.${str}`,
			files: location.steps?.length % 2 === 0 ? [{ buffer: image, name: 'megaduck.png' }] : []
		};
	}
});
