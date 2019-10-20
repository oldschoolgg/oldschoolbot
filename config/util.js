const fetch = require('node-fetch');

const { twitchClientID } = require('./private');

const trRegex = /<table class="server-list">/;
const whiteSpace = /\s/;

const parseTable = html => {
	const result = trRegex.exec(html);
	if (!result) return null;

	const extracted = extractHTML(html.slice(result.index));
	return extracted.children[1].children.map(ch => ({
		name: ch.children[0].children[0].content,
		players: ch.children[1].content,
		country: ch.children[2].content,
		type: ch.children[3].content,
		activity: ch.children[4].content
	}));
};

const extractHTML = html => {
	html = html.trim();
	const tagName = html.slice(1, html.indexOf(' '));
	const endOfOpeningTag = html.indexOf('>', tagName.length) + 1;
	const attributes = html.slice(2 + tagName.length, endOfOpeningTag - 1);

	let char;
	let hasStarted = false;
	let buffer = '';
	const children = [];
	let i = endOfOpeningTag - 1;
	while (++i < html.length) {
		char = html[i];
		if (!hasStarted && whiteSpace.test(char)) continue;
		if (char === '<') {
			if (html[i + 1] === '/') {
				const index = html.indexOf('>', i + 1);
				if (index !== -1) i += index - i + 1;
				break;
			}
			const extracted = extractHTML(html.slice(i - 1, html.length).trim());
			i += extracted.tagLength;
			children.push(extracted);
			hasStarted = false;
			continue;
		}
		hasStarted = true;
		buffer += char;
	}

	return {
		tagName,
		attributes,
		tagLength: i,
		content: buffer,
		children
	};
};

const convertLVLtoXP = lvl => {
	let points = 0;

	for (let i = 1; i < lvl; i++) {
		points += Math.floor(i + 300 * Math.pow(2, i / 7));
	}

	return Math.floor(points / 4);
};

const convertXPtoLVL = (xp, cap = 99) => {
	let points = 0;

	for (let lvl = 1; lvl <= cap; lvl++) {
		points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));

		if (Math.floor(points / 4) >= xp + 1) {
			return lvl;
		}
	}

	return cap;
};

const xpLeft = xp => {
	const level = convertXPtoLVL(xp);
	if (level === 99) return 0;
	return (convertLVLtoXP(level + 1) - xp).toLocaleString();
};

function roll(max) {
	return Math.floor(Math.random() * max + 1) === 1;
}

function cleanString(str) {
	return str.replace(/[^0-9a-zA-Z]/gi, '').toUpperCase();
}

function fmNum(num) {
	if (num) return num.toLocaleString();
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

const twitchAPIRequestOptions = {
	headers: {
		Accept: 'application/vnd.twitchtv.v5+json',
		'Client-ID': twitchClientID
	}
};

async function resolveTwitchUsersFromNames(names) {
	return await fetch(
		`https://api.twitch.tv/kraken/users?login=${names.map(encodeURIComponent).join(',')}`,
		twitchAPIRequestOptions
	)
		.then(response => response.json())
		.then(res => res.users || [])
		.catch(err => {
			throw err;
		});
}

function toTitleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (let i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}

function cbLevelFromPlayer({ Defence, Strength, Attack, Ranged, Magic, Prayer, Hitpoints }) {
	const base = 0.25 * (Defence.level + Hitpoints.level + Math.floor(Prayer.level / 2));
	const melee = 0.325 * (Attack.level + Strength.level);
	const range = 0.325 * (Math.floor(Ranged.level / 2) + Ranged.level);
	const mage = 0.325 * (Math.floor(Magic.level / 2) + Magic.level);
	return Math.floor(base + Math.max(melee, range, mage));
}

function cmlErrorCheck(res) {
	switch (res.replace(/\s/g, '')) {
		case '-1':
			throw 'That user does not exist in the CrystalMathLabs database. Have you tried using +update?';
		case '-2':
			throw 'That username is invalid.';
		case '-3':
		case '-4':
			throw 'The CrystalMathLabs API is currently offline. Please try again in 5 minutes.';
		default:
			return null;
	}
}

function flatten(arr) {
	return arr.reduce((flat, toFlatten) => {
		return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
	}, []);
}

module.exports = {
	extractHTML,
	parseTable,
	convertLVLtoXP,
	xpLeft,
	convertXPtoLVL,
	roll,
	cleanString,
	fmNum,
	rand,
	resolveTwitchUsersFromNames,
	twitchAPIRequestOptions,
	toTitleCase,
	cbLevelFromPlayer,
	cmlErrorCheck,
	flatten
};
