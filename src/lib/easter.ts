import { randArrItem, roll } from 'e';
import { Bank } from 'oldschooljs';

import getOSItem from './util/getOSItem';

export const eggTypes = [
	'funny',
	'big',
	'small',
	'cute',
	'mysterious',
	'sweet',
	'bitter',
	'magic',
	'fancy',
	'ancient'
] as const;

export type EggType = (typeof eggTypes)[number];

const eggJokes = [
	'This egg is truly eggsceptional in taste and appearance.',
	'The shell-tacular design on this egg sets it apart from the rest.',
	'The yolk-tastic flavor of this egg makes it stand out in any dish.',
	'This eggstravagant creation showcases the beauty and versatility of eggs.',
	'The eggcredible texture of this egg makes it a delight to eat.',
	"This egg boasts an eggsplosive taste that's hard to forget.",
	"The egg is so eggstraordinarily delicious, it's like eating heaven.",
	'The eggstreme care put into creating this egg is evident in every bite.',
	"You'll be eggstatic when you taste the rich, yolky goodness of this egg.",
	'The eggceptionally vibrant colors make this decorated egg a true work of art.',
	'Eggscruciatingly delicious, this egg will make you crave more.',
	'The eggstra care put into poaching this egg results in a perfectly runny yolk.',
	'The eggspertly crafted design on this egg makes it a feast for the eyes.',
	'The eggsquisite presentation of this egg elevates it to a culinary masterpiece.',
	"This egg is so eggstravagantly presented, it's almost too beautiful to eat.",
	'With an eggsceptional balance of texture and taste, this egg is a must-try.',
	'The eggcentric approach to making this egg results in a unique and delightful flavor.',
	'This is eggsactly what you need to start your day off right.'
];

const invalidCombinations = [
	['big', 'small', "That doesn't make any sense."],
	['bitter', 'sweet', "That's not an actual thing you can make... how bittersweet..."]
] as const;

export function validateEggType(firstName: EggType, lastName: EggType) {
	if (!firstName || !lastName || !eggTypes.includes(firstName) || !eggTypes.includes(lastName)) {
		return 'Invalid egg types.';
	}

	if (firstName === lastName) {
		return "You can't make an egg with 2 of the same type.";
	}

	const bothNames = [firstName, lastName];

	for (const [first, second, message] of invalidCombinations) {
		if (bothNames.includes(first) && bothNames.includes(second)) {
			return message;
		}
	}

	return null;
}

export const keepEggs = [
	[
		'magic',
		'cute',
		getOSItem('Cute magic egg'),
		"That's a very cute magical egg - you should keep it. Take care of it."
	],
	['magic', 'fancy', getOSItem('Fancy magic egg')],
	['big', 'mysterious', getOSItem('Big mysterious egg')],
	['fancy', 'ancient', getOSItem('Fancy ancient egg')],
	['sweet', 'small', getOSItem('Sweet small egg')],
	['magic', 'mysterious', getOSItem('Mysterious magic egg')],
	['big', 'ancient', getOSItem('Big ancient egg')]
] as const;

