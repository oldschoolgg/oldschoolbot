import { KlasaUser } from 'klasa';

import { shuffleRandom } from '../extendables/User/CollectionLog';
import { itemNameFromID } from './util';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

interface HalloweenPerson {
	name: string;
	gender: 'male' | 'female';
	word: string;
}

const halloweenPeople: readonly HalloweenPerson[] = [
	{
		name: 'Hewey',
		gender: 'male',
		word: 'hanged'
	},
	{
		name: 'Silas',
		gender: 'male',
		word: 'slaughtered'
	},
	{
		name: 'Ben',
		gender: 'male',
		word: 'beaten'
	},
	{
		name: 'Abigale',
		gender: 'female',
		word: 'axed'
	},
	{
		name: 'Lauren',
		gender: 'female',
		word: 'lacerated'
	},
	{
		name: 'Mandy',
		gender: 'female',
		word: 'murdered'
	}
];

export const keys = [
	{
		item: getOSItem('Ruby key'),
		color: 'red'
	},
	{
		item: getOSItem('Emerald key'),
		color: 'green'
	},
	{
		item: getOSItem('Sapphire key'),
		color: 'blue'
	}
] as const;

type Color = 'purple' | 'yellow' | 'cyan' | 'blue' | 'red' | 'green';

interface HalloweenPersonInstance {
	person: HalloweenPerson;
	roomColor: MixableColor;
}

interface MixableColor {
	name: Color;
	keys: number[];
}

const secondaryColors: MixableColor[] = [
	{
		name: 'purple',
		keys: resolveItems(['Sapphire key', 'Ruby key'])
	},
	{
		name: 'yellow',
		keys: resolveItems(['Ruby key', 'Emerald key'])
	},
	{
		name: 'cyan',
		keys: resolveItems(['Emerald key', 'Sapphire key'])
	}
];

const primaryColors: MixableColor[] = [
	{
		name: 'blue',
		keys: resolveItems(['Sapphire key'])
	},
	{
		name: 'red',
		keys: resolveItems(['Ruby key'])
	},
	{
		name: 'green',
		keys: resolveItems(['Emerald key'])
	}
];

export function determineVictimAndMurderers(user: KlasaUser) {
	const people = shuffleRandom(Number(user.id), halloweenPeople);

	const _secondaryColors = shuffleRandom(Number(user.id), secondaryColors);
	const basePrimaryColors = shuffleRandom(Number(user.id), primaryColors);
	const _primaryColors = [...basePrimaryColors, ...basePrimaryColors, ...basePrimaryColors];

	const victim: HalloweenPersonInstance = { person: people[0], roomColor: _secondaryColors[0] };
	const suspects: HalloweenPersonInstance[] = people
		.filter(i => i !== victim.person)
		.map((person, index) => ({ person, roomColor: _primaryColors[index] }));

	const victimsRoom = victim.roomColor;
	console.log(`Victim has a ${victimsRoom.name} room, you need ${victimsRoom.keys.map(itemNameFromID)} to open it`);

	const peopleWhoCanDirectlyOpenVictimsRoom = suspects.filter(i => i.roomColor === victimsRoom);
	const peopleWhoCanOpenItTogether: [HalloweenPersonInstance, HalloweenPersonInstance][] = [];
	for (const suspect of suspects) {
		for (const otherSuspect of suspects.filter(i => i !== suspect)) {
			const sharedKeys = [...suspect.roomColor.keys, ...otherSuspect.roomColor.keys];
			if (peopleWhoCanOpenItTogether.some(pair => pair.includes(suspect) && pair.includes(otherSuspect))) {
				continue;
			}
			if (victimsRoom.keys.every(key => sharedKeys.includes(key))) {
				peopleWhoCanOpenItTogether.push([suspect, otherSuspect]);
				console.log(
					`${suspect.person.name}[${suspect.roomColor.name}] and ${otherSuspect.person.name}[${otherSuspect.roomColor.name}]`
				);
			}
		}
	}
	console.log({
		peopleWhoCanDirectlyOpenVictimsRoom,
		peopleWhoCanOpenItTogether
	});
	return {
		victim,
		suspects,
		murderers: suspects.slice(0, 2)
	};
}

export function getHalloweenPeople(user: KlasaUser) {
	const { suspects, victim, murderers } = determineVictimAndMurderers(user);

	return { suspects, victim, murderers };
}
