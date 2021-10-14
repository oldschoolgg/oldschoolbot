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

const colors: MixableColor[] = [
	{
		name: 'purple',
		keys: resolveItems(['Ruby key', 'Sapphire key'])
	},
	{
		name: 'yellow',
		keys: resolveItems(['Ruby key', 'Emerald key'])
	},
	{
		name: 'cyan',
		keys: resolveItems(['Sapphire key', 'Emerald key'])
	},
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

export function determineVictimAndMurderers(people: HalloweenPersonInstance[]) {
	// Victim is someone with a secondary color room
	const victim = people.find(p => ['purple', 'yellow', 'cyan'].includes(p.roomColor.name))!;
	let suspects = people.filter(i => i !== victim);
	const victimsRoom = victim.roomColor;
	console.log(`Victim has a ${victimsRoom.name} room, you need ${victimsRoom.keys.map(itemNameFromID)} to open it`);

	// Definitely innocent people
	const definitelyInnocent = [suspects[0]];
	const other = suspects.find(
		r =>
			['purple', 'yellow', 'cyan'].includes(r.roomColor.name) &&
			victimsRoom.keys.some(k => r.roomColor.keys.includes(k))
	);
	if (other && !definitelyInnocent.includes(other)) {
		definitelyInnocent.push(other);
	}
	suspects = suspects.filter(i => !definitelyInnocent.includes(i));

	const peopleWhoCanDirectlyOpenVictimsRoom = suspects.filter(i => i.roomColor === victimsRoom);
	const peopleWhoCanOpenItTogether: [HalloweenPersonInstance, HalloweenPersonInstance][] = [];
	for (const suspect of suspects) {
		for (const otherSuspect of suspects.filter(i => i !== suspect)) {
			const sharedKeys = [...suspect.roomColor.keys, ...otherSuspect.roomColor.keys];
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
		peopleWhoCanOpenItTogether,
		definitelyInnocent: definitelyInnocent.map(i => i.person.name)
	});
	return {
		victim,
		suspects,
		murderers: suspects.slice(0, 2)
	};
}

export function getHalloweenPeople(user: KlasaUser) {
	const people = shuffleRandom(Number(user.id), halloweenPeople);
	const roomColors = shuffleRandom(Number(user.id), colors);
	const longerColors = [...roomColors, ...roomColors, ...roomColors];
	const peopleInstances: HalloweenPersonInstance[] = people.map((person, index) => ({
		person,
		roomColor: longerColors[index]
	}));
	const { suspects, victim, murderers } = determineVictimAndMurderers(peopleInstances);

	return { suspects, victim, murderers };
}
