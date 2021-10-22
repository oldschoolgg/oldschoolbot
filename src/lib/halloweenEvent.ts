import { shuffleRandom } from '../extendables/User/CollectionLog';
import getOSItem from './util/getOSItem';
import resolveItems from './util/resolveItems';

interface HalloweenPerson {
	name: string;
	gender: 'male' | 'female';
	word: string;
}

export const halloweenPeople: readonly HalloweenPerson[] = [
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

export function determineVictimAndMurderers(number: number) {
	const people = shuffleRandom(number, halloweenPeople);

	const _secondaryColors = shuffleRandom(number, secondaryColors);
	const basePrimaryColors = shuffleRandom(number, primaryColors);
	const _primaryColors = [...basePrimaryColors, ...basePrimaryColors, ...basePrimaryColors];

	const victim: HalloweenPersonInstance = { person: people[0], roomColor: _secondaryColors[0] };
	const suspects: HalloweenPersonInstance[] = [];
	const shuffledPeople = shuffleRandom(
		number,
		people.filter(i => i !== victim.person)
	);
	for (const person of shuffledPeople) {
		if (suspects.some(i => i.person === person)) continue;
		const color = _primaryColors[suspects.length];
		suspects.push({ person, roomColor: color });
	}

	const victimsRoom = victim.roomColor;

	const peopleWhoCanDirectlyOpenVictimsRoom = suspects.filter(i => i.roomColor === victimsRoom);
	const peopleWhoCanOpenItTogether: [HalloweenPersonInstance, HalloweenPersonInstance][] = [];
	const witnessedAsInnocent: HalloweenPersonInstance[] = [];

	for (const suspect of suspects) {
		for (const otherSuspect of suspects.filter(i => i !== suspect)) {
			const sharedKeys = [...suspect.roomColor.keys, ...otherSuspect.roomColor.keys];
			if (peopleWhoCanOpenItTogether.some(pair => pair.includes(suspect) && pair.includes(otherSuspect))) {
				continue;
			}
			if (victimsRoom.keys.every(key => sharedKeys.includes(key))) {
				if (peopleWhoCanOpenItTogether.length === 1) {
					witnessedAsInnocent.push(
						...[suspect, otherSuspect].filter(
							sus =>
								peopleWhoCanOpenItTogether.every(gr => !gr.includes(sus)) &&
								!witnessedAsInnocent.includes(sus)
						)
					);
				} else {
					peopleWhoCanOpenItTogether.push([suspect, otherSuspect]);
				}
			}
		}
	}

	const murderers = peopleWhoCanOpenItTogether[0];
	if (peopleWhoCanDirectlyOpenVictimsRoom.length > 0) {
		throw new Error('Can open directly');
	}
	if (peopleWhoCanOpenItTogether.length > 1) {
		throw new Error('More than 1 pair can open');
	}
	if (suspects.length !== 5) {
		throw new Error(`Was ${suspects.length} suspects`);
	}
	if (murderers.length !== 2) {
		throw new Error(`Was ${murderers.length} suspects`);
	}
	return {
		victim,
		suspects,
		murderers,
		witnessedAsInnocent
	};
}

export function getHalloweenPeople(number: number) {
	const { suspects, victim, murderers, witnessedAsInnocent } = determineVictimAndMurderers(number);

	return { suspects, victim, murderers, witnessedAsInnocent };
}