const userEggMessages = new Map([
	['481438127630581800', 'It looks a bit doomy and gloomy...'],
	['300487398188384256', 'It looks a bit wicked...'],
	['664585536937132062', 'Are xroou serious?'],
	['338379155072745474', 'It looks masterfully made.'],
	['392069071077900289', 'Give the next one asun-as you are ready.'],
	['553025355670355976', 'It look very sweet and sugary.'],
	['549387519486328852', "It's a Round One."],
	['425134194436341760', 'It looks cyriouslly tasty.'],
	['182367150734966784', 'Make me 194827635426 more of these!'],
	['96789088073441280', "There's no bugz in this, right?"],
	['548028119144202240', "You didn't bake this, right?"],
	['415408084354072587', 'Thanks mate.'],
	['272586489030901781', "Please don't kill me."],
	['794368001856110594', 'It looks very tasty.'],
	['248733029353127936', 'It looks just right.'],
	['268767449791332354', "This is cannibalism, isn't it?"],
	['118082360200658944', 'BAWK BAWK BAWK.'],
	['561367540241137684', 'Hand the next egg in venya ready.'],
	['326568019310542851', 'Shellicious.'],
	['951937489923346533', "This is the best egg I've seen in my life"],
	['415283110494863380', 'Nice egg.'],
	['178237323157307392', 'This egg is dreamy.'],
	['254319203614588929', 'But why are you in a barrel?'],
	['178955491903406081', "I don't want to know where this egg came from."],
	['274295580539224064', 'Very artistic, which matters.'],
	['487119999362924544', 'Might need to wash my mouth after eating this...'],
	['493198674399068214', 'A very evil egg...'],
	['296438684994240513', 'It looks sacred...'],
	['194315025542938624', 'Luckily for you, I want more!'],
	['330402275904323587', 'Did you dupe this?'],
	['865388473888276491', 'Cute bunny!'],
	['209825195131797504', 'Good egg, even if it is quite small!'],
	['131104669383524353', 'Eggshinlent!'],
	['455691640359747605', 'Do you mind stepping off my tail, though?'],
	['232217824574177291', "I want more though, don't ghost me."],
	['197175909411717120', 'Very soulful.'],
	['212301122336063488', 'Looks lazily made.'],
	['188513561079840769', "I'm B."],
	['876192834246561894', '516 more, please.'],
	['202452446801428480', 'Make some more, and be hasty about it!'],
	['274973977934430210', 'Justas I ordered it.'],
	['397575724808273922', "You don't need to weld them though. Just use chocolate."],
	['274255896014749698', 'It smells swampy...'],
	['105033302313803776', 'Are you my dad?'],
	['279320058889502720', "I'm not going to engage further..."],
	['368933962514432000', 'I will not add a castlewars pet.'],
	['139243728278781952', "This egg is a loner on it's own though, get me more"],
	['194597029379309569', 'A lil egg.'],
	['370471745217495041', 'Do crows lay eggs?'],
	['294448484847976449', 'Bad yolk. Haha, get it?'],
	['216767458428715010', 'Are you kitten me right meow?'],
	['497738919803355161', 'No drinking on the job.'],
	['161537526253748224', "Hopefully nothing 'emme'rges from this egg."],
	['1023905404507394079', 'Get me more eggs, otherwise this one will be an outcast!'],
	['290319339104501760', 'K.'],
	['358333625378406403', "Don't be a slowpoke, get me more."],
	['493460691064193024', "You're very good, almost like a super.. soldier."],
	['315157260542279693', 'This is stephinitely one of the best eggs so far.'],
	['247919282275483649', 'I thought you changed your name...'],
	['335524019564707842', 'What do you have against ducks?'],
	['364949318005686282', "I'm getting old.. my nisa killing me."],
	['384543221130199041', 'Farm some more!'],
	['235883747658956802', "We're brawlin' time here, go make more!"],
	['433470856530755587', 'OOK OOK OOK'],
	['348971906768044033', 'A very dark egg.'],
	['164490892533563393', 'This egg is iconic.'],
	['507686806624534529', 'Ayy tone'],
	['132647937091043329', 'My name jeff.'],
	['269343001325600769', 'Pro work.'],
	['343215201870544907', 'A very purely crafted egg.'],
	['295326931417694212', 'Go hunt me more eggs!'],
	['610666234836418581', 'smugCat'],
	['248898439474184192', 'This looks more like a ruben sandwich than an egg...'],
	['302647855489875978', 'The easter bunny looks mad, mate.'],
	['365586476420825109', 'This egg was left out and got mossy.'],
	['331532617394421764', 'Mmm Rum, Ham, and eggs!'],
	['301524810763206658', 'This is the best egg iV seen in ages!'],
	['190287163844329473', 'The government approves this egg.'],
	['354873929522741248', 'Operator, this egg is particularly smooth!'],
	['268901875158351872', 'A crow steals this egg and hides it in the abyss.'],
	['974331525019611166', 'Is this egg covered in oil?']
]);

export async function eggNameEffect(user: MUser, firstName: EggType, lastName: EggType) {
	const bothNames = [firstName, lastName];

	for (const [firstName, lastName, item, customMessage] of keepEggs) {
		if ([firstName, lastName].every(type => bothNames.includes(type))) {
			await user.addItemsToBank({ items: new Bank().add(item), collectionLog: true });
			return customMessage ?? "There's something strange about this egg, you should keep it.";
		}
	}

	if (bothNames.includes('big')) {
		return 'This egg is too big.\n\n*Throws it away*';
	}

	if (bothNames.includes('funny')) {
		return `Thank you for the egg.\n\n${randArrItem(eggJokes)}`;
	}

	if (bothNames.includes('bitter')) {
		return 'This egg is too bitter.\n\n*Throws it away*';
	}

	const userMessage = userEggMessages.get(user.id);
	if (userMessage && roll(3)) {
		return `Thank you for the ${firstName} ${lastName} egg! ${userMessage}`;
	}
	return `Thank you for the ${firstName} ${lastName} egg!`;
}

export function encodeEggNames(_firstName: EggType, _lastName: EggType) {
	const [firstName, lastName] = [_firstName, _lastName].sort();
	return `${firstName}.${lastName}`;
}
export function decodeEggNames(eggName: string) {
	return eggName.split('.') as [EggType, EggType];
}
