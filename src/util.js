const fetch = require('node-fetch');

const { twitchClientID } = require('./config');

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
		'Client-ID': twitchClientID ?? '',
	},
};

async function resolveTwitchUsersFromNames(names) {
	return await fetch(
		`https://api.twitch.tv/kraken/users?login=${names.map(encodeURIComponent).join(',')}`,
		twitchAPIRequestOptions,
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

const formatDuration = ms => {
	if (ms < 0) ms = -ms;
	const time = {
		day: Math.floor(ms / 86400000),
		hour: Math.floor(ms / 3600000) % 24,
		minute: Math.floor(ms / 60000) % 60,
	};
	return Object.entries(time)
				 .filter(val => val[1] !== 0)
				 .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
				 .join(', ');
};

module.exports = {
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
	cmlErrorCheck,
	flatten,
	formatDuration,
};
